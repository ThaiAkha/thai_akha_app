// supabase/functions/zoho-create-agency-invoice/index.ts
//
// Crea UNA Invoice Zoho Books per un'agenzia, a partire da una selezione di booking
// (anche non contigui). Gemello "income" di zoho-create-driver-expense.
//
//   customer  = profiles.zoho_contact_id (agenzia)
//   1 riga per booking → item Zoho "Agency 2026" (per sessione) con rate SOVRASCRITTO
//                        al net reale = (total_price − commission_amount) / pax
//   total invoice = Σ net dovuto dall'agenzia
//
// Auth: solo staff via JWT (pulsante manuale nel manager). Nessun canale cron.
// Idempotente: se uno qualunque dei booking selezionati ha già zoho_invoice_id → salta.
// Write-back (service_role): zoho_invoice_id sui booking fatturati.
//
// ENV (Edge Function secrets) — gli stessi delle altre edge Zoho:
//   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORG_ID, ZOHO_DC (com|eu|in)
//   [opzionali] ZOHO_AGENCY_MORNING_ITEM_ID, ZOHO_AGENCY_EVENING_ITEM_ID
//   (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY iniettate da Supabase)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const STAFF = ['admin', 'manager']

// Mappa sessione → item Zoho "Agency 2026" (default = ID verificati su org 663160082).
// Il rate viene SEMPRE sovrascritto col net reale del booking; l'item serve per nome + conto income.
const SESSION_ITEM: Record<string, { env: string; def: string }> = {
  morning_class: { env: 'ZOHO_AGENCY_MORNING_ITEM_ID', def: '1215788000005580186' }, // 01 - Morning Class - Agency 2026
  evening_class: { env: 'ZOHO_AGENCY_EVENING_ITEM_ID', def: '1215788000005580195' }, // 04 - Evening Class - Agency 2026
}
const SESSION_LABEL: Record<string, string> = { morning_class: 'Morning Class', evening_class: 'Evening Class' }
const BILLABLE = ['confirmed', 'amended', 'completed'] // niente cancelled/pending

