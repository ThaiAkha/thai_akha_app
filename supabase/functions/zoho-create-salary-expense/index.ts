// supabase/functions/zoho-create-salary-expense/index.ts
//
// Stipendi → Expense Zoho, su GO del manager. DUE regimi, decisi da staff_details.zoho_vendor_id:
//
//   A) INDIVIDUALE (zoho_vendor_id VALORIZZATO, oggi i founders Svevo/Niti)
//      1 spesa per persona, con vendor_id = quel valore, ESCLUSA dai gruppi.
//      Replica la prassi contabile fatta a mano da 2026-03 (serie mensile ~50k THB):
//      stesso account/paid-through del pay_method, nonbillable, reference "Nome - salary YYYY-MM".
//
//   B) RAGGRUPPATO (zoho_vendor_id NULL) → max 2 spese account-only per mese:
//      bank → 1 spesa unica "Employers - Salary - Bank"  · paid_through Bank 7502
//      cash → 1 spesa unica "Employers - Salary - Cash"   · paid_through Black Box
//      Nessun vendor. I lavoratori vanno tutti nella DESCRIZIONE della rispettiva spesa,
//      col flusso completo di ciascuno (base, +OT, +SSF, -trattenute, = netto);
//      amount = somma dei net_amount del gruppo (le righe individuali NON entrano nel totale).
//
// Idempotente: la select filtra già le righe con zoho_expense_id (per-riga sugli individuali,
// per-gruppo sui raggruppati); write-back zoho_expense_id + status=paid.
// staff_details è admin-only in RLS: qui si legge con service_role, di proposito. Il valore
// del vendor NON esce mai nella response verso il client.
//
// Debug: { dry_run: true } restituisce la partizione e i payload SENZA scrivere su Zoho.
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

// Zoho rifiuta una "description" oltre 500 caratteri: header + le righe che ci stanno, poi "+N more".
function fitDescription(header: string, lines: string[], max = 500): string {
  let out = header
  for (let i = 0; i < lines.length; i++) {
    const rest = lines.length - i
    const next = `${out}\n${lines[i]}`
    const tailAfterAdd = rest > 1 ? `\n+${rest - 1} more` : ''
    if (next.length + tailAfterAdd.length > max) {
      const stopped = `${out}\n+${rest} more`
      return (stopped.length <= max ? stopped : out).slice(0, max)
    }
    out = next
  }
  return out.slice(0, max)
}

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
  id: string; employee_id: string; period: string;
  // Breakdown dal 2026-08-24: net_amount e' GENERATA dal DB (base + OT + SSF - trattenute)
  // ed e' l'unico importo che va in Zoho. SSF = cifra aggiunta al pagamento, non trattenuta.
  base_amount: number; overtime_amount: number; ssf_amount: number;
  other_deduction: number; net_amount: number;
  pay_method: 'bank' | 'cash'; status: string;
  zoho_expense_id: string | null;
  // staff_salaries.employee_id → authors.id (the PERSON, not the login) since 2026-08-16
  authors?: { name: string | null } | { name: string | null }[] | null;
}

const nameOf = (r: SalaryRow): string => {
  const who = Array.isArray(r.authors) ? r.authors[0] : r.authors
  return who?.name ?? 'Employee'
}

const thb = (v: number) => Number(v || 0).toLocaleString('en-US')

