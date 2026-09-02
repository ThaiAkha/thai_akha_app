// supabase/functions/zoho-create-market-expense/index.ts
//
// Crea UN Expense Zoho Books per uno stream di mercato.
//   - logistics  → 1 Expense per run (giorno)        · account "Market - Muang Mai"
//   - teacher    → 1 Expense per mese (somma dei run) · account "Market - Chiang Mai Gate"
//
// Gemello di zoho-create-driver-expense. A differenza del driver, lo stream è fisso
// (vendor + account derivati dallo stream, non dal singolo record).
//
// Doppio canale di chiamata:
//   1) staff via JWT (pulsante manuale nell'app admin)
//   2) cron/pg_net via header `x-market-cron-secret` == MARKET_CRON_SECRET (auto-generazione)
//
// Idempotente: se uno qualsiasi dei run del gruppo ha già zoho_expense_id, salta.
// Write-back (service_role, bypassa market_runs_guard): zoho_expense_id, zoho_synced_at,
//   status='expensed', approved_at = coalesce(approved_at, now).
//
// ENV (Edge Function secrets):
//   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORG_ID, ZOHO_DC (com|eu|in)
//   MARKET_CRON_SECRET                                   (per le chiamate automatiche)
//   [opzionali — hanno default ai valori verificati 2026-06-21]
//   ZOHO_MARKET_LOGISTICS_ACCOUNT_ID, ZOHO_MARKET_LOGISTICS_VENDOR_ID
//   ZOHO_MARKET_TEACHER_ACCOUNT_ID,   ZOHO_MARKET_TEACHER_VENDOR_ID
//   ZOHO_MARKET_PAID_THROUGH_ACCOUNT_ID
//   (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY iniettate da Supabase)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-market-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const STAFF = ['admin', 'manager', 'kitchen', 'logistics']

// Config stream → Zoho (default = ID verificati su org 663160082 il 2026-06-21).
// Org Zoho a 2 conti mercato; cassa unica Red Box per entrambi.
const STREAM_CFG: Record<string, { accountEnv: string; accountDefault: string; vendorEnv: string; vendorDefault: string; refPrefix: string; shop: string }> = {
  logistics: {
    accountEnv: 'ZOHO_MARKET_LOGISTICS_ACCOUNT_ID', accountDefault: '1215788000000062500', // Market - Muang Mai
    vendorEnv: 'ZOHO_MARKET_LOGISTICS_VENDOR_ID',   vendorDefault: '1215788000003561155',   // 00 - Muang Mai Market
    refPrefix: 'MKT-LOG', shop: 'Muang Mai',
  },
  teacher: {
    accountEnv: 'ZOHO_MARKET_TEACHER_ACCOUNT_ID', accountDefault: '1215788000000000400', // Market - Chiang Mai Gate
    vendorEnv: 'ZOHO_MARKET_TEACHER_VENDOR_ID',   vendorDefault: '1215788000003561168',   // 01 - Chiang Mai Market
    refPrefix: 'MKT-TEA', shop: 'Chiang Mai Gate',
  },
}
const PAID_THROUGH_DEFAULT = '1215788000000000361' // Cash - Red Box

const envOr = (key: string, fallback: string) => Deno.env.get(key) ?? fallback

// Zoho rifiuta una "description" oltre 500 caratteri: teniamo l'header (totale) e
// quante righe ci stanno, chiudendo con "+N more". Mai superare il limite.
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

