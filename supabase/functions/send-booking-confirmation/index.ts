// Path: supabase/functions/send-booking-confirmation/index.ts
// #172: conferma automatica al CLIENTE B2C quando un booking non-agency viene registrato,
// piu' la notifica interna allo staff. Chiude il buco lasciato dal vecchio trigger
// "send-booking-email" (droppato il 02/09: puntava a un'edge morta con questo stesso nome).
// Trigger: AFTER INSERT su bookings WHEN status='confirmed' AND booking_source not in
// ('agency','staff_internal') (supabase_functions.http_request); tollera l'invoke manuale
// con { booking_id }. Gemella di send-agency-booking-confirmation (#122).
// Invia: 142_03_B2C-01a..d al cliente (variante Morning/Evening x cash/paid) e
// 142_03_B2C-01-Admin alla casella staff (BOOKING_NOTIFY_TO, fallback CONTACT_NOTIFY_TO).
// Lingua: profiles.preferred_language del cliente (default en); oggi il master B2C esiste
// solo in EN, results.lang dice cosa e' partito davvero.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { pickLang } from '../_shared/agencyEmailI18n.ts'
import { type B2cBooking, buildAdminNewBooking, buildB2cConfirmation, pickB2cLang } from '../_shared/b2cEmailI18n.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const NOTIFY_TO = Deno.env.get('BOOKING_NOTIFY_TO') ?? Deno.env.get('CONTACT_NOTIFY_TO') ?? ''
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'
const SKIP_SOURCES = ['agency', 'staff_internal']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingRow extends B2cBooking {
  status: string | null
  user_id: string | null
  customer: { email: string | null; full_name: string | null; preferred_language: string | null } | null
}

interface ReqPayload {
  booking_id?: string
  record?: { internal_id?: string }
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
      .select('internal_id, booking_ref, session_id, booking_date, pax_count, visitor_count, total_price, payment_method, payment_status, hotel_name, pickup_zone, pickup_time, guest_name, guest_email, phone_prefix, phone_number, special_requests, customer_note, booking_source, status, user_id, session:class_sessions!session_id(display_name, price_thb, start_time, end_time, has_market_tour), customer:profiles!user_id(email, full_name, preferred_language)')
      .eq('internal_id', id)
      .maybeSingle()
    if (error) throw new Error(`lettura bookings: ${error.message}`)
    if (!row) throw new Error(`booking ${id} non trovato`)

    const b = row as unknown as BookingRow
    // Guardia per gli invoke manuali: solo booking cliente confermati (agency ha la sua edge)
    if (b.status !== 'confirmed' || SKIP_SOURCES.includes(b.booking_source ?? '')) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'non B2C/confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      })
    }

    const customerEmail = b.guest_email ?? b.customer?.email
    if (!customerEmail) throw new Error(`booking ${id} senza email cliente (guest_email e profilo vuoti)`)
    const customerName = b.guest_name ?? b.customer?.full_name ?? 'guest'
    const requested = pickLang(b.customer?.preferred_language)
    const lang = pickB2cLang(requested)

    const results: Record<string, unknown> = { lang, requested_lang: requested }

    const mail = buildB2cConfirmation(b, customerName, lang)
    const sent = await sendResend(customerEmail, mail.subject, mail.html)
    results.customer = sent.ok ? { sent: true, id: sent.id } : { sent: false, detail: sent.detail }
    if (!sent.ok) console.error('send-booking-confirmation: Resend failure (customer)', sent.detail)

    if (NOTIFY_TO) {
      const admin = buildAdminNewBooking(b, customerName, customerEmail)
      const sentA = await sendResend(NOTIFY_TO, admin.subject, admin.html)
      results.staff = sentA.ok ? { sent: true, id: sentA.id } : { sent: false, detail: sentA.detail }
      if (!sentA.ok) console.error('send-booking-confirmation: Resend failure (staff)', sentA.detail)
    } else {
      results.staff = { sent: false, reason: 'BOOKING_NOTIFY_TO / CONTACT_NOTIFY_TO non impostati' }
    }

    return new Response(JSON.stringify({ ok: true, booking_id: id, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    console.error('send-booking-confirmation error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})
