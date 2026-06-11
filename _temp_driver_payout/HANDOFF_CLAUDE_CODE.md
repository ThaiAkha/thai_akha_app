# Handoff — Sistema iniezione manuale payout driver (bypass booking)

> Documento da passare a **Claude Code** in una nuova chat nel repo `thaiakha-cherry-2026`.
> Tutto il materiale è in `_temp_driver_payout/`. È una soluzione **TEMPORANEA**: vedi `README_TEMPORANEO.md`.

## STATO (agg. 2026-06-11)

**✅ Fatto — Task 1–4 + verifica (Task 6).**
- DB produzione: colonna `source` + RPC `inject_driver_payout_manual` applicate e testate. **Bug fix**: le colonne nelle query interne sono qualificate (`dp.`/`t.`) per evitare l'ambiguità con gli OUT param omonimi (`status`, `total_stops`, `payout_amount`); INSERT con alias `AS dp`. Vedi `migration.sql` aggiornato.
- Sicurezza verificata: RLS (driver legge solo i propri), blocco record `paid`, UPSERT idempotente, rifiuto driver≠self senza admin.
- Tipi TS rigenerati (`database.types.ts`).
- Form **"Dichiara servizio"** in `DriverHome.tsx` (toggle Dashboard/Payout) + nuovo componente `DriverPayoutForm.tsx`, con componenti UI esistenti.
- Edge function `send-driver-payout-confirmation/index.ts` **scritta, pronta al deploy**.

**Design chiave — degradazione graziosa:** il form salva il payout e mostra la conferma **anche senza email/deploy**. L'invio è in `try/catch` e degrada a *"Payout salvato (email non disponibile)"*. Il modulo è quindi già usabile end-to-end; quando il flusso email è sistemato e la function deployata, la conferma parte da sola **senza toccare il frontend**.

**⏳ Rimandato — Task 5 (report settimanale):** si costruisce quando le email consegnano davvero. Il job esistente `weekly_driver_payouts` continua a girare, **non toccato**.

**🔧 Da fare lato utente (parallelo):**
1. Fix consegna email (dominio Resend / secret / webhook) — Supabase, dominio dell'agente `/email`.
2. Deploy: `supabase functions deploy send-driver-payout-confirmation`.

## Obiettivo

Bypassare temporaneamente il sistema booking. Un **driver** (self-service) dichiara a mano il servizio svolto tramite un form; i dati vengono iniettati nella tabella reale `driver_payments`, generando il payout. Da lì partono **email di conferma** e **report settimanali** automatici.

## Contesto tecnico (verificato sul DB di produzione `mtqullobcsypkqgdkaob`)

- **`driver_payments`**: `id, driver_id (FK profiles.id), run_date, session_id, total_stops, total_pax, payout_amount, status('pending'|'paid'), paid_at, source, created_at, updated_at`. Vincolo UNIQUE `(driver_id, run_date, session_id)`. RLS attiva: policy `Driver Read Own` (`auth.uid()=driver_id`, SELECT) e `Admin Payment Access` (`is_admin()`, ALL).
- **`driver_payout_tiers`**: scaglioni tariffa. Morning: 1‑2→450, 3‑4→550, 5‑6→650, 7+→750. Evening: 1‑2→400, 3‑4→500, 5‑6→600, 7+→700 (THB).
- **RPC esistente** `calculate_driver_payout(driver_id, run_date, session_id)`: deriva il payout dai `bookings`. **NON** va riusata per il bypass (legge i booking che qui saltiamo).
- **Driver attuali** (`profiles.role='driver'`): Driver 01 `b7866c46-221d-4b16-9fd8-72722d173de5`, Driver 02 `b85dffbe-a935-40ae-99cc-ed453a757f37`, Thai Akha `5810f384-5390-49f1-8277-035487b11cb5`.
- **Email**: Resend già in uso (`supabase/functions/send-welcome-email`, `send-booking-confirmation`). ⚠️ Mittente ancora placeholder `noreply@yourdomain.com` → serve dominio verificato.
- **App driver**: package `admin`. `pages/driver/DriverHome.tsx` (landing), `pages/driver/DriverRoute.tsx` (rotta live). Rotte `/driver-home`, `/driver`. Regole repo in `CLAUDE.md` (Typography, token semantici, mobile-first, import da `@thaiakha/shared`).

