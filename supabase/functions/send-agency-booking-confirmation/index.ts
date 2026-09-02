// Path: supabase/functions/send-agency-booking-confirmation/index.ts
// #122: conferma automatica all'agenzia quando un booking agency viene registrato.
// Sostituisce il vecchio trigger "send-booking-email" (puntava a un'edge morta).
// Trigger: AFTER INSERT su bookings WHEN booking_source='agency' AND status='confirmed'
// (supabase_functions.http_request); tollera l'invoke manuale con { booking_id }.
// Invia: 1421_30 all'agenzia (profiles.email) e, se guest_email presente,
// 1421_32 al cliente (invito a registrarsi). Master template nella 142 del brain.

import { createClient } from 'npm:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export interface BookingRow {
  internal_id: string
  booking_ref: string | null
  reservation_id_agency: string | null
  session_id: string
  booking_date: string
  pax_count: number
  hotel_name: string | null
  pickup_time: string | null
  guest_name: string | null
  guest_email: string | null
  booking_source: string | null
  status: string | null
  user_id: string
  agency: { email: string | null; agency_company_name: string | null; full_name: string | null } | null
}

interface ReqPayload {
  booking_id?: string
  record?: { internal_id?: string }
}

const CLASS_LABEL: Record<string, string> = {
  morning_class: 'Morning Cooking Class (includes the 1 hour market tour)',
  evening_class: 'Evening Cooking Class',
}
// Finestre pickup canoniche (015_Canonical_Facts): morning 08:15-09:00, evening 16:15-17:00
const PICKUP: Record<string, { ready: string; window: string; kitchen: string }> = {
  morning_class: { ready: '8:15 am', window: 'between 8:15 am and 9:00 am', kitchen: '9:00 am' },
  evening_class: { ready: '4:15 pm', window: 'between 4:15 pm and 5:00 pm', kitchen: '5:00 pm' },
}

export function fmtDate(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00`)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export function fmtTime(hms: string): string {
  const [h, m] = hms.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

export function pickupLine(b: BookingRow): string {
  const p = PICKUP[b.session_id]
  if (b.hotel_name) {
    const ready = b.pickup_time ? fmtTime(b.pickup_time) : p.ready
    const window = b.pickup_time ? `around ${fmtTime(b.pickup_time)}` : p.window
    return `Please be ready in the lobby of ${escapeHtml(b.hotel_name)} at ${ready}. Our driver will arrive ${window}.`
  }
  return `We look forward to welcoming you at our kitchen at ${p.kitchen}.`
}

function detailsTable(b: BookingRow): string {
  const rows: Array<[string, string]> = [
    ['Booking reference', b.booking_ref ?? b.internal_id],
    ['Your reference', b.reservation_id_agency ?? '-'],
    ['Class', CLASS_LABEL[b.session_id] ?? b.session_id],
    ['Date', fmtDate(b.booking_date)],
    ['Guests', String(b.pax_count ?? 1)],
    ['Pickup', b.hotel_name ? escapeHtml(b.hotel_name) : 'meeting at our kitchen'],
  ]
  return rows
    .map(([k, v]) => `<tr><td style="padding:4px 0;width:150px;color:#5E6464;">${k}</td><td style="padding:4px 0;"><strong>${v}</strong></td></tr>`)
    .join('\n')
}

function wrap(inner: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#f7f5f2;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#E31F33;padding:16px 24px;color:#ffffff;font-size:18px;font-weight:bold;">Thai Akha Kitchen</td></tr>
      <tr><td style="padding:24px;font-size:14px;color:#222827;line-height:1.6;">${inner}</td></tr>
    </table>
  </td></tr>
</table>`
}

// 1421_30 - conferma all'agenzia
function agencyHtml(b: BookingRow, agencyName: string): string {
  return wrap(`
<p>Dear ${escapeHtml(agencyName)},</p>
<p>Thank you for your booking. It is now in our calendar, and our kitchen is ready.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailsTable(b)}</table>
<p style="margin-top:16px;">Please forward this to your client:</p>
<div style="padding:16px;background:#f7f5f2;border-radius:6px;">
  <p style="margin:0 0 8px;"><strong>Your Thai cooking class with Thai Akha Kitchen is confirmed!</strong></p>
  <p style="margin:0 0 8px;">${pickupLine(b)}</p>
  <p style="margin:0 0 8px;">Before class, you can pick the dishes you want to cook here:<br />
  <a href="https://www.thaiakhakitchen.com/choose-your-dishes/" style="color:#E31F33;">thaiakhakitchen.com/choose-your-dishes</a></p>
  <p style="margin:0;">Our cookbook, with every recipe we teach and the stories behind them, is waiting for you at
  <a href="https://www.thaiakhakitchen.com/cookbook/" style="color:#E31F33;">thaiakhakitchen.com/cookbook</a> (password: ThaiAkhaBook).</p>
</div>
<p>If anything changes, just reply to this email and we will take care of it.</p>
<p>With warm regards,<br />Thai Akha Kitchen</p>`)
}

