// supabase/functions/zoho-create-pos-invoice/index.ts
//
// Chiusura POS giornaliera → 2 fatture Zoho Books:
//   CASH → cliente "00 - Thai Akha Kitchen"      · righe tax 0%   · incasso su Shop Box
//   CARD → cliente "00 - Thai Akha Kitchen - Card" · righe tax 3% CC · incasso su Bank 7502
//
// Decisione owner 2026-09-02 (#8): la fattura CARD include la 3% carta dove
// applicata e segnalata (es. 5.600 incassati → fattura 5.768). La chiusura di
// cassa resta il netto riga; la surcharge la calcola Zoho dalla tax compound.
//
// v3 (#8, 2026-09-02):
//  - Risoluzione item via shop_akha.zoho_item_id (una select) invece del paging
//    del catalogo Zoho per SKU: app e Zoho usano DUE schemi SKU diversi
//    (app SH-BE-009 = Zoho SH-301-2024), quindi il match per SKU non poteva
//    funzionare. Le 2 quote classe hanno mappa statica (SKU gia' in formato Zoho).
//  - rate esplicito per riga dallo snapshot POS (amount/quantity della RPC):
//    la fattura riflette cio' che il POS ha incassato, non il listino Zoho.
//  - dry_run: true → payload completo (righe, subtotali, totale atteso col 3%)
//    SENZA chiamate Zoho e senza write-back. Provarlo prima del run vero.
//
// Trigger: il MANAGER, a fine incassi, dalla pagina Report > Classes (canale staff JWT).
// Righe via RPC get_pos_daily_invoice(day): quota classe (solo pay_on_arrival) + prodotti shop,
// aggregate per SKU → item Zoho (income deriva dall'item). Idempotente: la RPC esclude i gruppi
// gia fatturati; write-back zoho_invoice_id su ogni booking incluso.
//
// ENV: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORG_ID, ZOHO_DC
//   [override opzionali] ZOHO_POS_CASH_CUSTOMER_ID, ZOHO_POS_CARD_CUSTOMER_ID,
//   ZOHO_POS_TAX_0_ID, ZOHO_POS_TAX_CC_ID, ZOHO_POS_CASH_DEPOSIT_ID, ZOHO_POS_CARD_DEPOSIT_ID,
//   ZOHO_POS_TEMPLATE_ID, ZOHO_POS_MORNING_ITEM_ID, ZOHO_POS_EVENING_ITEM_ID
//   (+ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY iniettate da Supabase)

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } })

const STAFF = ['admin', 'manager']
const envOr = (k: string, d: string) => Deno.env.get(k) ?? d

// Config per tender (default = ID verificati org 663160082, riverificati 2026-09-02)
const TENDER_CFG: Record<string, { customerEnv: string; customerDef: string; taxEnv: string; taxDef: string; depositEnv: string; depositDef: string; mode: string; taxRate: number }> = {
  cash: {
    customerEnv: 'ZOHO_POS_CASH_CUSTOMER_ID', customerDef: '1215788000000063015', // 00 - Thai Akha Kitchen
    taxEnv: 'ZOHO_POS_TAX_0_ID',  taxDef: '1215788000003250539',                  // 0% Thailand
    depositEnv: 'ZOHO_POS_CASH_DEPOSIT_ID', depositDef: '1215788000000000358',    // Cash - Shop Box
    mode: 'cash', taxRate: 0,
  },
  card: {
    customerEnv: 'ZOHO_POS_CARD_CUSTOMER_ID', customerDef: '1215788000004125434', // 00 - Thai Akha Kitchen - Card
    taxEnv: 'ZOHO_POS_TAX_CC_ID', taxDef: '1215788000004713001',                  // 3% Credit Card (compound, surcharge al cliente)
    depositEnv: 'ZOHO_POS_CARD_DEPOSIT_ID', depositDef: '1215788000000147263',    // Bank Account 01 - 7502
    mode: 'creditcard', taxRate: 3,
  },
}
const TEMPLATE_DEF = '1215788000005505005' // Receipt/Tax Invoice 2024 - OK

