// Path: supabase/functions/send-agency-reminder/index.ts
// #122: reminder all'agenzia ~24h prima della classe (template 1421_31).
// Trigger: pg_cron orario -> private.agency_reminder_tick() -> net.http_post qui
// con header x-agency-cron-secret (pattern gemello di market_autoexpense_tick).
// La tick seleziona i booking agency confermati con classe tra 12 e 24 ore
// (finestra larga: un tick perso non perde il reminder) e reminder_sent_at null;
// questa edge invia e marca reminder_sent_at (idempotenza per riga).

import { createClient } from 'npm:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const CRON_SECRET = Deno.env.get('AGENCY_REMINDER_CRON_SECRET')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agency-cron-secret',
}

interface BookingRow {
  internal_id: string
  booking_ref: string | null
  reservation_id_agency: string | null
  session_id: string
  booking_date: string
  pax_count: number
  hotel_name: string | null
  pickup_time: string | null
  guest_name: string | null
  booking_source: string | null
  status: string | null
  reminder_sent_at: string | null
  user_id: string
  agency: { email: string | null; agency_company_name: string | null; full_name: string | null } | null
}

const CLASS_LABEL: Record<string, string> = {
  morning_class: 'Morning Cooking Class (includes the 1 hour market tour)',
  evening_class: 'Evening Cooking Class',
}
const PICKUP: Record<string, { ready: string; window: string; kitchen: string }> = {
  morning_class: { ready: '8:15 am', window: 'between 8:15 am and 9:00 am', kitchen: '9:00 am' },
  evening_class: { ready: '4:15 pm', window: 'between 4:15 pm and 5:00 pm', kitchen: '5:00 pm' },
}

function fmtDate(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00`)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtTime(hms: string): string {
  const [h, m] = hms.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function pickupLine(b: BookingRow): string {
  const p = PICKUP[b.session_id]
  if (b.hotel_name) {
    const ready = b.pickup_time ? fmtTime(b.pickup_time) : p.ready
    const window = b.pickup_time ? `around ${fmtTime(b.pickup_time)}` : p.window
    return `Please be ready in the lobby of ${escapeHtml(b.hotel_name)} at ${ready}. Our driver will arrive ${window}.`
  }
  return `We look forward to welcoming you at our kitchen at ${p.kitchen}.`
}

// 1421_31 - reminder 24h all'agenzia
function reminderHtml(b: BookingRow, agencyName: string): string {
  const rows: Array<[string, string]> = [
    ['Booking reference', b.booking_ref ?? b.internal_id],
    ['Your reference', b.reservation_id_agency ?? '-'],
    ['Class', CLASS_LABEL[b.session_id] ?? b.session_id],
    ['Date', fmtDate(b.booking_date)],
    ['Guests', String(b.pax_count ?? 1)],
    ['Pickup', b.hotel_name ? escapeHtml(b.hotel_name) : 'meeting at our kitchen'],
  ]
  const details = rows
    .map(([k, v]) => `<tr><td style="padding:4px 0;width:150px;color:#5E6464;">${k}</td><td style="padding:4px 0;"><strong>${v}</strong></td></tr>`)
    .join('\n')
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#f7f5f2;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#E31F33;padding:16px 24px;color:#ffffff;font-size:18px;font-weight:bold;">Thai Akha Kitchen</td></tr>
      <tr><td style="padding:24px;font-size:14px;color:#222827;line-height:1.6;">
        <p>Dear ${escapeHtml(agencyName)},</p>
        <p>A quick reminder: your guests cook with us tomorrow.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${details}</table>
        <p style="margin-top:16px;">Please make sure your clients are ready:</p>
        <div style="padding:16px;background:#f7f5f2;border-radius:6px;">
          <p style="margin:0 0 8px;"><strong>See you tomorrow at Thai Akha Kitchen!</strong></p>
          <p style="margin:0 0 8px;">${pickupLine(b)}</p>
          <p style="margin:0;">Wear comfortable shoes, bring your appetite, and leave the rest to us.</p>
        </div>
        <p>If your clients cannot make it, reply to this email as soon as you can and we will find a solution together.</p>
        <p>With warm regards,<br />Thai Akha Kitchen</p>
      </td></tr>
    </table>
  </td></tr>
</table>`
}

async function sendResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  const detail = await res.json()
  return { ok: res.ok, id: (detail as { id?: string }).id, detail }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata')
    if (!CRON_SECRET) throw new Error('AGENCY_REMINDER_CRON_SECRET non configurata')
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Service-role env non disponibile')

    // Solo canale cron: header x-agency-cron-secret
    if (req.headers.get('x-agency-cron-secret') !== CRON_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
      })
    }

    const { booking_ids } = (await req.json()) as { booking_ids?: string[] }
    if (!booking_ids?.length) {
      return new Response(JSON.stringify({ ok: true, skipped: true, message: 'booking_ids vuoto' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Rilegge e rifiltra (idempotenza per riga: reminder_sent_at null)
    const { data: rows, error } = await supabase
      .from('bookings')
      .select('internal_id, booking_ref, reservation_id_agency, session_id, booking_date, pax_count, hotel_name, pickup_time, guest_name, booking_source, status, reminder_sent_at, user_id, agency:profiles!user_id(email, agency_company_name, full_name)')
      .in('internal_id', booking_ids)
      .eq('booking_source', 'agency')
      .eq('status', 'confirmed')
      .is('reminder_sent_at', null)
    if (error) throw new Error(`lettura bookings: ${error.message}`)

    const results: Array<{ booking_id: string; sent: boolean; id?: string }> = []
    const failures: Array<{ booking_id: string; detail: unknown }> = []

    for (const raw of rows ?? []) {
      const b = raw as unknown as BookingRow
      const agencyEmail = b.agency?.email
      if (!agencyEmail) { failures.push({ booking_id: b.internal_id, detail: 'profilo agency senza email' }); continue }
      const agencyName = b.agency?.agency_company_name ?? b.agency?.full_name ?? 'partner'
      const cls = b.session_id === 'morning_class' ? 'Morning' : 'Evening'
      const subject = `Tomorrow - ${cls} Cooking Class, ${fmtDate(b.booking_date)} - ${b.guest_name ?? b.booking_ref ?? ''}`
      const sent = await sendResend(agencyEmail, subject, reminderHtml(b, agencyName))
      if (!sent.ok) {
        console.error('send-agency-reminder: Resend failure', b.internal_id, sent.detail)
        failures.push({ booking_id: b.internal_id, detail: sent.detail })
        continue
      }
      const { error: upErr } = await supabase
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('internal_id', b.internal_id)
      if (upErr) {
        // Email partita ma write-back fallito: failure esplicita, mai ingoiata (COOKBOOK §1.3)
        console.error('send-agency-reminder: write-back fallito', b.internal_id, upErr.message)
        failures.push({ booking_id: b.internal_id, detail: `email inviata ma write-back fallito: ${upErr.message}` })
        continue
      }
      results.push({ booking_id: b.internal_id, sent: true, id: sent.id })
    }

    return new Response(JSON.stringify({ success: failures.length === 0, results, failures }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    console.error('send-agency-reminder error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
