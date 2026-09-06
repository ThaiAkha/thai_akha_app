// supabase/functions/gemini-proxy-chat/index.ts
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.21.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { clientIp, rateLimit } from '../_shared/edgeGuard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatPayload {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
  systemInstruction?: string;
  /** Lingua dell'interfaccia del client: solo per le metriche. */
  lang?: string;
}

// ── Tetti (audit Cherry 2026-09-06) ─────────────────────────────────────────
// Prima nessun campo aveva un limite: chiunque con la chiave anon poteva mandare
// un system prompt da megabyte e farlo pagare a noi. I numeri sono larghi per
// l'uso vero (il prompt di Cherry sta sotto i 40.000 caratteri) e stretti per
// l'abuso.
const MAX_MESSAGE_CHARS = 4_000;
const MAX_SYSTEM_CHARS = 120_000;
const MAX_HISTORY_ITEMS = 12;
const MAX_HISTORY_PART_CHARS = 4_000;
/**
 * Tetto di sicurezza contro le risposte fuori controllo, NON la misura di una
 * risposta: su Gemini 3 i token di ragionamento si scalano da qui, e con 1.024
 * (primo valore) una risposta poteva uscire vuota o tronca con stato di
 * successo. 8.192 lascia spazio al ragionamento; `finish` nei log dice se il
 * tetto viene toccato davvero.
 */
const MAX_OUTPUT_TOKENS = 8_192;
/** Tempo massimo per una risposta, primo token compreso. Prima il timer non fermava nulla. */
const GEMINI_TIMEOUT_MS = 30_000;
/** Il modello si cambia da secret, senza redeploy. */
const CHAT_MODEL = Deno.env.get('GEMINI_CHAT_MODEL') || 'gemini-3-flash-preview';

interface TokenUsage {
  prompt?: number;
  output?: number;
  cached?: number;
  thoughts?: number;
}

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Verify JWT and extract user ID from Authorization header
 */
const verifyAuth = async (authHeader?: string | null): Promise<{ userId: string | null; isGuest: boolean }> => {
  // La chiave anon non e' un utente: chiederlo a GoTrue costava un giro di rete
  // (con risposta "nessun utente") per ogni messaggio di ogni ospite.
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authHeader || (anonKey && authHeader === `Bearer ${anonKey}`)) {
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
  error?: string,
  extra?: { usage?: TokenUsage; lang?: string; model?: string; finish?: string }
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
    // Token veri di Gemini (prompt / risposta / serviti dalla cache): senza
    // questi numeri ogni discorso sul costo del prompt era una stima.
    ...(extra?.usage && { usage: extra.usage }),
    ...(extra?.lang && { lang: extra.lang }),
    ...(extra?.model && { model: extra.model }),
    ...(extra?.finish && { finish: extra.finish }),
  };
  console.log('[gemini-proxy-chat]', JSON.stringify(message));
};

const readUsage = (
  u?: { promptTokenCount?: number; candidatesTokenCount?: number; cachedContentTokenCount?: number; thoughtsTokenCount?: number },
): TokenUsage | undefined =>
  u ? { prompt: u.promptTokenCount, output: u.candidatesTokenCount, cached: u.cachedContentTokenCount, thoughts: u.thoughtsTokenCount } : undefined;

/** Perche' il modello si e' fermato (STOP, MAX_TOKENS, SAFETY...): dai candidati della risposta aggregata. */
const readFinish = (r: { candidates?: Array<{ finishReason?: string }> }): string | undefined =>
  r.candidates?.[0]?.finishReason;

/**
 * Lo storico nella forma che il modello accetta: si parte da 'user', i ruoli si
 * alternano, si chiude con 'model' (il messaggio corrente lo aggiunge sendMessage).
 * Gemello di `packages/shared/src/lib/cherryHistory.ts`: il client manda gia'
 * uno storico buono, qui si raddrizza comunque, perche' la chiave anon la
 * possiede chiunque. Se cambia una regola, cambia in tutti e due i posti.
 */
