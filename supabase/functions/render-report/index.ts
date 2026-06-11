// Path: supabase/functions/render-report/index.ts
// Proxy auth verso il servizio Cloud Run render-pdf. Custodisce RENDER_TOKEN (mai nel browser),
// legge i dati dal DB con service-role e restituisce il PDF. Solo staff (admin/manager/...).
// Secret: REPORT_RENDERER_URL (URL Cloud Run), RENDER_TOKEN.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const STAFF = ['admin', 'manager', 'kitchen', 'driver', 'logistics']
const SESSION_LABEL: Record<string, string> = {
  morning_class: 'Morning Class',
  evening_class: 'Evening Class',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
function fmtPeriod(start: string, end: string): string {
  const a = new Date(start + 'T00:00:00'), b = new Date(end + 'T00:00:00')
  if (a.getMonth() === b.getMonth())
    return `${a.getDate()}–${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
  return `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('POST only', { status: 405, headers: CORS })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const RENDERER_URL = Deno.env.get('REPORT_RENDERER_URL')
    const RENDER_TOKEN = Deno.env.get('RENDER_TOKEN')
    if (!RENDERER_URL || !RENDER_TOKEN) throw new Error('Renderer non configurato (URL/token mancanti)')

    // Auth staff
    const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: u } = await authClient.auth.getUser()
    if (!u?.user?.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: me } = await admin.from('profiles').select('role').eq('id', u.user.id).single()
    if (!me || !STAFF.includes(me.role)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const { report, driver_id, week_start, week_end, format = 'A5' } = await req.json()

    // Costruzione dati per template "driver_report"
    if (report !== 'driver_report') return new Response(JSON.stringify({ error: `Unknown report '${report}'` }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
    if (!driver_id || !week_start || !week_end) return new Response(JSON.stringify({ error: 'driver_id, week_start, week_end required' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const { data: driver } = await admin.from('profiles').select('full_name').eq('id', driver_id).single()
    const { data: rows } = await admin
      .from('driver_payments')
      .select('run_date, session_id, total_pax, payout_amount')
      .eq('driver_id', driver_id)
      .gte('run_date', week_start)
      .lte('run_date', week_end)
      .order('run_date', { ascending: true })

    const data = {
      driver: driver?.full_name ?? 'Driver',
      period: fmtPeriod(week_start, week_end),
      rows: (rows ?? []).map((r) => ({
        date: r.run_date,
        class: SESSION_LABEL[r.session_id ?? ''] ?? r.session_id,
        pax: r.total_pax,
        fare: r.payout_amount,
      })),
    }

    const filename = `ThaiAkha_Driver_Report_${(driver?.full_name ?? 'driver').replace(/\s+/g, '')}_${week_start}.pdf`

    // Chiamata al renderer Cloud Run
    const rres = await fetch(`${RENDERER_URL.replace(/\/$/, '')}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Render-Token': RENDER_TOKEN },
      body: JSON.stringify({ template: 'driver_report', format, filename, data }),
    })
    if (!rres.ok) {
      const t = await rres.text()
      throw new Error(`Renderer error ${rres.status}: ${t.slice(0, 300)}`)
    }
    const pdf = await rres.arrayBuffer()
    return new Response(pdf, {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${filename}"` },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
