// supabase/functions/zoho-record-agency-payment/index.ts
//
// Manager conferma il pagamento di una o più agency_invoices (status 'declared').
// → registra UN customer_payment in Zoho (banktransfer) applicato alle fatture
// → le fatture Zoho diventano 'paid' (Zoho invia la ricevuta email)
// → agency_invoices.status = 'paid', paid_at, confirmed_by.
//
// Auth: solo staff JWT (admin/manager). Idempotente: salta le già 'paid'.
//
// ENV: gli stessi delle altre edge Zoho (ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN/ORG_ID/DC).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const STAFF = ['admin', 'manager']

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

    // 1) Auth — solo staff
    const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: userData } = await authClient.auth.getUser()
    const uid = userData?.user?.id
    if (!uid) return json({ success: false, message: 'Unauthorized' }, 401)
    const { data: me } = await admin.from('profiles').select('role').eq('id', uid).single()
    if (!me || !STAFF.includes(me.role)) return json({ success: false, message: 'Forbidden' }, 403)

    // 2) Input — agency_invoices ids (stessa agenzia)
    const body = await req.json().catch(() => ({}))
    const invoiceIds: string[] = Array.isArray(body.invoice_ids) ? body.invoice_ids : []
    if (invoiceIds.length === 0) return json({ success: false, message: 'invoice_ids[] required' }, 400)

    const { data: invs, error: ierr } = await admin
      .from('agency_invoices')
      .select('id, agency_id, zoho_invoice_id, amount, status')
      .in('id', invoiceIds)
    if (ierr) return json({ success: false, message: ierr.message }, 500)
    const pending = (invs ?? []).filter((i) => i.status === 'declared' && i.zoho_invoice_id)
    if (pending.length === 0) return json({ success: false, message: 'No declared invoices to confirm.' }, 400)

    const agencyIds = [...new Set(pending.map((i) => i.agency_id))]
    if (agencyIds.length > 1) return json({ success: false, message: 'Selected invoices belong to different agencies.' }, 400)
    const agencyId = agencyIds[0]

    const { data: agency } = await admin.from('profiles').select('zoho_contact_id').eq('id', agencyId).single()
    if (!agency?.zoho_contact_id) return json({ success: false, message: 'Agency has no zoho_contact_id.' }, 400)

    const amount = pending.reduce((s, i) => s + Number(i.amount || 0), 0)
    const today = new Date().toISOString().slice(0, 10)

    // 3) Customer payment in Zoho applicato alle fatture
    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const orgId = Deno.env.get('ZOHO_ORG_ID')!
    const token = await zohoAccessToken()
    const payload = {
      customer_id: agency.zoho_contact_id,
      payment_mode: 'banktransfer',
      amount,
      date: today,
      reference_number: `AGY-PAY-${today}`,
      invoices: pending.map((i) => ({ invoice_id: i.zoho_invoice_id, amount_applied: Number(i.amount || 0) })),
    }
    const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/customerpayments?organization_id=${orgId}`, {
      method: 'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const zdata = await zres.json()
    if (zdata.code !== 0 || !zdata.payment?.payment_id) {
      console.error('ZOHO_AGENCY_PAYMENT_FAIL', zres.status, JSON.stringify(zdata))
      return json({ success: false, message: `Zoho error: ${zdata.message ?? JSON.stringify(zdata)}`, zoho: zdata }, 502)
    }
    const paymentId = zdata.payment.payment_id as string

    // 4) Email ricevuta (best-effort)
    try {
      await fetch(`https://www.zohoapis.${dc}/books/v3/customerpayments/${paymentId}/email?organization_id=${orgId}`, {
        method: 'POST', headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      })
    } catch (_e) { /* ignora */ }

    // 5) Write-back agency_invoices → paid
    const { error: upErr } = await admin
      .from('agency_invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString(), confirmed_by: uid })
      .in('id', pending.map((i) => i.id))
    if (upErr) return json({ success: false, message: `Payment recorded (${paymentId}) but write-back failed: ${upErr.message}`, payment_id: paymentId }, 500)

    return json({ success: true, payment_id: paymentId, amount, invoices: pending.length })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
