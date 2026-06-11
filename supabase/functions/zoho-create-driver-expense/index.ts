// supabase/functions/zoho-create-driver-expense/index.ts
//
// Crea UN Expense Zoho Books dal payout settimanale di un driver (1 per driver/settimana).
// Trigger: l'app admin chiama questa function dopo aver segnato "paid" il payout della settimana.
// Spec: thai_akha_brain/700_To_Do_2027/02_In_Progress/Zoho_Driver_Expense_Spec.md
//
// ENV (Edge Function secrets): ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN,
//   ZOHO_ORG_ID, ZOHO_DC (com|eu|in), ZOHO_DRIVER_EXPENSE_ACCOUNT_ID, ZOHO_DRIVER_PAID_THROUGH_ACCOUNT_ID
//   (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY iniettate da Supabase)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const SESSION_LABEL: Record<string, string> = {
  morning_class: 'Morning Class',
  evening_class: 'Evening Class',
}
const STAFF = ['admin', 'manager', 'kitchen', 'driver', 'logistics']

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
    const authHeader = req.headers.get('Authorization') ?? ''

    // 1) Auth: il chiamante dev'essere staff
    const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData } = await authClient.auth.getUser()
    const uid = userData?.user?.id
    if (!uid) return json({ success: false, message: 'Unauthorized' }, 401)

    const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: me } = await admin.from('profiles').select('role').eq('id', uid).single()
    if (!me || !STAFF.includes(me.role)) return json({ success: false, message: 'Forbidden' }, 403)

    // 2) Input
    const { driver_id, week_start, week_end } = await req.json()
    if (!driver_id || !week_start || !week_end)
      return json({ success: false, message: 'driver_id, week_start, week_end required' }, 400)

    // 3) Payout della settimana (status paid)
    const { data: rows, error: rowsErr } = await admin
      .from('driver_payments')
      .select('id, run_date, session_id, total_stops, total_pax, payout_amount, status, paid_at, zoho_expense_id')
      .eq('driver_id', driver_id)
      .gte('run_date', week_start)
      .lte('run_date', week_end)
      .eq('status', 'paid')
      .order('run_date', { ascending: true })
    if (rowsErr) return json({ success: false, message: rowsErr.message }, 500)
    if (!rows || rows.length === 0)
      return json({ success: false, message: 'No paid payouts for this driver/week.' }, 404)

    // 4) Idempotenza: se già fatturata, skip
    const already = rows.find((r) => r.zoho_expense_id)
    if (already)
      return json({ success: true, skipped: true, zoho_expense_id: already.zoho_expense_id, message: 'Week already expensed.' })

    const amount = rows.reduce((s, r) => s + (r.payout_amount ?? 0), 0)
    if (amount <= 0) return json({ success: false, message: 'Total amount is 0.' }, 400)

    // 5) Vendor (driver)
    const { data: driver } = await admin
      .from('profiles').select('full_name, zoho_contact_id').eq('id', driver_id).single()
    if (!driver?.zoho_contact_id)
      return json({ success: false, message: 'Driver has no zoho_contact_id (vendor not linked).' }, 422)

    const expenseDate = (rows[rows.length - 1].paid_at ?? new Date().toISOString()).slice(0, 10)
    const driverShort = (driver.full_name ?? 'driver').replace(/\s+/g, '').slice(0, 12)
    const description = rows
      .map((r) => `Pickup ${SESSION_LABEL[r.session_id ?? ''] ?? r.session_id} ${r.run_date} — ${r.total_stops ?? 0} stops · ${r.total_pax ?? 0} pax`)
      .join('\n')

    // 6) Crea l'Expense in Zoho
    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const orgId = Deno.env.get('ZOHO_ORG_ID')!
    const token = await zohoAccessToken()
    const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/expenses?organization_id=${orgId}`, {
      method: 'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: Deno.env.get('ZOHO_DRIVER_EXPENSE_ACCOUNT_ID'),
        paid_through_account_id: Deno.env.get('ZOHO_DRIVER_PAID_THROUGH_ACCOUNT_ID'),
        vendor_id: driver.zoho_contact_id,
        date: expenseDate,
        amount,
        currency_code: 'THB',
        reference_number: `DRV-${driverShort}-${week_start}`,
        description,
      }),
    })
    const zdata = await zres.json()
    if (zdata.code !== 0 || !zdata.expense?.expense_id)
      return json({ success: false, message: `Zoho error: ${zdata.message ?? JSON.stringify(zdata)}` }, 502)

    const expenseId = zdata.expense.expense_id as string

    // 7) Write-back idempotente su tutte le righe della settimana
    const { error: upErr } = await admin
      .from('driver_payments')
      .update({ zoho_expense_id: expenseId, zoho_synced_at: new Date().toISOString() })
      .in('id', rows.map((r) => r.id))
    if (upErr) return json({ success: false, message: `Expense created (${expenseId}) but write-back failed: ${upErr.message}` }, 500)

    return json({ success: true, zoho_expense_id: expenseId, amount, rows: rows.length, date: expenseDate })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
