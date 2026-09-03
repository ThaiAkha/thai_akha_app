// Path: supabase/functions/send-driver-cancellation/index.ts
// Invio 2 email brandizzate quando un servizio pickup viene ANNULLATO:
//   • driver  -> template TH (driver_cancel_user_th)   [rosso allerta]
//   • ufficio -> template EN (driver_cancel_admin_en)  [rosso allerta]
// Mirror di send-driver-payout-confirmation: PAYLOAD-DRIVEN (i dati arrivano nel body, NON dal DB).
// Template embeddati in ./templates.ts (shell unico mantenuto nel brain). Nessuna logica payout.

import { CANCEL_ADMIN_EN_HTML, CANCEL_DRIVER_TH_HTML, renderEmail } from './templates.ts'

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

interface CancelPayload {
  driver_name?: string
  email?: string            // driver email (come il payout: p.email)
  run_date?: string
  session_id?: string
  stops_range?: string
  reason?: string | null
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
    const p: CancelPayload = await req.json()

    const session = SESSION_LABEL[p.session_id ?? ''] ?? p.session_id ?? ''
    const stops = (p.stops_range ?? '').replace('7plus', '7+')

    // Merge field {{...}} comuni ai due template
    const data = {
      driver_name: p.driver_name ?? 'Driver',
      session_id: session,
      run_date: p.run_date ?? '',
      stops_range: stops || '-',
      reason: (p.reason ?? '').toString().trim() || '-',
    }

    const results: Record<string, unknown> = {}

    // 1) Driver — TH (rosso allerta)
    if (p.email) {
      const r = await sendResend(
        p.email,
        `Thai Akha Kitchen - บริการรับส่งถูกยกเลิก ${data.run_date}`.trim(),
        renderEmail(CANCEL_DRIVER_TH_HTML, data),
      )
      results.driver = r.ok ? 'sent' : r.detail
    } else {
      results.driver = 'skipped (no email)'
    }

    // 2) Ufficio — EN (rosso allerta)
    const a = await sendResend(
      OFFICE,
      `Pickup cancelled - ${data.driver_name} · ${session} (${data.run_date})`,
      renderEmail(CANCEL_ADMIN_EN_HTML, data),
    )
    results.office = a.ok ? 'sent' : a.detail

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-driver-cancellation error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
