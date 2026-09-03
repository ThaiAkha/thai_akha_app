// Path: supabase/functions/send-market-confirmation/index.ts
// Conferma spese mercato brandizzata (EN) — un'email per stream:
//   • teacher    -> template Kitchen   (mercato: Chiang Mai Gate Market)
//   • logistics  -> template Logistics (mercato: Muang Mai Market)
// Invocata via functions.invoke quando teacher/logistics SALVANO il report (MarketShop.handleSave).
// Legge market_runs + ingredients_library (service-role), monta la griglia articoli e invia con Resend.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { MARKET_KITCHEN_EN, MARKET_LOGISTIC_EN, ITEM_ROW, renderEmail } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'
const OFFICE = 'office@thaiakhakitchen.com'
const DASHBOARD_URL = 'https://admin.thaiakha.com'
// Placeholder brand se un ingrediente non ha image_url valido
const PLACEHOLDER_IMG = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/brand-asset/1114_Logo_Main_600.png'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Role = 'teacher' | 'logistics'

interface SnapshotItem {
  id: string
  name: string
  unit: string
  price: number
  quantity: number
  target_shop?: string
}

interface MarketRun {
  id: string
  run_date: string
  created_at: string
  shopper_role: Role
  worker_id: string | null
  worker: { name: string | null } | { name: string | null }[] | null
  total_cost: number
  status: string
  items_snapshot: SnapshotItem[]
}

const TEMPLATE: Record<Role, string> = { teacher: MARKET_KITCHEN_EN, logistics: MARKET_LOGISTIC_EN }
const SHOP: Record<Role, string> = { teacher: 'Chiang Mai Gate Market', logistics: 'Muang Mai Market' }
const SUBJECT_LABEL: Record<Role, string> = { teacher: 'Kitchen', logistics: 'Logistics' }

interface ReqPayload {
  run_id?: string
  run_ids?: string[]
  to?: string
  record?: { id?: string } // tollera payload da Database Webhook
}

const TZ = 'Asia/Bangkok'

function fmtDateTime(iso: string): string {
  // "14 Jun 2026 · 15:30" — momento della compilazione (created_at), ora locale Thailandia
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
  return `${date} · ${time}`
}

function fmtDate(ymd: string): string {
  // "14 Jul 2026" — data scelta del report (run_date, solo data, no timezone shift)
  const d = new Date(`${ymd}T00:00:00`)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ })
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

async function sendResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  const detail = await res.json()
  return { ok: res.ok, id: (detail as { id?: string }).id, detail }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata')
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Service-role env non disponibile')

    const p: ReqPayload = await req.json()
    const ids = p.run_ids?.length ? p.run_ids : [p.run_id ?? p.record?.id].filter(Boolean) as string[]
    if (!ids.length) throw new Error('run_id mancante')

    const to = (p.to ?? '').trim() || OFFICE
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const results: Record<string, unknown> = {}

    for (const runId of ids) {
      const { data: run, error } = await supabase
        .from('market_runs')
        .select('id, run_date, created_at, shopper_role, total_cost, status, items_snapshot, worker_id, worker:authors!worker_id(name)')
        .eq('id', runId)
        .maybeSingle()

      if (error) { results[runId] = `error: ${error.message}`; continue }
      if (!run) { results[runId] = 'not found'; continue }

      const r = run as unknown as MarketRun
      const role: Role = r.shopper_role === 'logistics' ? 'logistics' : 'teacher'
      const items = Array.isArray(r.items_snapshot) ? r.items_snapshot : []

      // Risolvi la foto via image_asset_id -> media_assets (fonte unica; image_url legacy droppata)
      const itemIds = items.map(i => i.id).filter(Boolean)
      const imgMap: Record<string, string> = {}
      if (itemIds.length) {
        const { data: imgs } = await supabase
          .from('ingredients_library')
          .select('id, cover:media_assets!image_asset_id(image_url)')
          .in('id', itemIds)
        for (const row of (imgs ?? []) as unknown as { id: string; cover: { image_url: string | null } | null }[]) {
          const url = row.cover?.image_url
          if (url && url.startsWith('http')) imgMap[row.id] = url
        }
      }

      const rows = items.map(it => renderEmail(ITEM_ROW, {
        image_url: imgMap[it.id] || PLACEHOLDER_IMG,
        name: it.name ?? 'Item',
        qty: it.quantity ?? 0,
        unit: it.unit ?? '',
        price: it.price ?? 0,
      })).join('\n')

      // Chi ha fatto la spesa: la PERSONA (authors via worker_id), non il login.
      const who = Array.isArray(r.worker) ? r.worker[0] : r.worker
      const shopper = who?.name ?? '-'
      const reportDate = fmtDate(r.run_date)              // data scelta del report (run_date)
      const createdLabel = fmtDateTime(r.created_at)       // momento di compilazione (created_at)
      const html = renderEmail(TEMPLATE[role], {
        shop: SHOP[role],
        shopper,
        created_at: createdLabel,
        run_date: reportDate,
        item_count: items.length,
        status: cap(r.status || ''),
        total: Math.round(Number(r.total_cost) || 0),
        dashboard_url: DASHBOARD_URL,
        items_rows: rows,
      })

      const subject = `${SUBJECT_LABEL[role]} market expenses confirmed - ${reportDate}${who?.name ? ` · ${who.name}` : ''}`
      const sent = await sendResend(to, subject, html)
      results[runId] = sent.ok ? { sent: true, id: sent.id } : { sent: false, detail: sent.detail }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-market-confirmation error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
