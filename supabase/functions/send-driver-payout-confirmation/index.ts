// Path: supabase/functions/send-driver-payout-confirmation/index.ts
// BYPASS-PAYOUT (temporaneo) — invio 2 email brandizzate dopo inject_driver_payout_manual:
//   • driver  -> template TH (driver_payout_user_th)
//   • ufficio -> template EN "Payout to confirm" con CTA dashboard (driver_payout_admin_en)
// Template embeddati in ./templates.ts (shell unico mantenuto nel brain). Dominio verificato su Resend.

import { ADMIN_EN_HTML, DRIVER_TH_HTML, renderEmail } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'
const OFFICE = 'office@thaiakhakitchen.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SESSION_LABEL: Record<string, string> = {
  morning_class: 'Morning Class',
  evening_class: 'Evening Class',
}

interface PayoutPayload {
  driver_name?: string
  email?: string
  run_date?: string
  session_id?: string
  stops_range?: string
  total_pax?: number
  payout_amount?: number
  comments?: string | null
}

async function sendResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  const detail = await res.json()
  return { ok: res.ok, detail }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata')
    const p: PayoutPayload = await req.json()

    const session = SESSION_LABEL[p.session_id ?? ''] ?? p.session_id ?? ''
    const stops = (p.stops_range ?? '').replace('7plus', '7+')

    // Dati comuni ai due template (merge field {{...}})
    const data = {
      driver_name: p.driver_name ?? 'Driver',
      session_id: session,
      run_date: p.run_date ?? '',
      stops_range: stops,
      total_pax: p.total_pax ?? '',
      payout_amount: p.payout_amount ?? 0,
      comments: (p.comments ?? '').toString().trim() || '-',
    }

    const results: Record<string, unknown> = {}

    // 1) Driver — TH
    if (p.email) {
      const r = await sendResend(
        p.email,
        `Thai Akha Kitchen - สรุปยอดจ่าย ${data.run_date}`.trim(),
        renderEmail(DRIVER_TH_HTML, data),
      )
      results.driver = r.ok ? 'sent' : r.detail
    } else {
      results.driver = 'skipped (no email)'
    }

    // 2) Ufficio — EN (riepilogo, niente conferma)
    const a = await sendResend(
      OFFICE,
      `Driver: ${data.driver_name} - ${session} (${data.run_date})`,
      renderEmail(ADMIN_EN_HTML, data),
    )
    results.office = a.ok ? 'sent' : a.detail

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-driver-payout-confirmation error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