// 1421_32 - invito al cliente (solo se guest_email presente)
function guestHtml(b: BookingRow): string {
  const cls = b.session_id === 'morning_class' ? 'Morning' : 'Evening'
  const marketTour = b.session_id === 'morning_class'
    ? `<p>Your class begins with a 1 hour tour of the local fresh market, walking with your teacher among the herbs, spices and morning colors of Chiang Mai.</p>`
    : ''
  return wrap(`
<p>Dear ${escapeHtml(b.guest_name ?? 'guest')},</p>
<p>Great news: your ${cls} Cooking Class at Thai Akha Kitchen on ${fmtDate(b.booking_date)} is booked.</p>
<p>We are a small Akha family kitchen in Chiang Mai, and we like to know our guests before they walk in. Create your free account and you can:</p>
<ul style="margin:0 0 12px;padding-left:20px;">
  <li>pick the dishes you want to cook from our menu</li>
  <li>tell us what you do not eat, so we cook every dish to suit you</li>
  <li>keep your recipes and your Digital Passport after class</li>
</ul>
<p>Start here: <a href="https://www.thaiakha.com/" style="color:#E31F33;">thaiakha.com</a></p>
${marketTour}
<p>If you have any questions before class, just reply to this email. A real person from our kitchen reads it.</p>
<p>See you soon,<br />Thai Akha Kitchen</p>`)
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Service-role env non disponibile')

    const p: ReqPayload = await req.json()
    const id = p.record?.internal_id ?? p.booking_id
    if (!id) throw new Error('booking id mancante nel payload')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: row, error } = await supabase
      .from('bookings')
      .select('internal_id, booking_ref, reservation_id_agency, session_id, booking_date, pax_count, hotel_name, pickup_time, guest_name, guest_email, booking_source, status, user_id, agency:profiles!user_id(email, agency_company_name, full_name)')
      .eq('internal_id', id)
      .maybeSingle()
    if (error) throw new Error(`lettura bookings: ${error.message}`)
    if (!row) throw new Error(`booking ${id} non trovato`)

    const b = row as unknown as BookingRow
    // Guardia per gli invoke manuali: solo booking agency confermati
    if (b.booking_source !== 'agency' || b.status !== 'confirmed') {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'non agency/confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      })
    }

    const agencyEmail = b.agency?.email
    if (!agencyEmail) throw new Error(`profilo agency senza email (user_id ${b.user_id})`)
    const agencyName = b.agency?.agency_company_name ?? b.agency?.full_name ?? 'partner'

    const results: Record<string, unknown> = {}
    const cls = b.session_id === 'morning_class' ? 'Morning' : 'Evening'
    const dateLabel = fmtDate(b.booking_date)

    const subjA = `Booking confirmed - ${cls} Cooking Class, ${dateLabel} - ${b.guest_name ?? b.booking_ref ?? ''}, ${b.pax_count ?? 1} guests`
    const sentA = await sendResend(agencyEmail, subjA, agencyHtml(b, agencyName))
    results.agency = sentA.ok ? { sent: true, id: sentA.id } : { sent: false, detail: sentA.detail }
    if (!sentA.ok) console.error('send-agency-booking-confirmation: Resend failure (agency)', sentA.detail)

    if (b.guest_email) {
      const subjG = 'Your Thai cooking class is booked - come tell us how you like to cook'
      const sentG = await sendResend(b.guest_email, subjG, guestHtml(b))
      results.guest = sentG.ok ? { sent: true, id: sentG.id } : { sent: false, detail: sentG.detail }
      if (!sentG.ok) console.error('send-agency-booking-confirmation: Resend failure (guest)', sentG.detail)
    }

    return new Response(JSON.stringify({ ok: true, booking_id: id, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    console.error('send-agency-booking-confirmation error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