async function zohoAccessToken(): Promise<string> {
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
  const data = await res.json()
  if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`)
  return data.access_token as string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ success: false, message: 'POST only' }, 405)

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // 1) Auth — canale cron OPPURE staff JWT
    const cronSecret = req.headers.get('x-market-cron-secret') ?? ''
    const expectedCron = Deno.env.get('MARKET_CRON_SECRET') ?? ''
    const viaCron = expectedCron.length > 0 && cronSecret === expectedCron

    if (!viaCron) {
      const authHeader = req.headers.get('Authorization') ?? ''
      const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: userData } = await authClient.auth.getUser()
      const uid = userData?.user?.id
      if (!uid) return json({ success: false, message: 'Unauthorized' }, 401)
      const { data: me } = await admin.from('profiles').select('role').eq('id', uid).single()
      if (!me || !STAFF.includes(me.role)) return json({ success: false, message: 'Forbidden' }, 403)
    }

    // 2) Input — { stream, run_ids[] }  oppure  { stream, period_start, period_end }
    const body = await req.json().catch(() => ({}))
    const stream = body.stream as string
    if (!stream || !STREAM_CFG[stream])
      return json({ success: false, message: "stream must be 'logistics' or 'teacher'" }, 400)
    const cfg = STREAM_CFG[stream]

    let runIds: string[] = Array.isArray(body.run_ids) ? body.run_ids : []
    if (runIds.length === 0) {
      const { period_start, period_end } = body
      if (!period_start || !period_end)
        return json({ success: false, message: 'run_ids[] or (period_start, period_end) required' }, 400)
      const { data: resolved, error: rerr } = await admin
        .from('market_runs')
        .select('id')
        .eq('shopper_role', stream)
        .neq('status', 'planned')
        .gte('run_date', period_start)
        .lte('run_date', period_end)
      if (rerr) return json({ success: false, message: rerr.message }, 500)
      runIds = (resolved ?? []).map((r) => r.id)
    }
    if (runIds.length === 0)
      return json({ success: false, message: 'No matching market runs.' }, 404)

    // 3) Carica i run del gruppo
    const { data: rows, error: rowsErr } = await admin
      .from('market_runs')
      .select('id, run_date, spent_on, shopper_role, total_cost, notes, items_snapshot, status, approved_by, approved_at, zoho_expense_id, worker:authors!worker_id(name)')
      .in('id', runIds)
      .eq('shopper_role', stream)
      .order('run_date', { ascending: true })
    if (rowsErr) return json({ success: false, message: rowsErr.message }, 500)
    if (!rows || rows.length === 0) return json({ success: false, message: 'No matching market runs.' }, 404)

    // 4) Idempotenza
    const already = rows.find((r) => r.zoho_expense_id)
    if (already)
      return json({ success: true, skipped: true, zoho_expense_id: already.zoho_expense_id, message: 'Group already expensed.' })

    // 5) Importo
    const amount = rows.reduce((s, r) => s + Number(r.total_cost ?? 0), 0)
    if (amount <= 0) return json({ success: false, message: 'Total amount is 0.' }, 400)

    // 6) Meta Expense
    // #106: la data dell'Expense e' il giorno in cui i soldi sono usciti (spent_on,
    // fallback run_date per lo storico); il reference resta su run_date, che e'
    // l'identita' stabile della run/gruppo (mensile teacher, per-run logistics).
    const spentOf = (r: { spent_on?: string | null; run_date: string }) => (r.spent_on ?? r.run_date) as string
    const lastDate = rows.map((r) => spentOf(r as { spent_on?: string | null; run_date: string })).sort().pop()!
    const reference =
      stream === 'teacher'
        ? `${cfg.refPrefix}-${(rows[rows.length - 1].run_date as string).slice(0, 7)}`  // mensile
        : `${cfg.refPrefix}-${rows[0].run_date}`                                         // per-run
    // Zoho taglia a 500 caratteri: header col totale + le righe che ci stanno (il mese teacher ne ha ~30).
    const description = fitDescription(
      `${cfg.shop} · ${rows.length} run(s) · THB ${amount.toLocaleString('en-US')}`,
      rows.map((r) => {
        const items = Array.isArray(r.items_snapshot) ? r.items_snapshot.length : 0
        const note = r.notes ? ` - ${r.notes}` : ''
        // shopper = the PERSON (authors via worker_id), useful for per-person COGS
        const w = (r as { worker?: { name: string | null } | { name: string | null }[] | null }).worker
        const who = Array.isArray(w) ? w[0]?.name : w?.name
        return `${spentOf(r as { spent_on?: string | null; run_date: string })} THB ${Number(r.total_cost ?? 0).toLocaleString('en-US')}${items ? ` (${items} items)` : ''}${who ? ` by ${who}` : ''}${note}`
      }),
    )

    // 7) Crea l'Expense in Zoho
    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const orgId = Deno.env.get('ZOHO_ORG_ID')!
    const payload = {
      account_id: envOr(cfg.accountEnv, cfg.accountDefault),
      paid_through_account_id: envOr('ZOHO_MARKET_PAID_THROUGH_ACCOUNT_ID', PAID_THROUGH_DEFAULT),
      vendor_id: envOr(cfg.vendorEnv, cfg.vendorDefault),
      date: lastDate,
      amount,
      currency_code: 'THB',
      reference_number: reference,
      description,
    }

    // #106: dry-run - restituisce il payload SENZA creare l'Expense ne' scrivere sul DB.
    // Serve a verificare la data (spent_on) su una run di prova prima del GO reale.
    if (body.dry_run === true)
      return json({ success: true, dry_run: true, stream, runs: rows.length, payload })

    const token = await zohoAccessToken()
    const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/expenses?organization_id=${orgId}`, {
      method: 'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const zdata = await zres.json()
    if (zdata.code !== 0 || !zdata.expense?.expense_id) {
      console.error('ZOHO_MARKET_EXPENSE_FAIL', zres.status, JSON.stringify(zdata))
      return json({ success: false, message: `Zoho error: ${zdata.message ?? JSON.stringify(zdata)}`, zoho_code: zdata.code ?? null, zoho: zdata }, 502)
    }
    const expenseId = zdata.expense.expense_id as string

    // 8) Write-back idempotente (service_role → bypassa il guard)
    const nowIso = new Date().toISOString()
    const { error: upErr } = await admin
      .from('market_runs')
      .update({ zoho_expense_id: expenseId, zoho_synced_at: nowIso, status: 'expensed' })
      .in('id', rows.map((r) => r.id))
    if (upErr)
      return json({ success: false, message: `Expense created (${expenseId}) but write-back failed: ${upErr.message}` }, 500)

    // approved_at solo se mancante (non sovrascrive l'approvazione manager)
    const missingApproval = rows.filter((r) => !r.approved_at).map((r) => r.id)
    if (missingApproval.length > 0)
      await admin.from('market_runs').update({ approved_at: nowIso }).in('id', missingApproval)

    return json({
      success: true,
      stream,
      zoho_expense_id: expenseId,
      amount,
      runs: rows.length,
      date: lastDate,
      reference,
      via: viaCron ? 'cron' : 'staff',
    })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
