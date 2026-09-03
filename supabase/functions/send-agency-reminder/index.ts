// Path: supabase/functions/send-agency-reminder/index.ts
// #122: reminder all'agenzia ~24h prima della classe (template 1421_31).
// Trigger: pg_cron orario -> private.agency_reminder_tick() -> net.http_post qui
// con header x-agency-cron-secret (pattern gemello di market_autoexpense_tick).
// La tick seleziona i booking agency confermati con classe tra 12 e 24 ore
// (finestra larga: un tick perso non perde il reminder) e reminder_sent_at null;
// questa edge invia e marca reminder_sent_at (idempotenza per riga).
// #142: testo nella lingua dell'agenzia (profiles.preferred_language: en|th|es|zh).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildAgencyReminder, type EmailBooking, pickLang } from '../_shared/agencyEmailI18n.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const CRON_SECRET = Deno.env.get('AGENCY_REMINDER_CRON_SECRET')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agency-cron-secret',
}

interface BookingRow extends EmailBooking {
  booking_source: string | null
  status: string | null
  reminder_sent_at: string | null
  user_id: string
  agency: { email: string | null; agency_company_name: string | null; full_name: string | null; preferred_language: string | null } | null
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
      .select('internal_id, booking_ref, reservation_id_agency, session_id, booking_date, pax_count, hotel_name, pickup_time, guest_name, booking_source, status, reminder_sent_at, user_id, agency:profiles!user_id(email, agency_company_name, full_name, preferred_language)')
      .in('internal_id', booking_ids)
      .eq('booking_source', 'agency')
      .eq('status', 'confirmed')
      .is('reminder_sent_at', null)
    if (error) throw new Error(`lettura bookings: ${error.message}`)

    const results: Array<{ booking_id: string; sent: boolean; lang: string; id?: string }> = []
    const failures: Array<{ booking_id: string; detail: unknown }> = []

    for (const raw of rows ?? []) {
      const b = raw as unknown as BookingRow
      const agencyEmail = b.agency?.email
      if (!agencyEmail) { failures.push({ booking_id: b.internal_id, detail: 'profilo agency senza email' }); continue }
      const agencyName = b.agency?.agency_company_name ?? b.agency?.full_name ?? 'partner'
      const lang = pickLang(b.agency?.preferred_language)
      const mail = buildAgencyReminder(b, agencyName, lang)
      const sent = await sendResend(agencyEmail, mail.subject, mail.html)
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
      results.push({ booking_id: b.internal_id, sent: true, lang, id: sent.id })
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
