// supabase/functions/zoho-create-salary-expense/index.ts
//
// Stipendi → Expense Zoho RAGGRUPPATE per metodo (max 2 al mese), su GO del manager:
//   bank → 1 spesa unica "Employers - Salary - Bank"  · paid_through Bank 7502
//   cash → 1 spesa unica "Employers - Salary - Cash"   · paid_through Black Box
// Account-only (nessun vendor). I lavoratori (nome + totale + eventuale nota OT)
// vanno tutti nella DESCRIZIONE della rispettiva spesa.
// amount spesa = somma dei total_amount del gruppo.
// Idempotente: salta le righe già con zoho_expense_id; write-back status=paid su tutto il gruppo.
//
// I PAYSLIP individuali NON sono qui: si generano con un pulsante separato (render-report 'salary_payslip').
//
// ENV: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORG_ID, ZOHO_DC
//   [override opz.] ZOHO_SALARY_BANK_ACCOUNT_ID, ZOHO_SALARY_CASH_ACCOUNT_ID,
//   ZOHO_SALARY_BANK_PAID_THROUGH_ID, ZOHO_SALARY_CASH_PAID_THROUGH_ID
//   (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY iniettate da Supabase)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

const STAFF = ['admin', 'manager']
const envOr = (k: string, d: string) => Deno.env.get(k) ?? d

// Config per metodo (default = ID verificati org 663160082, 2026-06-24)
const METHOD_CFG: Record<string, { accountEnv: string; accountDef: string; paidEnv: string; paidDef: string }> = {
  bank: {
    accountEnv: 'ZOHO_SALARY_BANK_ACCOUNT_ID', accountDef: '1215788000000032023',      // Employers - Salary - Bank
    paidEnv: 'ZOHO_SALARY_BANK_PAID_THROUGH_ID', paidDef: '1215788000000147263',        // Bank Account 01 - 7502
  },
  cash: {
    accountEnv: 'ZOHO_SALARY_CASH_ACCOUNT_ID', accountDef: '1215788000000064005',       // Employers - Salary - Cash
    paidEnv: 'ZOHO_SALARY_CASH_PAID_THROUGH_ID', paidDef: '1215788000000097047',        // Cash - Black Box
  },
}

async function zohoToken(): Promise<string> {
  const dc = Deno.env.get('ZOHO_DC') ?? 'com'
  const res = await fetch(`https://accounts.zoho.${dc}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN')!,
      client_id: Deno.env.get('ZOHO_CLIENT_ID')!,
      client_secret: Deno.env.get('ZOHO_CLIENT_SECRET')!,
      grant_type: 'refresh_token',
    }),
  })
  const d = await res.json()
  if (!d.access_token) throw new Error(`Zoho token error: ${JSON.stringify(d)}`)
  return d.access_token as string
}

interface SalaryRow {
  id: string; employee_id: string; period: string; total_amount: number;
  overtime_note: string | null; pay_method: 'bank' | 'cash'; status: string;
  zoho_expense_id: string | null;
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ success: false, message: 'POST only' }, 405)

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // 1) Auth staff (manager/admin)
    const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: ud } = await authClient.auth.getUser()
    const uid = ud?.user?.id
    if (!uid) return json({ success: false, message: 'Unauthorized' }, 401)
    const { data: me } = await admin.from('profiles').select('role').eq('id', uid).single()
    if (!me || !STAFF.includes(me.role)) return json({ success: false, message: 'Forbidden' }, 403)

    // 2) Input: { period } (tutte le draft del mese) oppure { salary_ids: [] }
    const body = await req.json().catch(() => ({}))
    const period = body.period as string | undefined
    const salaryIds = Array.isArray(body.salary_ids) ? (body.salary_ids as string[]) : []
    if (!period && salaryIds.length === 0)
      return json({ success: false, message: 'period or salary_ids[] required' }, 400)

    // 3) Carica le righe (draft, importo > 0, non ancora expensed)
    let q = admin.from('staff_salaries')
      .select('id, employee_id, period, total_amount, overtime_note, pay_method, status, zoho_expense_id, profiles:employee_id (full_name)')
      .is('zoho_expense_id', null)
      .gt('total_amount', 0)
    q = salaryIds.length > 0 ? q.in('id', salaryIds) : q.eq('period', period!)
    const { data: rowsRaw, error: rErr } = await q
    if (rErr) return json({ success: false, message: rErr.message }, 500)
    const rows = (rowsRaw ?? []) as unknown as SalaryRow[]
    if (rows.length === 0) return json({ success: true, skipped: true, message: 'No pending salaries.' })

    // 4) Raggruppa per metodo (bank/cash)
    const groups: Record<string, SalaryRow[]> = {}
    for (const r of rows) (groups[r.pay_method] ??= []).push(r)

    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const org = Deno.env.get('ZOHO_ORG_ID')!
    const token = await zohoToken()
    const today = new Date().toISOString().slice(0, 10)
    const per = period ?? rows[0].period

    const results: Array<{ method: string; zoho_expense_id: string; amount: number; employees: number }> = []
    const failures: Array<{ method: string; message: string }> = []

    // 5) Una spesa unica per metodo
    for (const method of Object.keys(groups)) {
      const cfg = METHOD_CFG[method]
      if (!cfg) continue
      const g = groups[method]
      const amount = g.reduce((s, r) => s + Number(r.total_amount || 0), 0)
      if (amount <= 0) continue

      const lines = g.map((r) => {
        const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
        const nm = prof?.full_name ?? 'Employee'
        return `- ${nm}: ฿${Number(r.total_amount).toLocaleString('en-US')}` + (r.overtime_note ? ` (OT: ${r.overtime_note})` : '')
      }).join('\n')
      const description = `Salaries ${per} — ${method.toUpperCase()} (${g.length})\n${lines}`

      const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/expenses?organization_id=${org}`, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: envOr(cfg.accountEnv, cfg.accountDef),
          paid_through_account_id: envOr(cfg.paidEnv, cfg.paidDef),
          date: today,
          amount,
          currency_code: 'THB',
          reference_number: `SAL-${per}-${method.toUpperCase()}`,
          description,
        }),
      })
      const zdata = await zres.json()
      if (zdata.code !== 0 || !zdata.expense?.expense_id) {
        console.error('ZOHO_SALARY_FAIL', method, zres.status, JSON.stringify(zdata))
        failures.push({ method, message: zdata.message ?? 'Zoho error' })
        continue
      }
      const expenseId = zdata.expense.expense_id as string

      const nowIso = new Date().toISOString()
      const { error: upErr } = await admin.from('staff_salaries')
        .update({ zoho_expense_id: expenseId, status: 'paid', paid_at: nowIso, zoho_synced_at: nowIso })
        .in('id', g.map((r) => r.id))
      if (upErr) { failures.push({ method, message: `Expense ${expenseId} ok but write-back failed: ${upErr.message}` }); continue }

      results.push({ method, zoho_expense_id: expenseId, amount, employees: g.length })
    }

    return json({ success: failures.length === 0, period: per, expenses: results, failures })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