const normalizeHistory = (
  history: ChatPayload['history'],
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> => {
  const out: Array<{ role: 'user' | 'model'; text: string }> = [];
  for (const h of (history ?? []).slice(-MAX_HISTORY_ITEMS)) {
    const text = typeof h?.parts === 'string' ? h.parts.trim().slice(0, MAX_HISTORY_PART_CHARS) : '';
    if (!text) continue;
    const role = h.role === 'user' ? 'user' : 'model';
    const last = out[out.length - 1];
    if (last && last.role === role) last.text += `\n${text}`;
    else out.push({ role, text });
  }
  while (out.length > 0 && out[0].role !== 'user') out.shift();
  while (out.length > 0 && out[out.length - 1].role !== 'model') out.pop();
  return out.map((h) => ({ role: h.role, parts: [{ text: h.text }] }));
};

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── PARSE REQUEST ──────────────────────────────────────────────────────
    const payload: ChatPayload = await req.json();
    const { message, history = [], systemInstruction, lang } = payload;

    // Tipi controllati a runtime: il tipo TypeScript del payload non ferma
    // nessuno, e un oggetto al posto della stringa passava il tetto (`.length`
    // undefined) e arrivava a Gemini per intero.
    const rejected =
      !message || typeof message !== 'string' ? 'message field is required'
      : message.length > MAX_MESSAGE_CHARS ? `message longer than ${MAX_MESSAGE_CHARS} characters`
      : systemInstruction !== undefined && typeof systemInstruction !== 'string' ? 'systemInstruction must be a string'
      : (systemInstruction?.length ?? 0) > MAX_SYSTEM_CHARS ? 'systemInstruction too long'
      : !Array.isArray(history) ? 'history must be an array'
      : lang !== undefined && (typeof lang !== 'string' || lang.length > 8) ? 'lang must be a short string'
      : null;
    if (rejected) {
      return new Response(
        JSON.stringify({ error: rejected }),
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

    // Guest (nessun JWT): metering per IP (audit 2026-08 #85). Prima era illimitato →
    // spesa Gemini scoperta per chiunque con la anon key. 90 msg/ora per IP: largo per
    // un wifi d'hotel condiviso, stretto per uno script.
    if (isGuest && !rateLimit(`chat-guest:${clientIp(req)}`, 90, 60 * 60_000)) {
      logMetrics(userId, message.length, 0, Date.now() - startTime, false, 'Guest rate limit');
      return new Response(
        JSON.stringify({ error: 'Too many messages. Please try again in a while, or sign in.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      model: CHAT_MODEL,
      systemInstruction: systemInstruction,
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

    // ── CONVERSATION HISTORY ──────────────────────────────────────────────
    // Nella forma nativa del modello (prima viaggiava come testo nel prompt).
    // Il messaggio corrente lo aggiunge sendMessage: qui solo i turni passati.
    const conversationHistory = normalizeHistory(history);

    // ── CALL GEMINI WITH TIMEOUT ──────────────────────────────────────────
    // Un timer vero: prima c'era un setTimeout con il corpo vuoto, che non
    // fermava niente. Il segnale ferma sia la chiamata sia lo stream.
    const abort = new AbortController();
    const timeoutId = setTimeout(() => abort.abort(), GEMINI_TIMEOUT_MS);
    const wantsStream = new URL(req.url).searchParams.get('stream') === '1';
    const metricsExtra = { lang, model: CHAT_MODEL };
    // Nel ramo stream il timer lo spegne lo stream stesso: il `finally` in fondo
    // scatta al `return new Response(readable)`, cioe' PRIMA che il corpo
    // cominci, e avrebbe lasciato scoperto proprio il tratto lungo.
    let streaming = false;

    try {
      const chat = model.startChat({ history: conversationHistory });

      if (wantsStream) {
        // ── STREAMING PATH ────────────────────────────────────────────────
        const streamResult = await chat.sendMessageStream(message, { signal: abort.signal });
        const readable = new ReadableStream({
          async start(controller) {
            let fullText = '';
            let usage: TokenUsage | undefined;
            let finish: string | undefined;
            let failure: unknown = null;
            try {
              for await (const chunk of streamResult.stream) {
                const text = chunk.text();
                if (text) {
                  fullText += text;
                  controller.enqueue(new TextEncoder().encode(text));
                }
              }
              const aggregated = await streamResult.response;
              usage = readUsage(aggregated.usageMetadata);
              finish = readFinish(aggregated);
              // Nessun testo con una ragione di stop: tetto raggiunto dal solo
              // ragionamento o blocco di sicurezza. Non e' una risposta.
              if (!fullText) throw new Error(`empty answer (${finish ?? 'no candidate'})`);
            } catch (err) {
              failure = err;
            }
            clearTimeout(timeoutId);
            if (failure && !fullText) {
              // Niente consegnato: errore vero, il client lo tratta come tale.
              const reason = failure instanceof Error ? failure.message : 'stream failed';
              logMetrics(userId, message.length, 0, Date.now() - startTime, false, reason, metricsExtra);
              controller.error(failure);
              return;
            }
            if (failure) {
              // A meta' risposta si consegna quello che c'e' (timeout o rete).
              console.warn('[gemini-proxy-chat] stream interrotto, consegno il parziale:', failure instanceof Error ? failure.message : failure);
            }
            logMetrics(userId, message.length, fullText.length, Date.now() - startTime, true, undefined, { ...metricsExtra, usage, finish });
            controller.close();
          },
        });
        streaming = true;
        return new Response(readable, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // ── NON-STREAMING PATH (used by auto-summary etc.) ────────────────
      const result = await chat.sendMessage(message, { signal: abort.signal });
      const response = await result.response;
      const responseText = response.text();
      const finish = readFinish(response);
      if (!responseText) throw new Error(`empty answer (${finish ?? 'no candidate'})`);

      clearTimeout(timeoutId);
      logMetrics(userId, message.length, responseText.length, Date.now() - startTime, true, undefined, { ...metricsExtra, usage: readUsage(response.usageMetadata), finish });

      return new Response(
        JSON.stringify({ response: responseText }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      if (!streaming) clearTimeout(timeoutId);
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