const envOr = (k: string, f: string) => Deno.env.get(k) ?? f

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

    // 1) Auth — staff JWT (pulsante manuale) OPPURE cron-secret (trigger auto-invoice)
    const cronSecret = req.headers.get('x-invoice-cron-secret') ?? ''
    const expectedCron = Deno.env.get('INVOICE_CRON_SECRET') ?? ''
    const viaCron = expectedCron.length > 0 && cronSecret === expectedCron
    if (!viaCron) {
      const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      })
      const { data: userData } = await authClient.auth.getUser()
      const uid = userData?.user?.id
      if (!uid) return json({ success: false, message: 'Unauthorized' }, 401)
      const { data: me } = await admin.from('profiles').select('role').eq('id', uid).single()
      if (!me || !STAFF.includes(me.role)) return json({ success: false, message: 'Forbidden' }, 403)
    }

    // 2) Input
    const body = await req.json().catch(() => ({}))
    const agencyId = body.agency_id as string
    const bookingIds: string[] = Array.isArray(body.booking_ids) ? body.booking_ids : []
    if (!agencyId || bookingIds.length === 0)
      return json({ success: false, message: 'agency_id and booking_ids[] required' }, 400)

    // 3) Agenzia + contatto Zoho
    const { data: agency } = await admin
      .from('profiles')
      .select('agency_company_name, full_name, zoho_contact_id')
      .eq('id', agencyId)
      .single()
    if (!agency) return json({ success: false, message: 'Agency not found.' }, 404)
    if (!agency.zoho_contact_id)
      return json({ success: false, message: 'Agency has no zoho_contact_id — link the Zoho customer first.' }, 400)

    // 4) Booking selezionati
    const { data: rows, error: rerr } = await admin
      .from('bookings')
      .select('internal_id, booking_date, session_id, pax_count, total_price, commission_amount, guest_name, booking_ref, status, zoho_invoice_id')
      .eq('user_id', agencyId)
      .in('internal_id', bookingIds)
      .order('booking_date', { ascending: true })
    if (rerr) return json({ success: false, message: rerr.message }, 500)
    if (!rows || rows.length === 0) return json({ success: false, message: 'No matching bookings.' }, 404)

    // 5) Idempotenza — se uno è già fatturato, stop
    const already = rows.find((r) => r.zoho_invoice_id)
    if (already)
      return json({ success: true, skipped: true, zoho_invoice_id: already.zoho_invoice_id, message: 'Some bookings already invoiced.' })

    // 6) Righe (solo billable, pax>0, sessione mappata)
    const skipped: string[] = []
    const lineRows = rows.filter((r) => {
      const ok = BILLABLE.includes(r.status ?? '') && (r.pax_count ?? 0) > 0 && SESSION_ITEM[r.session_id ?? '']
      if (!ok) skipped.push(r.internal_id)
      return ok
    })
    if (lineRows.length === 0)
      return json({ success: false, message: 'No billable bookings in selection.', skipped }, 400)

    const line_items = lineRows.map((r) => {
      const rate = Math.round(Number(r.total_price ?? 0) / r.pax_count) // total_price È GIÀ il net dovuto
      return {
        item_id: envOr(SESSION_ITEM[r.session_id!].env, SESSION_ITEM[r.session_id!].def),
        quantity: r.pax_count,
        rate,
        description: `${r.booking_date} · ${r.guest_name || r.booking_ref || '—'} · ${SESSION_LABEL[r.session_id ?? ''] ?? r.session_id}`,
      }
    })
    const amount = line_items.reduce((s, l) => s + l.rate * (l.quantity as number), 0)

    // 7) Crea l'Invoice in Zoho
    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const orgId = Deno.env.get('ZOHO_ORG_ID')!
    const token = await zohoAccessToken()
    const minDate = lineRows[0].booking_date
    const agencyShort = (agency.agency_company_name || agency.full_name || 'AGY').replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase()
    const payload = {
      customer_id: agency.zoho_contact_id,
      reference_number: `AGY-${agencyShort}-${lineRows.length}bk-${minDate}`,
      line_items,
    }
    const zres = await fetch(`https://www.zohoapis.${dc}/books/v3/invoices?organization_id=${orgId}`, {
      method: 'POST',
      headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const zdata = await zres.json()
    if (zdata.code !== 0 || !zdata.invoice?.invoice_id) {
      console.error('ZOHO_AGENCY_INVOICE_FAIL', zres.status, JSON.stringify(zdata))
      return json({ success: false, message: `Zoho error: ${zdata.message ?? JSON.stringify(zdata)}`, zoho_code: zdata.code ?? null, zoho: zdata }, 502)
    }
    const invoiceId = zdata.invoice.invoice_id as string
    const invoiceNumber = zdata.invoice.invoice_number as string

    // 8) Mark "sent" + email al cliente (best-effort: non blocca se fallisce)
    let emailed = false
    try {
      const eres = await fetch(`https://www.zohoapis.${dc}/books/v3/invoices/${invoiceId}/status/sent?organization_id=${orgId}`, {
        method: 'POST', headers: { Authorization: `Zoho-oauthtoken ${token}` },
      })
      await eres.json().catch(() => ({}))
      const mres = await fetch(`https://www.zohoapis.${dc}/books/v3/invoices/${invoiceId}/email?organization_id=${orgId}`, {
        method: 'POST', headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const mdata = await mres.json().catch(() => ({}))
      emailed = mdata.code === 0
    } catch (e) {
      console.error('ZOHO_AGENCY_INVOICE_EMAIL_FAIL', String(e))
    }

    // 9) Write-back: zoho_invoice_id sui booking + riga in agency_invoices (status unpaid)
    const { error: upErr } = await admin
      .from('bookings')
      .update({ zoho_invoice_id: invoiceId })
      .in('internal_id', lineRows.map((r) => r.internal_id))
    if (upErr)
      return json({ success: false, message: `Invoice created (${invoiceNumber}) but write-back failed: ${upErr.message}`, zoho_invoice_id: invoiceId }, 500)

    await admin.from('agency_invoices').insert({
      agency_id: agencyId,
      zoho_invoice_id: invoiceId,
      zoho_invoice_number: invoiceNumber,
      amount,
      booking_ids: lineRows.map((r) => r.internal_id),
      status: 'unpaid',
    })

    return json({
      success: true,
      zoho_invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      emailed,
      amount,
      bookings: lineRows.length,
      skipped,
    })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
