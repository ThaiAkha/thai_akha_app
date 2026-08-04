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
// Thai short months + Buddhist year (พ.ศ. = CE + 543) for TH market reports.
const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const MONTHS_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtDate(iso: string, lang = 'en'): string {
  const d = new Date(iso + 'T00:00:00')
  if (lang === 'th') return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`
  return `${d.getDate()} ${MONTHS_EN_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

function fmtPeriod(start: string, end: string, lang = 'en'): string {
  const a = new Date(start + 'T00:00:00'), b = new Date(end + 'T00:00:00')
  const M = lang === 'th' ? MONTHS_TH : MONTHS
  const yr = (d: Date) => lang === 'th' ? d.getFullYear() + 543 : d.getFullYear()
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
    return `${a.getDate()}–${b.getDate()} ${M[b.getMonth()]} ${yr(b)}`
  return `${a.getDate()} ${M[a.getMonth()]} – ${b.getDate()} ${M[b.getMonth()]} ${yr(b)}`
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function bad(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
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
    const bodyEarly = await req.json()
    // L'agenzia può renderizzare SOLO il proprio agency_report; lo staff tutto.
    const isAgencyOwn = me?.role === 'agency' && bodyEarly?.report === 'agency_report'
    if (!me || (!STAFF.includes(me.role) && !isAgencyOwn)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const body = bodyEarly
    const { report, format = 'A5', lang = 'en' } = body

    // Ogni report costruisce { template, data, filename }, poi un'unica chiamata al renderer.
    let template = ''
    let data: Record<string, unknown> = {}
    let filename = 'report.pdf'

    if (report === 'driver_report') {
      const { driver_id, week_start, week_end } = body
      if (!driver_id || !week_start || !week_end) return bad('driver_id, week_start, week_end required')

      const { data: driver } = await admin.from('profiles').select('full_name').eq('id', driver_id).single()
      const { data: rows } = await admin
        .from('driver_payments')
        .select('run_date, session_id, total_stops, total_pax, payout_amount')
        .eq('driver_id', driver_id)
        .gte('run_date', week_start)
        .lte('run_date', week_end)
        .order('run_date', { ascending: true })

      template = 'driver_report'
      data = {
        driver: driver?.full_name ?? 'Driver',
        period: fmtPeriod(week_start, week_end),
        rows: (rows ?? []).map((r) => ({
          date: r.run_date,
          class: SESSION_LABEL[r.session_id ?? ''] ?? r.session_id,
          stops: r.total_stops,
          pax: r.total_pax,
          fare: r.payout_amount,
        })),
      }
      filename = `ThaiAkha_Driver_Report_${(driver?.full_name ?? 'driver').replace(/\s+/g, '')}_${week_start}.pdf`

    } else if (report === 'market_run') {
      // Logistics (1/run) o Kitchen Daily — un singolo market_run (lista articoli + totale).
      const { run_id } = body
      if (!run_id) return bad('run_id required')

      const { data: run } = await admin
        .from('market_runs')
        .select('run_date, shopper_role, total_cost, status, items_snapshot')
        .eq('id', run_id)
        .maybeSingle()
      if (!run) return bad('market run not found', 404)

      const isTeacher = run.shopper_role === 'teacher'
      const items = Array.isArray(run.items_snapshot) ? run.items_snapshot : []
      template = 'market_report'
      data = {
        lang, type: 'run',
        kicker: `Market Report · ${isTeacher ? 'Kitchen' : 'Logistics'}`,
        shop: isTeacher ? 'Chiang Mai Gate' : 'Muang Mai Market',
        run_date: fmtDate(run.run_date, lang),
        status: cap(String(run.status ?? '')),
        rows: (items as Array<{ name?: string; price?: number }>).map((it) => ({ name: it.name ?? '', price: it.price ?? 0 })),
        total: Math.round(Number(run.total_cost) || 0),
      }
      filename = `ThaiAkha_Market_${isTeacher ? 'Kitchen' : 'Logistics'}_${run.run_date}_${lang}.pdf`

    } else if (report === 'market_monthly') {
      // Kitchen Monthly — totali giornalieri (stream teacher) del mese.
      const { month_start, month_end } = body
      if (!month_start || !month_end) return bad('month_start, month_end required')

      const { data: rows } = await admin
        .from('market_runs')
        .select('run_date, total_cost')
        .eq('shopper_role', 'teacher')
        .neq('status', 'planned')
        .gte('run_date', month_start)
        .lte('run_date', month_end)
        .order('run_date', { ascending: true })

      const list = (rows ?? []) as Array<{ run_date: string; total_cost: number }>
      const total = list.reduce((acc, r) => acc + (Number(r.total_cost) || 0), 0)
      template = 'market_report'
      data = {
        lang, type: 'monthly',
        kicker: 'Market Report · Kitchen',
        shop: 'Chiang Mai Gate',
        period: fmtPeriod(month_start, month_end, lang),
        rows: list.map((r) => ({ date: fmtDate(r.run_date, lang), total: Math.round(Number(r.total_cost) || 0) })),
        total: Math.round(total),
      }
      filename = `ThaiAkha_Market_Kitchen_Monthly_${month_start}_${lang}.pdf`

    } else if (report === 'agency_report') {
      // Report agenzia — o un periodo (period_start/end) o una selezione esplicita (booking_ids[], anche non contigua).
      // Se chiama un'agenzia, forza il proprio id (può vedere solo i propri dati).
      const agency_id = isAgencyOwn ? u.user.id : body.agency_id
      const { period_start, period_end, booking_ids } = body
      const ids: string[] = Array.isArray(booking_ids) ? booking_ids : []
      if (!agency_id || (ids.length === 0 && (!period_start || !period_end)))
        return bad('agency_id + (booking_ids[] or period_start/period_end) required')

      const { data: agency } = await admin.from('profiles').select('agency_company_name, full_name').eq('id', agency_id).single()
      let q = admin
        .from('bookings')
        .select('booking_date, session_id, pax_count, total_price, commission_amount, guest_name, booking_ref')
        .eq('user_id', agency_id)
      q = ids.length > 0
        ? q.in('internal_id', ids)
        : q.gte('booking_date', period_start).lte('booking_date', period_end)
      const { data: rows } = await q.order('booking_date', { ascending: true })

      const list = (rows ?? []) as Array<{ booking_date: string; session_id: string | null; pax_count: number; total_price: number; commission_amount: number; guest_name: string | null; booking_ref: string | null }>
      // total_price È GIÀ il net (gross − commission). gross derivato.
      const net = list.reduce((s, r) => s + (Number(r.total_price) || 0), 0)
      const commission = list.reduce((s, r) => s + (Number(r.commission_amount) || 0), 0)
      const gross = net + commission
      // Etichetta periodo: range richiesto → "1–30 Jun"; selezione sparsa → "{n} bookings · min–max".
      const periodLabel = ids.length > 0
        ? (list.length > 0 ? `${list.length} bookings · ${fmtPeriod(list[0].booking_date, list[list.length - 1].booking_date)}` : 'Selection')
        : fmtPeriod(period_start, period_end)
      template = 'agency_report'
      data = {
        agency: agency?.agency_company_name || agency?.full_name || 'Agency',
        period: periodLabel,
        rows: list.map((r) => ({
          date: r.booking_date,
          guest: r.guest_name || r.booking_ref || '—',
          class: SESSION_LABEL[r.session_id ?? ''] ?? r.session_id ?? '',
          pax: r.pax_count,
          price: Math.round((Number(r.total_price) || 0) + (Number(r.commission_amount) || 0)), // gross retail per riga
          commission: Math.round(Number(r.commission_amount) || 0),
        })),
        gross: Math.round(gross),
        commission: Math.round(commission),
        net: Math.round(net),
      }
      filename = `ThaiAkha_Agency_${(agency?.agency_company_name || 'agency').replace(/\s+/g, '')}_${ids.length > 0 ? ids.length + 'bk' : period_start}.pdf`

    } else if (report === 'kitchen_report') {
      // MULTI-KITCHEN (Fase 4) — clienti/pax/incassi di UNA kitchen per giorno/settimana.
      // Scope: teacher (role=kitchen) → forzata sulla PROPRIA kitchen (sicurezza, ignora il body);
      // manager/admin → kitchen specifica (body.kitchen_id) oppure aggregato (nessun filtro).
      const { week_start, week_end } = body
      if (!week_start || !week_end) return bad('week_start, week_end required')

      const scopeKitchen: string | null = me.role === 'kitchen'
        ? u.user.id
        : (body.kitchen_id ?? null)

      let q = admin
        .from('bookings')
        .select('internal_id, booking_date, session_id, pax_count, guest_name, payment_status, class_sessions (price_thb)')
        .gte('booking_date', week_start)
        .lte('booking_date', week_end)
        .neq('status', 'cancelled')
      if (scopeKitchen) q = q.eq('kitchen_id', scopeKitchen)
      const { data: bks } = await q.order('booking_date', { ascending: true })

      const list = (bks ?? []) as Array<{
        internal_id: string; booking_date: string; session_id: string | null;
        pax_count: number | null; guest_name: string | null; payment_status: string | null;
        class_sessions: { price_thb: number | null } | { price_thb: number | null }[] | null
      }>

      // Incassi extra POS (shop_orders pagati) per booking della kitchen in scope.
      const ids = list.map((b) => b.internal_id)
      const posByBooking = new Map<string, number>()
      if (ids.length) {
        const { data: orders } = await admin
          .from('shop_orders')
          .select('booking_id, quantity, unit_price_snapshot, status')
          .in('booking_id', ids)
          .eq('status', 'paid')
        for (const o of (orders ?? []) as Array<{ booking_id: string; quantity: number; unit_price_snapshot: number }>) {
          posByBooking.set(o.booking_id, (posByBooking.get(o.booking_id) ?? 0) + (Number(o.unit_price_snapshot) || 0) * (Number(o.quantity) || 0))
        }
      }

      const isPaid = (s: string | null) => s === 'paid' || s === 'completed' || s === 'succeeded'
      const rows = list.map((b) => {
        const cs = Array.isArray(b.class_sessions) ? b.class_sessions[0] : b.class_sessions
        const classFee = isPaid(b.payment_status) ? (Number(cs?.price_thb) || 0) * (Number(b.pax_count) || 0) : 0
        const pos = posByBooking.get(b.internal_id) ?? 0
        return {
          date: b.booking_date,
          guest: b.guest_name || '—',
          class: SESSION_LABEL[b.session_id ?? ''] ?? b.session_id ?? '',
          pax: Number(b.pax_count) || 0,
          paid: isPaid(b.payment_status) ? 'Paid' : 'Unpaid',
          revenue: Math.round(classFee + pos),
        }
      })

      let kitchenName = 'All kitchens'
      if (scopeKitchen) {
        const { data: k } = await admin.from('profiles').select('full_name').eq('id', scopeKitchen).single()
        kitchenName = k?.full_name ?? 'Kitchen'
      }

      template = 'kitchen_report'
      data = {
        lang,
        kitchen: kitchenName,
        period: fmtPeriod(week_start, week_end, lang),
        rows,
        groups: rows.length,
        pax: rows.reduce((s, r) => s + r.pax, 0),
        revenue: rows.reduce((s, r) => s + r.revenue, 0),
      }
      filename = `ThaiAkha_Kitchen_Report_${kitchenName.replace(/\s+/g, '')}_${week_start}.pdf`

    } else if (report === 'salary_payslip') {
      // Payslip A5 — singolo ({salary_id}) o tutti del mese ({period}, PDF multipagina). Solo admin/manager.
      if (!['admin', 'manager'].includes(me.role)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...CORS, 'Content-Type': 'application/json' } })
      const { salary_id, period } = body
      if (!salary_id && !period) return bad('salary_id or period required')

      let sq = admin.from('staff_salaries').select('id, period, total_amount, overtime_note, employee_id, profiles:employee_id(full_name, role)')
      sq = salary_id ? sq.eq('id', salary_id) : sq.eq('period', period)
      const { data: srows } = await sq.order('created_at', { ascending: true })
      const list = (srows ?? []) as Array<{ period: string; total_amount: number; overtime_note: string | null; profiles: { full_name: string | null; role: string | null } | null }>
      if (list.length === 0) return bad('No salary rows found', 404)

      const today = new Date()
      const payDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
      const periodLabel = (p: string) => { const [y, m] = p.split('-'); return `${MONTHS[Number(m) - 1] ?? m} ${y}` }

      template = 'salary_payslip'
      data = {
        workers: list.map((s) => {
          const amt = Math.round(Number(s.total_amount) || 0)
          return {
            employee_name: s.profiles?.full_name ?? '—',
            position: cap(s.profiles?.role ?? ''),
            period: periodLabel(s.period),
            pay_date: payDate,
            salary: amt, overtime: 0, bonus: 0, advance: 0, ssf: 0, other_ded: 0,
            total_income: amt, total_ded: 0, net: amt,
            ytd_income: 0, ytd_ded: 0, ytd_tax: 0, ytd_ssf: 0,
          }
        }),
      }
      filename = salary_id
        ? `ThaiAkha_Payslip_${(list[0].profiles?.full_name || 'staff').replace(/\s+/g, '')}.pdf`
        : `ThaiAkha_Payslips_${period}.pdf`

    } else {
      return bad(`Unknown report '${report}'`)
    }

    // Chiamata al renderer Cloud Run
    const rres = await fetch(`${RENDERER_URL.replace(/\/$/, '')}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Render-Token': RENDER_TOKEN },
      body: JSON.stringify({ template, format: (template === 'market_report' || template === 'agency_report') ? 'A4' : format, filename, data }),
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
