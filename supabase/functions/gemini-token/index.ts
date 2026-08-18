import { GoogleGenAI } from 'npm:@google/genai@^1';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { clientIp, rateLimit } from '../_shared/edgeGuard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // x-cherry-token: il client Supabase lo inietta globalmente (RLS guest chat) → va
  // permesso qui altrimenti il preflight blocca la richiesta (voce Cherry via CORS).
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cherry-token',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── AUTENTICAZIONE OPZIONALE ───────────────────────────────────────────────
    // Cherry è disponibile anche agli ospiti non loggati.
    // Se il JWT è presente, lo verifichiamo per logging e rate limiting futuro.
    // Se non è presente, la richiesta è permessa come guest.
    const authHeader = req.headers.get('Authorization');
    let userId = 'guest';

    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        userId = user.id;
      }
    }

    // ── METERING GUEST (audit 2026-08 #85) ────────────────────────────────────
    // Ogni token apre una sessione Gemini Live (costosa). Anonimi: 12 token/ora per IP.
    if (userId === 'guest' && !rateLimit(`voice-guest:${clientIp(req)}`, 12, 60 * 60_000)) {
      return new Response(
        JSON.stringify({ error: 'Too many voice sessions. Please try again later, or sign in.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── GENERA TOKEN EFFIMERO ─────────────────────────────────────────────────
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[gemini-token] ❌ GEMINI_API_KEY secret is not set!');
      return new Response(
        JSON.stringify({ error: 'Server configuration error kha.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });

    const expireTime = new Date(Date.now() + 30 * 60 * 1000);          // 30 minuti
    const newSessionExpireTime = new Date(Date.now() + 29 * 60 * 1000); // 29 minuti (allineato alla cache 25min)

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: expireTime.toISOString(),
        newSessionExpireTime: newSessionExpireTime.toISOString(),
      },
    });

    if (!token.name) {
      throw new Error('Google API returned an empty token name.');
    }

    console.log(`[gemini-token] ✅ Token issued for: ${userId}`);

    return new Response(
      JSON.stringify({ ephemeralToken: token.name }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[gemini-token] ❌ Error:', message);
    return new Response(
      JSON.stringify({ error: `Failed to generate token: ${message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
