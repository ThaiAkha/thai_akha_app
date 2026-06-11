// Path: supabase/functions/send-driver-payout-confirmation/index.ts
// BYPASS-PAYOUT (temporaneo) — email di conferma payout dichiarato a mano dal driver.
// Invocata dal client (DriverPayoutForm) dopo inject_driver_payout_manual.
// Dominio mittente: thaiakhakitchen.com (già verificato su Resend, vedi send-booking-confirmation).

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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

function buildHtml(p: PayoutPayload): string {
  const session = SESSION_LABEL[p.session_id ?? ''] ?? p.session_id ?? '—'
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:13px;">${label}</td>
      <td style="padding:8px 0;color:#1f2328;font-size:14px;font-weight:600;text-align:right;">${value}</td>
    </tr>`
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1f2328;">
    <h1 style="color:#f02539;font-size:20px;margin:0 0 4px;">Thai Akha Kitchen</h1>
    <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">Conferma servizio pickup — payout registrato</p>
    <p style="font-size:14px;">Ciao ${p.driver_name ?? 'Driver'}, abbiamo registrato il tuo servizio.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #e5e7eb;">
      ${row('Data', p.run_date ?? '—')}
      ${row('Classe', session)}
      ${row('Hotel (stop)', p.stops_range ?? '—')}
      ${row('Clienti totali', String(p.total_pax ?? '—'))}
      ${p.comments ? row('Note', p.comments) : ''}
    </table>
    <div style="background:#1f2328;color:#fff;border-radius:11px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;opacity:.8;">Payout</span>
      <span style="font-size:24px;font-weight:700;">${p.payout_amount ?? 0} <span style="font-size:13px;font-weight:500;opacity:.8;">Baht</span></span>
    </div>
    <p style="margin-top:18px;color:#6b7280;font-size:12px;">
      Il pagamento sarà confermato ed eseguito dall'ufficio. Payout in stato <b>pending</b> fino alla conferma.
    </p>
    <p style="margin-top:24px;color:#9ca3af;font-size:11px;">© 2026 Thai Akha Kitchen.</p>
  </div>`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload: PayoutPayload = await req.json()

    if (!payload.email) throw new Error('Email driver mancante')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata')

    const session = SESSION_LABEL[payload.session_id ?? ''] ?? payload.session_id ?? ''

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Thai Akha Kitchen <driver@thaiakhakitchen.com>',
        to: [payload.email],
        // Copia al back-office per visibilità sui payout dichiarati a mano.
        bcc: ['office@thaiakhakitchen.com'],
        subject: `Payout registrato — ${session} ${payload.run_date ?? ''}`.trim(),
        html: buildHtml(payload),
      }),
    })

    const detail = await res.json()
    if (!res.ok) {
      console.error('Resend error:', detail)
      throw new Error(detail?.message ?? 'Invio email fallito')
    }

    return new Response(JSON.stringify({ success: true, detail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error sending payout confirmation:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