// Il flusso completo della persona in una riga, ma solo le voci valorizzate:
// senza extra resta "Aye: 12,000"; con extra "Aye: 12,000 +OT 1,500 +SSF 750 -200 = 14,050".
// Serve a stare dentro il tetto di 500 caratteri della description Zoho anche con 10 persone.
const breakdown = (r: SalaryRow): string => {
  const parts: string[] = [thb(r.base_amount)]
  if (Number(r.overtime_amount)) parts.push(`+OT ${thb(r.overtime_amount)}`)
  if (Number(r.ssf_amount)) parts.push(`+SSF ${thb(r.ssf_amount)}`)
  if (Number(r.other_deduction)) parts.push(`-${thb(r.other_deduction)}`)
  return parts.length > 1 ? `${parts.join(' ')} = ${thb(r.net_amount)}` : parts[0]
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
    const dryRun = body.dry_run === true
    if (!period && salaryIds.length === 0)
      return json({ success: false, message: 'period or salary_ids[] required' }, 400)

    // 3) Carica le righe (draft, importo > 0, non ancora expensed)
    let q = admin.from('staff_salaries')
      .select('id, employee_id, period, base_amount, overtime_amount, ssf_amount, other_deduction, net_amount, pay_method, status, zoho_expense_id, authors:employee_id (name)')
      .is('zoho_expense_id', null)
      .gt('net_amount', 0)
    q = salaryIds.length > 0 ? q.in('id', salaryIds) : q.eq('period', period!)
    const { data: rowsRaw, error: rErr } = await q
    if (rErr) return json({ success: false, message: rErr.message }, 500)
    const rows = (rowsRaw ?? []) as unknown as SalaryRow[]
    if (rows.length === 0) return json({ success: true, skipped: true, message: 'No pending salaries.' })

    // 4) Chi ha un vendor Zoho proprio → spesa INDIVIDUALE, fuori dai gruppi.
    //    staff_details è admin-only in RLS: qui service_role, letto di proposito e mai esposto.
    const { data: sd, error: sdErr } = await admin
      .from('staff_details')
      .select('worker_id, zoho_vendor_id')
      .in('worker_id', [...new Set(rows.map((r) => r.employee_id))])
    if (sdErr) return json({ success: false, message: sdErr.message }, 500)
    const vendorByWorker = new Map<string, string>()
    for (const d of sd ?? []) {
      const v = (d.zoho_vendor_id as string | null)?.trim()
      if (v) vendorByWorker.set(d.worker_id as string, v)
    }

    const individuals = rows.filter((r) => vendorByWorker.has(r.employee_id))
    const grouped = rows.filter((r) => !vendorByWorker.has(r.employee_id))

    // 5) Raggruppa per metodo (bank/cash) SOLO le righe senza vendor proprio
    const groups: Record<string, SalaryRow[]> = {}
    for (const r of grouped) (groups[r.pay_method] ??= []).push(r)

    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const org = Deno.env.get('ZOHO_ORG_ID')!
    const today = new Date().toISOString().slice(0, 10)
    const per = period ?? rows[0].period

    interface ExpenseResult {
      kind: 'individual' | 'group'
      method: string
      zoho_expense_id: string
      amount: number
      employees: number
      employee?: string
    }
    const results: ExpenseResult[] = []
    const failures: Array<{ method: string; message: string; employee?: string }> = []

    // Payload comune: individuale = vendor + 1 riga · gruppo = account-only + N righe.
    const buildPayload = (method: string, amount: number, reference: string, description: string, vendorId?: string) => {
      const cfg = METHOD_CFG[method]
      return {
        account_id: envOr(cfg.accountEnv, cfg.accountDef),
        paid_through_account_id: envOr(cfg.paidEnv, cfg.paidDef),
        ...(vendorId ? { vendor_id: vendorId } : {}),
        date: today,
        amount,
        currency_code: 'THB',
        is_billable: false,
        reference_number: reference,
        description,
      }
    }

    if (dryRun) {
      return json({
        success: true, dry_run: true, period: per,
        individual: individuals.map((r) => {
          const ref = `${nameOf(r)} - salary ${per}`
          return {
            salary_id: r.id, employee: nameOf(r), method: r.pay_method, amount: Number(r.net_amount),
            breakdown: breakdown(r),
            // vendor_id oscurato di proposito: il valore reale non esce mai verso il client
            payload: METHOD_CFG[r.pay_method]
              ? buildPayload(r.pay_method, Number(r.net_amount), ref.slice(0, 100), `${ref} - ${breakdown(r)}`, '(vendor set)')
              : { error: `Unknown pay_method "${r.pay_method}"` },
          }
        }),
        groups: Object.keys(groups).map((m) => ({
          method: m, employees: groups[m].length,
          amount: groups[m].reduce((s, r) => s + Number(r.net_amount || 0), 0),
          lines: groups[m].map((r) => `- ${nameOf(r)}: ${breakdown(r)}`),
        })),
      })
    }

    const token = await zohoToken()

    // 6) Spese INDIVIDUALI (una per riga, col vendor della persona)
    for (const r of individuals) {
      const who = nameOf(r)
      const amount = Number(r.net_amount || 0)
      if (amount <= 0) continue
      if (!METHOD_CFG[r.pay_method]) {
        failures.push({ method: r.pay_method, employee: who, message: `Unknown pay_method "${r.pay_method}"` })
        continue
      }
      const ref = `${who} - salary ${per}`
      const description = `${ref} - ${breakdown(r)}`.slice(0, 500)

      const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/expenses?organization_id=${org}`, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(r.pay_method, amount, ref.slice(0, 100), description, vendorByWorker.get(r.employee_id)!)),
      })
      const zdata = await zres.json()
      if (zdata.code !== 0 || !zdata.expense?.expense_id) {
        console.error('ZOHO_SALARY_INDIVIDUAL_FAIL', who, zres.status, JSON.stringify(zdata))
        failures.push({ method: r.pay_method, employee: who, message: zdata.message ?? 'Zoho error' })
        continue
      }
      const expenseId = zdata.expense.expense_id as string

      const nowIso = new Date().toISOString()
      const { error: upErr } = await admin.from('staff_salaries')
        .update({ zoho_expense_id: expenseId, status: 'paid', paid_at: nowIso, zoho_synced_at: nowIso })
        .eq('id', r.id)
      if (upErr) {
        failures.push({ method: r.pay_method, employee: who, message: `Expense ${expenseId} ok but write-back failed: ${upErr.message}` })
        continue
      }
      results.push({ kind: 'individual', method: r.pay_method, zoho_expense_id: expenseId, amount, employees: 1, employee: who })
    }

    // 7) Una spesa unica per metodo (solo le righe raggruppate)
    for (const method of Object.keys(groups)) {
      const cfg = METHOD_CFG[method]
      if (!cfg) continue
      const g = groups[method]
      const amount = g.reduce((s, r) => s + Number(r.net_amount || 0), 0)
      if (amount <= 0) continue

      // Zoho: description max 500 caratteri. Col flusso completo (base +OT +SSF -trattenute)
      // 10 persone che hanno tutte le voci sforano: in quel caso si degrada a nome+netto per
      // TUTTI, che e' meglio che troncare e far sparire un lavoratore dalla nota.
      const header = `Salaries ${per} - ${method.toUpperCase()} (${g.length}) THB ${thb(amount)}`
      const detailed = g.map((r) => `- ${nameOf(r)}: ${breakdown(r)}`)
      const fits = (lines: string[]) => header.length + lines.reduce((n, l) => n + l.length + 1, 0) <= 500
      const description = fitDescription(
        header,
        fits(detailed) ? detailed : g.map((r) => `- ${nameOf(r)}: ${thb(r.net_amount)}`),
      )

      const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/expenses?organization_id=${org}`, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(method, amount, `SAL-${per}-${method.toUpperCase()}`, description)),
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

      results.push({ kind: 'group', method, zoho_expense_id: expenseId, amount, employees: g.length })
    }

    return json({ success: failures.length === 0, period: per, expenses: results, failures })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
