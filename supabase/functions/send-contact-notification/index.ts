// Path: supabase/functions/send-contact-notification/index.ts
// Notifica interna per il contact form (#120): un INSERT in contact_messages
// deve produrre un'email alla casella operativa entro 1 minuto.
// Innescata dal trigger AFTER INSERT "send-contact-notification" su contact_messages
// (supabase_functions.http_request, stesso pattern del trigger booking); tollera
// anche l'invoke manuale con { id } per i test.
// Legge la riga via service-role (mai fidarsi del payload del webhook oltre l'id),
// monta il template office e invia con Resend. Reply-To = email del visitatore,
// cosi' lo staff risponde con un semplice Reply.
// Destinatario: secret CONTACT_NOTIFY_TO (deciso dall'owner, MAI hardcoded qui).

import { createClient } from 'npm:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const CONTACT_NOTIFY_TO = Deno.env.get('CONTACT_NOTIFY_TO')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'
const TABLE_EDITOR_URL =
  'https://supabase.com/dashboard/project/mtqullobcsypkqgdkaob/editor'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactMessage {
  id: string
  created_at: string
  name: string
  email: string
  topic: string
  message: string
  status: string
  source: string
}

interface ReqPayload {
  id?: string
  record?: { id?: string } // payload da Database Webhook (INSERT)
}

const TZ = 'Asia/Bangkok'
const TOPIC_LABEL: Record<string, string> = {
  general: 'Traveller',
  agency: 'Agency',
  press: 'Press / media',
  other: 'Other',
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
  return `${date} at ${time}`
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

// Email interna office: inline CSS, table-based, brand #E31F33.
function buildHtml(m: ContactMessage): string {
  const topic = TOPIC_LABEL[m.topic] ?? m.topic
  const msg = escapeHtml(m.message).replaceAll('\n', '<br />')
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#f7f5f2;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#E31F33;padding:16px 24px;color:#ffffff;font-size:18px;font-weight:bold;">
        New message from thaiakha.com
      </td></tr>
      <tr><td style="padding:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222827;line-height:1.6;">
          <tr><td style="padding:4px 0;width:120px;color:#5E6464;">From</td><td style="padding:4px 0;"><strong>${escapeHtml(m.name)}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#5E6464;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(m.email)}" style="color:#E31F33;">${escapeHtml(m.email)}</a></td></tr>
          <tr><td style="padding:4px 0;color:#5E6464;">Writing as</td><td style="padding:4px 0;">${escapeHtml(topic)}</td></tr>
          <tr><td style="padding:4px 0;color:#5E6464;">Sent</td><td style="padding:4px 0;">${fmtDateTime(m.created_at)} (Chiang Mai time)</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f7f5f2;border-radius:6px;font-size:14px;color:#222827;line-height:1.6;">${msg}</div>
        <p style="margin:20px 0 0;font-size:13px;color:#5E6464;line-height:1.6;">
          Hit Reply to answer ${escapeHtml(m.name)} directly.<br />
          Message id ${m.id} in <a href="${TABLE_EDITOR_URL}" style="color:#E31F33;">contact_messages</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

async function sendResend(to: string, replyTo: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: replyTo, subject, html }),
  })
  const detail = await res.json()
  return { ok: res.ok, id: (detail as { id?: string }).id, detail }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata')
    if (!CONTACT_NOTIFY_TO) throw new Error('CONTACT_NOTIFY_TO non configurata (casella scelta dall\'owner)')
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Service-role env non disponibile')

    const p: ReqPayload = await req.json()
    const id = p.record?.id ?? p.id
    if (!id) throw new Error('id mancante nel payload')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: row, error } = await supabase
      .from('contact_messages')
      .select('id, created_at, name, email, topic, message, status, source')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(`lettura contact_messages: ${error.message}`)
    if (!row) throw new Error(`contact_messages ${id} non trovata`)

    const m = row as ContactMessage
    const topic = TOPIC_LABEL[m.topic] ?? m.topic
    const subject = `Website contact - ${topic} - ${m.name}`
    const sent = await sendResend(CONTACT_NOTIFY_TO, m.email, subject, buildHtml(m))
    if (!sent.ok) {
      console.error('send-contact-notification: Resend failure', sent.detail)
      return new Response(JSON.stringify({ ok: false, id, detail: sent.detail }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      })
    }

    return new Response(JSON.stringify({ ok: true, id, resend_id: sent.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-contact-notification error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
