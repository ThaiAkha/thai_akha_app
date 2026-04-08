// supabase/functions/gemini-proxy-chat/index.ts
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.21.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatPayload {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  systemInstruction?: string;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Verify JWT and extract user ID from Authorization header
 */
const verifyAuth = async (authHeader?: string): Promise<{ userId: string | null; isGuest: boolean }> => {
  if (!authHeader) {
    return { userId: null, isGuest: true };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return { userId: user.id, isGuest: false };
    }
  } catch (error) {
    console.warn('[gemini-proxy-chat] Auth verification failed:', error);
  }

  return { userId: null, isGuest: true };
};

/**
 * Check rate limits per user or guest session
 */
const checkRateLimit = async (
  userId: string | null,
  supabaseService: ReturnType<typeof createClient>
): Promise<RateLimitResult> => {
  if (userId) {
    // VIP: utente con prenotazione confermata — nessun limite
    const { data: hasBooking } = await supabaseService
      .from('bookings')
      .select('internal_id')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .limit(1)
      .maybeSingle();

    if (hasBooking) return { allowed: true };

    // Utente loggato normale: max 30 messaggi/giorno
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: sessionData } = await supabaseService
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('last_activity', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionData) {
      const { count } = await supabaseService
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_role', 'user')
        .gte('created_at', oneDayAgo)
        .eq('session_id', sessionData.id);

      if (count && count >= 30) {
        return {
          allowed: false,
          reason: 'Daily limit reached. Come back tomorrow or book a class!',
        };
      }
    }

    return { allowed: true };
  }

  // Guests don't have rate limits per session in this implementation
  return { allowed: true };
};

/**
 * Log structured metrics (no sensitive data)
 */
const logMetrics = (
  userId: string | null,
  messageLength: number,
  responseLength: number,
  durationMs: number,
  success: boolean,
  error?: string
) => {
  const timestamp = new Date().toISOString();
  const message = {
    timestamp,
    userId: userId || 'guest',
    messageLength,
    responseLength,
    durationMs,
    success,
    ...(error && { error }),
  };
  console.log('[gemini-proxy-chat]', JSON.stringify(message));
};

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── PARSE REQUEST ──────────────────────────────────────────────────────
    const payload: ChatPayload = await req.json();
    const { message, history = [], systemInstruction } = payload;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'message field is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── AUTHENTICATION ────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    const { userId, isGuest } = await verifyAuth(authHeader);

    // ── RATE LIMIT CHECK ──────────────────────────────────────────────────
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const rateLimitResult = await checkRateLimit(userId, supabaseService);
    if (!rateLimitResult.allowed) {
      logMetrics(userId, message.length, 0, Date.now() - startTime, false, 'Rate limit exceeded');
      return new Response(
        JSON.stringify({ error: rateLimitResult.reason || 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── LOAD GEMINI API KEY ───────────────────────────────────────────────
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[gemini-proxy-chat] ❌ GEMINI_API_KEY secret is not set!');
      logMetrics(userId, message.length, 0, Date.now() - startTime, false, 'Missing API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error kha.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── INITIALIZE GEMINI CLIENT ──────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: systemInstruction,
    });

    // ── BUILD CONVERSATION HISTORY ────────────────────────────────────────
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts }],
    }));

    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // ── CALL GEMINI WITH TIMEOUT ──────────────────────────────────────────
    const timeoutId = setTimeout(() => { /* best-effort timeout */ }, 15_000);
    const wantsStream = new URL(req.url).searchParams.get('stream') === '1';

    try {
      const chat = model.startChat({ history: conversationHistory.slice(0, -1) });

      if (wantsStream) {
        // ── STREAMING PATH ────────────────────────────────────────────────
        const streamResult = await chat.sendMessageStream(message);
        const readable = new ReadableStream({
          async start(controller) {
            let fullText = '';
            try {
              for await (const chunk of streamResult.stream) {
                const text = chunk.text();
                if (text) {
                  fullText += text;
                  controller.enqueue(new TextEncoder().encode(text));
                }
              }
            } finally {
              clearTimeout(timeoutId);
              logMetrics(userId, message.length, fullText.length, Date.now() - startTime, true);
              controller.close();
            }
          },
        });
        return new Response(readable, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // ── NON-STREAMING PATH (used by auto-summary etc.) ────────────────
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();

      clearTimeout(timeoutId);
      logMetrics(userId, message.length, responseText.length, Date.now() - startTime, true);

      return new Response(
        JSON.stringify({ response: responseText }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const durationMs = Date.now() - startTime;

    // Don't log userId for error cases to avoid sensitive data leaks
    console.error('[gemini-proxy-chat] ❌ Error:', message);
    logMetrics(null, 0, 0, durationMs, false, message);

    const status = message.includes('timeout') || message.includes('abort') ? 504 : 500;
    return new Response(
      JSON.stringify({ error: `Failed to generate response: ${message}` }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
