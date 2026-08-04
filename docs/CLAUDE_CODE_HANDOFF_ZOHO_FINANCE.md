# Handoff → Claude Code — Chiusura caso "Zoho Finance" (Market · POS · Salari)

Prompt di chiusura. Il **DB è già applicato live**; edge + modifiche React sono **nel repo ma da deployare**. Nessun bug di logica (verificato in sessione). Obiettivo: deployare, completare la pagina Salari, e fare i check post-deploy con la manager.

## Regole
- GO-gate su scritture reali; mai muovere denaro reale in automatico (le edge documentano, non pagano).
- No em-dash nei testi; virgolette dritte in `.ts/.tsx/.json`.
- ID conto/vendor/tax SOLO da `thai_akha_brain/900_Infrastructure/Zoho/Zoho_Domain_Map.json` (già verificati). `org_id=663160082`.
- `is_admin()` = role IN (admin, manager) → la manager è autorizzata su edge/RLS/guard.

## Già FATTO (non rifare)
Migration applicate live + in repo:
- `supabase/migrations/20260621000000_market_pending_expenses.sql` (RPC `get_market_pending_expenses`)
- `supabase/migrations/20260621000100_market_autoexpense_cron.sql` (cron `market-autoexpense`, **DISABILITATO** di default)
- `supabase/migrations/20260624000000_pos_daily_invoice.sql` (`bookings.pos_tender` + RPC `get_pos_daily_invoice`)
- `supabase/migrations/20260624000100_staff_salaries.sql` (`staff_salaries` + `profiles.base_salary` + RPC `get_salary_run`)

Edge nel repo (NON deployate): `zoho-create-market-expense`, `zoho-create-pos-invoice`, `zoho-create-salary-expense`.
React nel repo (compilano; da build+deploy): `hooks/useManagerPos.ts` (settlePayment + handlePayCard), `components/manager/pos/PosInspector.tsx` (bottone Card), `pages/manager/ManagerPos.tsx`, `pages/manager/ManagerReports.tsx` (tab **Classes**).
> tsc: gli errori su `adminPrompt`/`useCherryChat`/`scopedData` sono **preesistenti** (prompt symlink assenti in questo checkout), non introdotti qui.

## DA FARE
1. **Deploy edge**: `supabase functions deploy zoho-create-market-expense zoho-create-pos-invoice zoho-create-salary-expense`. I secret `ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN/ORG_ID/DC` esistono già (il driver-expense live lo prova); gli ID conto hanno default nel codice → **nessun secret nuovo obbligatorio**. `MARKET_CRON_SECRET` serve SOLO se si attiva il cron market (lasciarlo spento per ora).
2. **Pagina Salari** `ManagerSalaries.tsx` (spec completa: `supabase/functions/zoho-create-salary-expense/README.md`): selettore mese → `get_salary_run(period)`; lista 9 lavoratori con importo (prefill `base_salary`) + nota OT + toggle Bank/Cash; salva → upsert `staff_salaries` su unique(employee_id,period); bottone "Crea spese salari" → invoke `zoho-create-salary-expense {period}`; bottone SEPARATO "Genera payslip". Aggiungere route + voce nav (manager).
3. **Payslip**: nuovo tipo `salary_payslip` in `supabase/functions/render-report` che riusa `thai_akha_brain/600_Business_Thai_Akha/605_Financial/Payroll/payslip_a5_bilingual.py` (`build(data,out)`), mapping campi come nel README (versione minima: employee_name, position, period, salary=total, net=total, resto 0).
4. **i18n**: aggiungere le chiavi EN nuove (`pos.inspector.payCard`; `manager.reports.typeClasses/day/cash/card/posGenerate/posTotalBase/posHint/posNothing/posOk`) e propagare TH/ES/ZH via lo skill `/i18n`. (Ora rendono via defaultValue.)
5. **Agency edge**: verificare che `zoho-create-agency-invoice` e `zoho-record-agency-payment` (richiamate da `ManagerReports`) siano deployate; se mancano dal repo, recuperarle/deployarle.
6. **Build + deploy admin app** (Firebase) per pubblicare tab Classes + Paga Carta.

## Check post-deploy (con la manager — dati reali)
- **Market**: ManagerReports → Market·Kitchen → mese **Luglio 2026** → "Create Zoho expense (monthly)" → attesa: 1 Expense Zoho **฿6.803** su *Market - Chiang Mai Gate*, i 19 run → `expensed`. (Se già esportata via connettore, salterà: idempotente.)
- **POS**: ManagerPos → chiudi un gruppo **Cash** e uno **Card** → ManagerReports → **Classes** → scegli il giorno → "Generate Zoho invoices" → attesa: fino a 4 fatture (morning/evening × cash/card), card con +3%.
- **Salari**: ManagerSalaries → importi + metodo → "Crea spese salari" → attesa: 1 Expense **bank** + 1 **cash** raggruppate (nomi in descrizione). Poi "Genera payslip" → N PDF.
- **Idempotenza**: ri-cliccare → "skipped / già fatturato".

## Mappa Zoho (riferimento rapido)
- Market teacher: acct `1215788000000000400` · vendor `1215788000003561168` · Red Box `1215788000000000361`
- Market logistics: acct `1215788000000062500` · vendor `1215788000003561155` · Red Box `…000361`
- POS cash: cliente `1215788000000063015` · tax 0% `1215788000003250539` · deposito Shop Box `1215788000000000358`
- POS card: cliente `1215788000004125434` · tax 3% `1215788000004713001` · deposito Bank 7502 `1215788000000147263`
- Salari bank: acct `1215788000000032023` · Bank 7502 · | cash: acct `1215788000000064005` · Black Box `1215788000000097047`
