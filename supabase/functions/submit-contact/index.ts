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
// Secret: TURNSTILE_SECRET_KEY. Se NON e' impostato la funzione RIFIUTA con 503:
// lo stato senza verifica non si raggiunge per assenza, si chiede con un secret
// esplicito `TURNSTILE_BYPASS=true`, che si vede nell'elenco dei secret.
//
// Perche' cosi' e non "salto la verifica se manca il segreto" (era la prima
// versione, cambiata su richiesta di /database con un argomento che sta in
// questo repository): `check_chat_rate_limit` porta da mesi il commento "BYPASS
// TEMPORANEO - rimuovere queste 2 righe per riattivare i limiti", e le due righe
// sono ancora li'. Un ramo che disattiva una difesa e si giustifica come
// temporaneo, qui, e' gia' sopravvissuto una volta. In piu' la finestra da
// proteggere quasi non esiste: il widget ha bisogno della chiave PUBBLICA per
// produrre un gettone, e quella entra nel bundle al build, quindi senza chiavi
// il form non funziona comunque. L'effetto collaterale invece era permanente: un
// segreto ruotato male o cancellato avrebbe riaperto la porta IN SILENZIO, e
// dopo la migration non c'e' piu' nemmeno la policy a fare da rete.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { clientIp, rateLimit } from '../_shared/edgeGuard.ts';
import { checkContact } from './validate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
/** Strada alternativa da dare al visitatore se il form non e' disponibile. */
const OFFICE_EMAIL = 'office@thaiakhakitchen.com';
/** Un indirizzo IP puo' mandare 10 messaggi all'ora: largo per una famiglia, stretto per uno script. */
const MAX_PER_HOUR = 10;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

/** true se il gettone e' valido. Il segreto arriva gia' verificato dal chiamante. */
async function verifyTurnstile(secret: string, token: string, ip: string): Promise<{ ok: boolean; reason?: string }> {
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

  // Configurazione prima di tutto: un form senza verifica non e' un form, e' una
  // porta. Se manca il segreto si risponde 503 con una strada alternativa, a meno
  // che qualcuno non abbia chiesto il salto con un secret esplicito.
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';
  const bypass = Deno.env.get('TURNSTILE_BYPASS') === 'true';
  if (!secret && !bypass) {
    console.error('[submit-contact] TURNSTILE_SECRET_KEY assente: form chiuso (503)');
    return json({ error: 'form unavailable', contact: OFFICE_EMAIL }, 503);
  }
  if (bypass) console.warn('[submit-contact] TURNSTILE_BYPASS=true: verifica DISATTIVATA di proposito');

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

  const verdict = bypass && !secret
    ? { ok: true }
    : await verifyTurnstile(secret, typeof payload.token === 'string' ? payload.token : '', ip);
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