// Quote classe: SKU della RPC (gia' in formato Zoho) → item Zoho, mappa statica
const classItems = (): Record<string, string> => ({
  'SE-000-2024': envOr('ZOHO_POS_MORNING_ITEM_ID', '1215788000000063027'), // 00 - Morning Class
  'SE-003-2024': envOr('ZOHO_POS_EVENING_ITEM_ID', '1215788000000062243'), // 03 - Evening Class
})

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

// Mappa SKU app → item_id Zoho: classi da mappa statica, shop da shop_akha.zoho_item_id.
async function buildSkuMap(admin: SupabaseClient, needed: Set<string>): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const cls = classItems()
  const shopSkus: string[] = []
  for (const sku of needed) {
    if (cls[sku]) map.set(sku, cls[sku])
    else shopSkus.push(sku)
  }
  if (shopSkus.length) {
    const { data, error } = await admin.from('shop_akha').select('sku, zoho_item_id').in('sku', shopSkus)
    if (error) throw new Error(`lettura shop_akha: ${error.message}`)
    for (const r of (data ?? []) as { sku: string; zoho_item_id: string | null }[]) {
      if (r.zoho_item_id) map.set(r.sku, r.zoho_item_id)
    }
  }
  return map
}

const round2 = (n: number) => Math.round(n * 100) / 100

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

    // 2) Input
    const { day, dry_run } = await req.json().catch(() => ({}))
    if (!day) return json({ success: false, message: 'day (YYYY-MM-DD) required' }, 400)

    // 3) Righe del giorno
    const { data: rows, error: rpcErr } = await admin.rpc('get_pos_daily_invoice', { p_day: day })
    if (rpcErr) return json({ success: false, message: rpcErr.message }, 500)
    type Row = { tender: string; session: string; booking_id: string; sku: string | null; quantity: number; amount: number; line_type: string }
    const all = (rows ?? []) as Row[]
    if (all.length === 0) return json({ success: true, skipped: true, message: 'Nothing to invoice for this day.' })

    // 4) Raggruppa per SESSIONE x TENDER (fino a 4 fatture) → aggrega qty e importo per SKU + booking_ids
    const buckets: Record<string, { session: string; tender: string; qtyBySku: Map<string, number>; amtBySku: Map<string, number>; bookingIds: Set<string> }> = {}
    const neededSkus = new Set<string>()
    for (const r of all) {
      if (!r.sku) continue
      const key = `${r.session}|${r.tender}`
      buckets[key] ??= { session: r.session, tender: r.tender, qtyBySku: new Map(), amtBySku: new Map(), bookingIds: new Set() }
      buckets[key].qtyBySku.set(r.sku, (buckets[key].qtyBySku.get(r.sku) ?? 0) + Number(r.quantity))
      buckets[key].amtBySku.set(r.sku, (buckets[key].amtBySku.get(r.sku) ?? 0) + Number(r.amount))
      buckets[key].bookingIds.add(r.booking_id)
      neededSkus.add(r.sku)
    }

    // 5) Risolvi SKU app → item_id Zoho (shop_akha + mappa classi, NON il catalogo Zoho:
    //    gli SKU Zoho seguono un altro schema e il match diretto non trova nulla)
    const skuMap = await buildSkuMap(admin, neededSkus)
    const missing = [...neededSkus].filter((s) => !skuMap.has(s))
    if (missing.length) return json({ success: false, message: `SKU senza zoho_item_id in shop_akha: ${missing.join(', ')}` }, 422)

    // 6) Righe per bucket: item_id + quantity + RATE dallo snapshot POS (amount/qty)
    type Line = { item_id: string; quantity: number; rate: number; tax_id: string }
    const buildLines = (b: (typeof buckets)[string], taxId: string): Line[] =>
      [...b.qtyBySku.entries()].map(([sku, qty]) => ({
        item_id: skuMap.get(sku)!,
        quantity: qty,
        rate: round2((b.amtBySku.get(sku) ?? 0) / (qty || 1)),
        tax_id: taxId,
      }))

    // 6b) DRY-RUN: payload completo, zero chiamate Zoho, zero write-back
    if (dry_run) {
      const preview = Object.values(buckets).map((b) => {
        const cfg = TENDER_CFG[b.tender]
        if (!cfg) return null
        const taxId = envOr(cfg.taxEnv, cfg.taxDef)
        const lines = buildLines(b, taxId)
        const subtotal = round2(lines.reduce((s, l) => s + l.rate * l.quantity, 0))
        return {
          session: b.session, tender: b.tender,
          reference_number: `POS-${day}-${b.session === 'morning_class' ? 'AM' : 'PM'}-${b.tender.toUpperCase()}`,
          customer_id: envOr(cfg.customerEnv, cfg.customerDef),
          deposit_account_id: envOr(cfg.depositEnv, cfg.depositDef),
          line_items: lines,
          subtotal,
          tax_percentage: cfg.taxRate,
          expected_total: round2(subtotal * (1 + cfg.taxRate / 100)),
          bookings: b.bookingIds.size,
          booking_ids: [...b.bookingIds],
        }
      }).filter(Boolean)
      return json({ success: true, dry_run: true, day, invoices: preview })
    }

    const dc = Deno.env.get('ZOHO_DC') ?? 'com'
    const org = Deno.env.get('ZOHO_ORG_ID')!
    const token = await zohoToken()

    const results: Array<{ session: string; tender: string; invoice_id: string; invoice_number?: string; total: number; bookings: number }> = []

    // 7) Una fattura per (sessione x tender)
    for (const key of Object.keys(buckets)) {
      const b = buckets[key]
      const cfg = TENDER_CFG[b.tender]
      if (!cfg) continue
      const taxId = envOr(cfg.taxEnv, cfg.taxDef)
      const lineItems = buildLines(b, taxId)
      if (lineItems.length === 0) continue

      // Crea fattura
      const invRes = await fetch(`https://www.zohoapis.${dc}/books/v3/invoices?organization_id=${org}`, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: envOr(cfg.customerEnv, cfg.customerDef),
          date: day,
          payment_terms: 0,
          reference_number: `POS-${day}-${b.session === 'morning_class' ? 'AM' : 'PM'}-${b.tender.toUpperCase()}`,
          template_id: envOr('ZOHO_POS_TEMPLATE_ID', TEMPLATE_DEF),
          line_items: lineItems,
        }),
      })
      const invData = await invRes.json()
      if (invData.code !== 0 || !invData.invoice?.invoice_id) {
        console.error('ZOHO_POS_INVOICE_FAIL', key, invRes.status, JSON.stringify(invData))
        return json({ success: false, message: `Zoho invoice (${key}): ${invData.message ?? JSON.stringify(invData)}`, zoho: invData }, 502)
      }
      const inv = invData.invoice
      const total = Number(inv.total)

      // Registra incasso → conto deposito per tender (fattura a 'paid')
      const payRes = await fetch(`https://www.zohoapis.${dc}/books/v3/customerpayments?organization_id=${org}`, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: envOr(cfg.customerEnv, cfg.customerDef),
          payment_mode: cfg.mode,
          amount: total,
          date: day,
          account_id: envOr(cfg.depositEnv, cfg.depositDef),
          invoices: [{ invoice_id: inv.invoice_id, amount_applied: total }],
        }),
      })
      const payData = await payRes.json()
      if (payData.code !== 0) {
        // Fattura creata ma incasso non registrato: segnalo (non blocco il write-back)
        console.error('ZOHO_POS_PAYMENT_FAIL', key, payRes.status, JSON.stringify(payData))
      }

      // Write-back idempotente sui booking del bucket
      const { error: upErr } = await admin
        .from('bookings')
        .update({ zoho_invoice_id: inv.invoice_id })
        .in('internal_id', [...b.bookingIds])
      if (upErr) return json({ success: false, message: `Invoice ${inv.invoice_number} creata ma write-back fallito: ${upErr.message}` }, 500)

      results.push({ session: b.session, tender: b.tender, invoice_id: inv.invoice_id, invoice_number: inv.invoice_number, total, bookings: b.bookingIds.size })
    }

    return json({ success: true, day, invoices: results })
  } catch (e) {
    return json({ success: false, message: String(e instanceof Error ? e.message : e) }, 500)
  }
})
