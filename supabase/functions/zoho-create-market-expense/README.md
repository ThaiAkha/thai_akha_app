# Market Auto-Expense → Zoho

Sistema di **spese mercato auto-generate** per i due stream (logistic + kitchen/teacher).
Gemello di `zoho-create-driver-expense`.

## Flusso

```
market_runs (status=approved)  ──cron 15min──▶  get_market_pending_expenses()
        │                                              │ gruppi pronti
        │                                              ▼
        │                              private.market_autoexpense_tick()
        │                                              │ pg_net POST (x-market-cron-secret)
        ▼                                              ▼
   write-back  ◀──────────  edge: zoho-create-market-expense  ──▶  Zoho Books Expense
   status=expensed                                                  (account + vendor per stream)
   zoho_expense_id
```

- **logistics** → 1 Expense **per run** (giorno)
- **teacher/kitchen** → 1 Expense **per mese** (somma run del mese)
- Auto-genera **solo** run `approved` + non-expensed + totale > 0. I run a ฿0 sono saltati.
- **Idempotente**: se un run del gruppo ha già `zoho_expense_id`, salta.
- Approvazione = manager (guard invariato). L'auto-expense agisce solo su run già approvati.

## Mappatura Zoho (verificata 2026-06-21 · org 663160082)

| Stream | Expense account | Vendor | Paid through |
|---|---|---|---|
| **logistics** | `1215788000000062500` — Market - Muang Mai | `1215788000003561155` — 00 - Muang Mai Market | `1215788000000000361` — Cash - Red Box |
| **teacher** | `1215788000000000400` — Market - Chiang Mai Gate | `1215788000003561168` — 01 - Chiang Mai Market | `1215788000000000361` — Cash - Red Box |

> Nota: i nomi conto/vendor combaciano con la geografia DB (logistic compra al Muang Mai, teacher al Chiang Mai Gate). Default hardcoded nella edge, sovrascrivibili via secret.

## Deploy (da fare a mano — non automatizzabile da qui)

1. **Secret edge** (Supabase → Edge Functions → Secrets):
   - `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ORG_ID=663160082`, `ZOHO_DC=com`
   - `MARKET_CRON_SECRET=<stringa-random-robusta>`
   - (opz.) override `ZOHO_MARKET_*_ACCOUNT_ID/_VENDOR_ID`, `ZOHO_MARKET_PAID_THROUGH_ACCOUNT_ID`
2. **Deploy**: `supabase functions deploy zoho-create-market-expense`
3. **Attiva il cron** (SQL):
   ```sql
   update private.market_cron_config set
     edge_url    = 'https://mtqullobcsypkqgdkaob.functions.supabase.co/zoho-create-market-expense',
     cron_secret = '<lo-stesso-MARKET_CRON_SECRET>',
     enabled     = true, updated_at = now()
   where id;
   ```

## Pulsante manuale (app admin)

La edge accetta anche staff con JWT (ruoli: admin/manager/kitchen/logistics) senza il cron-secret —
body `{ "stream": "teacher", "run_ids": ["..."] }` oppure `{ "stream", "period_start", "period_end" }`.

## Test (dopo deploy)

```bash
# dry sul gruppo pendente (teacher 2026-06, ฿1176)
curl -X POST "$EDGE/zoho-create-market-expense" \
  -H "x-market-cron-secret: $MARKET_CRON_SECRET" -H "Content-Type: application/json" \
  -d '{"stream":"teacher","run_ids":["20b90858-38ad-4a4a-a4e9-da0ae958ef27"]}'
# riesegui → deve rispondere skipped:true (idempotenza)
```
