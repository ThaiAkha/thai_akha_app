# send-market-confirmation

Email di **conferma spese mercato** (EN), una per stream:
- `teacher` → template **Kitchen**, mercato **Chiang Mai Gate Market**
- `logistics` → template **Logistics**, mercato **Muang Mai Market**

Mostra la griglia articoli (foto + nome + qty/unit + prezzo) e il totale (`total_cost`).
Invocata via `functions.invoke` quando teacher/logistics **salvano il report** (MarketShop).

## Input
```json
{ "run_id": "uuid" }            // singolo run
{ "run_ids": ["uuid", "..."] }  // più run (es. teacher mensile) → 1 email ciascuno
{ "to": "office@..." }          // opzionale, override destinatario (default office@thaiakhakitchen.com)
```
Tollera anche `{ "record": { "id": "uuid" } }` (payload Database Webhook).

## Output
`{ ok: true, results: { <run_id>: {...} } }` oppure `{ ok: false, error }`.

## Dati
- `market_runs` (service-role): `run_date, created_at, shopper_role, total_cost, status, items_snapshot`.
- `items_snapshot[]` = `{ id, name, unit, price, quantity }`. Foto via join `id → ingredients_library.image_url`
  (fallback brand `1114_Logo_Main_600.png` se mancante/relativo).
- **Date mostrate** = due righe: **Created** = `created_at` (compilazione, `14 Jun 2026 · 15:30`) e **Report date** = `run_date` (giorno scelto del report, `14 Jun 2026`). Per report retrodatati dal manager le due differiscono; per il teacher coincidono. Oggetto = report date.
- **Total** = `total_cost`. ⚠️ Nei run `logistics` i `price` per-riga sono spesso `0` (solo total valorizzato):
  l'email mostra `0` per riga e il `total_cost` corretto, finché i prezzi non sono compilati nello snapshot.

## Env / secret (già presenti — NON committare)
- `RESEND_API_KEY` · `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (auto-iniettate). Nessun secret nuovo.

## Deploy (da eseguire a mano)
```bash
supabase functions deploy send-market-confirmation
```

## Trigger (attuale)
**(C) app-invoke**: in `packages/admin/src/pages/market/MarketShop.tsx` (`handleSave`), dopo l'upsert
riuscito del report, **non-blocking** (un errore email non blocca il salvataggio).
Alternative non attive: Database Webhook su `market_runs` o chiamata da `zoho-create-market-expense`.

## Template
`templates.ts` — `MARKET_KITCHEN_EN` / `MARKET_LOGISTIC_EN` (base dal brain `market_{kitchen,logistic}_en.html`)
+ `ITEM_ROW`. Merge header: `{{shop}} {{created_at}} {{run_date}} {{item_count}} {{status}} {{total}} {{dashboard_url}} {{items_rows}}`.
Merge riga: `{{image_url}} {{name}} {{qty}} {{unit}} {{price}}`.
