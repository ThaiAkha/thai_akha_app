# ⚠️ SOLUZIONE TEMPORANEA — Iniezione manuale payout driver

**Cos'è.** Un bypass del sistema booking. Finché i booking non guidano il payout, il driver dichiara a mano il servizio (data, classe, n° hotel, pax) e il payout viene scritto direttamente in `driver_payments`. Da lì partono email di conferma e report settimanali.

## Stato attuale (verificato 2026-06-12 sul DB live)

Sistema **completo e in uso reale** (già 3 payout manuali con status `paid`).

**Database (produzione):**
- Colonna `driver_payments.source` (`'auto'` default | `'manual'`).
- Funzioni: `inject_driver_payout_manual` (driver dichiara), `delete_my_payout` (driver elimina un proprio servizio, solo se `pending` e settimana non chiusa), `mark_driver_week_paid` (admin chiude la settimana → `paid`). La legacy `calculate_driver_payout` (booking-based) resta, bypassata.
- **Realtime ON** su `driver_payments` (popup pagamento live).
- Lucchetto settimana: una settimana con almeno un record `paid` è chiusa (no inject/delete su quella settimana).

**App (package `admin`):**
- Driver: `DriverHome.tsx` (tab), `DriverPayoutForm.tsx` (dichiara), `DriverPayoutDashboard.tsx` (vede/elimina i propri, aggregati per settimana ISO).
- Manager: `ManagerReports.tsx` (report + pagamento/fatturazione Zoho), `ManagerDriverPayouts.tsx` (report driver-centric, mark-paid). Rotta `/manager-reports`.
- i18n: `driver.json` + nuovo `manager.json` (EN/TH).

**Edge functions:**
- `send-driver-payout-confirmation` — email conferma (Resend). **LIVE**: `RESEND_API_KEY` valido, dominio `thaiakhakitchen.com` verificato, mittente `driver@thaiakhakitchen.com`, bcc `office@`.
- `render-report` — PDF report A5 (proxy Cloud Run / WeasyPrint).
- `zoho-create-driver-expense` — crea spesa driver su Zoho Books.

**Cosa è davvero "temporaneo"** (da rimuovere al ritorno dei booking): il **path di iniezione manuale** (`inject_driver_payout_manual`, form Dichiara servizio, distinzione `source`). **Riusabili anche con payout `auto`** (valutare se tenerli): report, mark-paid settimana, Realtime, Zoho expense.

**Perché è temporanea.** Quando il sistema booking tornerà la fonte di verità, il payout sarà di nuovo calcolato in automatico da `calculate_driver_payout` (che legge i `bookings`). Il path manuale va allora **rimosso**.

**Come riconoscere i dati del bypass.** Ogni record iniettato a mano ha `driver_payments.source = 'manual'`. I record da booking hanno `source = 'auto'`. Così li distingui e ripulisci senza ambiguità.

---

## Tornare al punto attuale (rollback) — 3 livelli

### 1. Database
Esegui `rollback.sql` (già aggiornato). Rimuove: i payout `source='manual'` (opzionale), le 3 funzioni del bypass (`inject_driver_payout_manual`, `delete_my_payout`, `mark_driver_week_paid`), la colonna `source`, e il Realtime su `driver_payments`. Dopo, il DB è identico a pre-bypass.

### 2. App (package `admin`)
Tutti i punti di innesto sono marcati `// BYPASS-PAYOUT (temporaneo)` — `grep -rn "BYPASS-PAYOUT" packages/admin/src` li trova tutti.
- Rimuovi i **tab + viste** in `pages/driver/DriverHome.tsx`.
- Elimina i componenti `pages/driver/DriverPayoutForm.tsx` e `pages/driver/DriverPayoutDashboard.tsx`.
- Elimina/valuta le pagine manager `pages/manager/ManagerReports.tsx` e `pages/manager/ManagerDriverPayouts.tsx` (+ rotta `/manager-reports` in `App.tsx`).
- Elimina le edge functions `send-driver-payout-confirmation`, e — se non le tieni come back-office permanente — `render-report` e `zoho-create-driver-expense`.
- Rimuovi le chiavi i18n del payout in `i18n/locales/{en,th}/driver.json` e il file `manager.json`.
- Rigenera `packages/shared/src/types/database.types.ts` (sparisce `source`).

> Nota: report, mark-paid e Zoho expense funzionano anche con payout `auto`. Se vuoi tenerli come back-office permanente, rimuovi solo il path di iniezione manuale (form + `inject_driver_payout_manual` + distinzione `source`).

### 3. File di supporto
- Elimina l'intera cartella `_temp_driver_payout/`.

---

## Sicurezza Git (consigliato)

Prima di iniziare l'implementazione, crea un punto di ripristino pulito:

```bash
git checkout -b feature/driver-payout-bypass
git add -A && git commit -m "checkpoint: pre-bypass payout driver"
```

Così tornare al punto attuale è immediato:

```bash
git checkout main          # l'app torna esattamente a com'è oggi
git branch -D feature/driver-payout-bypass   # se vuoi scartare tutto
```

Il rollback del **database** (sopra) va comunque eseguito a parte: Git non versiona lo stato di Supabase.

---

## Regole d'oro
- **Mai muovere denaro reale in automatico.** Il sistema *prepara* payout e report; il pagamento lo conferma ed esegue una persona.
- I record `paid` non sono modificabili dal form (la RPC li blocca).
- Le tariffe restano in `driver_payout_tiers` (unica fonte di verità), non hardcodate nell'app.
