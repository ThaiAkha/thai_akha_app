// supabase/functions/submit-contact/index.ts
//
// Il form contatti pubblico passa DA QUI e non scrive piu' in tabella.
//
// Perche': fino al 2026-09-09 `ContactForm` faceva un INSERT diretto in
// `contact_messages` con la chiave anon, e la policy guardava solo le lunghezze.
// Un captcha nel browser sarebbe stato decorativo: chi abusa non usa il form,
// chiama l'API REST. Qui si verifica il gettone Turnstile, si rivalidano le
// lunghezze (col service_role la RLS non vale piu') e si inserisce. La policy
// `anon can insert` viene tolta da /database DOPO il deploy di questa funzione
// e del form: prima, il form si romperebbe.
//
// Il trigger che manda la notifica (`send-contact-notification`) parte da solo
// sull'INSERT: qui non si tocca.
//
// Secret: TURNSTILE_SECRET_KEY. Se NON e' impostato la verifica si salta con un
// avviso nei log, cosi' l'ordine deploy → chiavi non rompe il form; quando c'e',
// un gettone mancante o rifiutato blocca la scrittura.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { clientIp, rateLimit } from '../_shared/edgeGuard.ts';
import { checkContact } from './validate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
/** Un indirizzo IP puo' mandare 10 messaggi all'ora: largo per una famiglia, stretto per uno script. */
const MAX_PER_HOUR = 10;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

/** true se il gettone e' valido (o se non c'e' segreto configurato: vedi intestazione). */
async function verifyTurnstile(token: string, ip: string): Promise<{ ok: boolean; reason?: string }> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) {
    console.warn('[submit-contact] TURNSTILE_SECRET_KEY non impostato: verifica saltata');
    return { ok: true };
  }
  if (!token) return { ok: false, reason: 'missing token' };
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch(TURNSTILE_URL, { method: 'POST', body: form });
    const data = await res.json() as { success?: boolean; 'error-codes'?: string[] };
    return data.success ? { ok: true } : { ok: false, reason: (data['error-codes'] ?? ['rejected']).join(',') };
  } catch (err) {
    // Cloudflare irraggiungibile: si rifiuta, non si apre. Un form contatti puo'
    // aspettare, una porta aperta no.
    console.error('[submit-contact] siteverify non raggiungibile:', err instanceof Error ? err.message : err);
    return { ok: false, reason: 'verification unavailable' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, MAX_PER_HOUR, 60 * 60_000)) {
    return json({ error: 'Too many messages. Please try again later.' }, 429);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return json({ error: 'invalid body' }, 400);
  }

  const check = checkContact(payload);
  if (!check.ok) {
    // Esca compilata: si risponde bene e non si scrive niente, cosi' il robot
    // non impara la differenza fra un successo e un rifiuto.
    if ('silent' in check) return json({ ok: true });
    return json({ error: check.error }, 400);
  }

  const verdict = await verifyTurnstile(typeof payload.token === 'string' ? payload.token : '', ip);
  if (!verdict.ok) {
    console.warn('[submit-contact] gettone rifiutato:', verdict.reason);
    return json({ error: 'verification failed' }, 403);
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from('contact_messages').insert({ ...check.value, source: 'front_app' });
  if (error) {
    console.error('[submit-contact] insert:', error.message);
    return json({ error: 'could not save' }, 500);
  }
  return json({ ok: true });
});
