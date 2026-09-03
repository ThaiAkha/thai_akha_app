// Path: supabase/functions/send-agency-booking-confirmation/index.ts
// #122: conferma automatica all'agenzia quando un booking agency viene registrato.
// Sostituisce il vecchio trigger "send-booking-email" (puntava a un'edge morta).
// Trigger: AFTER INSERT su bookings WHEN booking_source='agency' AND status='confirmed'
// (supabase_functions.http_request); tollera l'invoke manuale con { booking_id }.
// Invia: 1421_30 all'agenzia (profiles.email) e, se guest_email presente,
// 1421_32 al cliente (invito a registrarsi). Master template nella 142 del brain.
// #142: 1421_30 nella lingua dell'agenzia (profiles.preferred_language: en|th|es|zh),
// 1421_32 al cliente resta EN (Consegna_142: la lingua del guest non e' nota al booking).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildAgencyConfirmation, buildGuestInvite, type EmailBooking, pickLang } from '../_shared/agencyEmailI18n.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingRow extends EmailBooking {
  guest_email: string | null
  booking_source: string | null
  status: string | null
  user_id: string
  agency: { email: string | null; agency_company_name: string | null; full_name: string | null; preferred_language: string | null } | null
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
      .select('internal_id, booking_ref, reservation_id_agency, session_id, booking_date, pax_count, hotel_name, pickup_time, guest_name, guest_email, booking_source, status, user_id, agency:profiles!user_id(email, agency_company_name, full_name, preferred_language)')
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
    const lang = pickLang(b.agency?.preferred_language)

    const results: Record<string, unknown> = { lang }

    const agencyMail = buildAgencyConfirmation(b, agencyName, lang)
    const sentA = await sendResend(agencyEmail, agencyMail.subject, agencyMail.html)
    results.agency = sentA.ok ? { sent: true, id: sentA.id } : { sent: false, detail: sentA.detail }
    if (!sentA.ok) console.error('send-agency-booking-confirmation: Resend failure (agency)', sentA.detail)

    if (b.guest_email) {
      const guestMail = buildGuestInvite(b, 'en')
      const sentG = await sendResend(b.guest_email, guestMail.subject, guestMail.html)
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