## Decisioni di prodotto (già prese)

- Chi compila: **il driver stesso** (self-service). `driver_id = auth.uid()`.
- Dove: **vista dentro `DriverHome.tsx`** (toggle/tab), **nessuna nuova rotta**.
- Email + report: **automatici/schedulati**.

---

## TASK LIST

### ☑ Task 1 — Migrazione DB ✅ FATTO
Applicata `migration.sql` (colonna `source` + RPC `inject_driver_payout_manual`) sul DB produzione, con bug fix qualificazione colonne.
- Firma RPC: `inject_driver_payout_manual(p_run_date date, p_session_id text, p_total_stops int, p_total_pax int, p_driver_id uuid DEFAULT NULL)` → ritorna `(payout_amount, total_stops, status)`.
- Mappa range→stops rappresentativi: `1-2→2, 3-4→4, 5-6→6, 7plus→7` (la tariffa dipende solo dallo scaglione).

### ☑ Task 2 — Rigenerare i tipi TypeScript ✅ FATTO
`packages/shared/src/types/database.types.ts` rigenerato da Supabase.

### ☑ Task 3 — Vista form in DriverHome ✅ FATTO
Integrare il form di `pickup-form-prototype.html` come **vista React dentro `DriverHome.tsx`** (toggle/tab). Convertire in TSX seguendo le regole repo:
- `<Typography>` invece di tag raw; token semantici (`text-title`, `text-desc`…), niente `text-gray-*`.
- Spaziature fluid (`--space-fluid-*`), mobile-first (test a 375px).
- Campo **Nome driver**: in self-service è **bloccato sul driver loggato** (niente picker); mostrare solo il nome. Il picker resta utile solo per admin (fuori scope ora).
- **Prezzo** calcolato a display via i tier (idealmente letti dal DB, non hardcoded).
- Submit → `supabase.rpc('inject_driver_payout_manual', { p_run_date, p_session_id, p_total_stops, p_total_pax })` usando lo stop rappresentativo. Mostrare il payout ritornato in conferma.
- Marcare il codice con un commento `// BYPASS-PAYOUT (temporaneo)` per il rollback.

### ☑ Task 4 — Edge function email conferma ✅ SCRITTA (deploy pendente)
`supabase/functions/send-driver-payout-confirmation/index.ts` pronta (pattern Resend). Invocata dal client dopo l'RPC, in `try/catch` con degradazione graziosa. ⚠️ Restano da fare lato utente: **dominio mittente verificato** + `supabase functions deploy send-driver-payout-confirmation`.

### ⏳ Task 5 — Report settimanale schedulato — RIMANDATO
Si costruisce quando le email consegnano. Scheduled task settimanale: legge `driver_payments` della settimana (filtrabile `source='manual'`), raggruppa per driver, genera PDF nello **stile Driver Report approvato**, invia via email. Riusare l'asset report del brain (skill `driver-ops`). Nota: il job esistente `weekly_driver_payouts` continua a girare, non toccato.

### ☑ Task 6 — Verifica ✅ FATTO
- Test RPC: tier corretto per ogni range/sessione; UPSERT idempotente; rifiuto su record `paid`; rifiuto driver≠self senza admin. ✅
- RLS verificata (il driver legge solo i propri payout). ✅
- Code review su componente ed edge function. ✅

---

## File in questa cartella
- `pickup-form-prototype.html` — prototipo form autonomo (riferimento UI/logica).
- `migration.sql` — migrazione applicata (Task 1), con bug fix qualificazione colonne.
- `rollback.sql` — rimozione completa del bypass.
- `README_TEMPORANEO.md` — natura temporanea + istruzioni di rollback.

## File toccati nel repo (per il rollback)
- `packages/admin/src/pages/driver/DriverHome.tsx` — toggle vista (marcato `// BYPASS-PAYOUT`).
- `packages/admin/src/pages/driver/DriverPayoutForm.tsx` — **nuovo** componente form.
- `packages/shared/src/types/database.types.ts` — tipi rigenerati.
- `supabase/functions/send-driver-payout-confirmation/index.ts` — **nuova** edge function.
