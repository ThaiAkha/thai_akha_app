# Handoff — Sistema iniezione manuale payout driver (bypass booking)

> Documento da passare a **Claude Code** in una nuova chat nel repo `thaiakha-cherry-2026`.
> Tutto il materiale è in `_temp_driver_payout/`. È una soluzione **TEMPORANEA**: vedi `README_TEMPORANEO.md`.

## STATO (agg. 2026-06-11, sera)

**✅ Fatto — Task 1–4 + verifica + EMAIL LIVE.**
- DB produzione: colonna `source` + RPC `inject_driver_payout_manual` applicate e testate. **Bug fix**: le colonne nelle query interne sono qualificate (`dp.`/`t.`) per evitare l'ambiguità con gli OUT param omonimi (`status`, `total_stops`, `payout_amount`); INSERT con alias `AS dp`. Vedi `migration.sql` aggiornato.
- Sicurezza verificata: RLS (driver legge solo i propri), blocco record `paid`, UPSERT idempotente, rifiuto driver≠self senza admin.
- Tipi TS rigenerati (`database.types.ts`).
- Form **"Dichiara servizio"** in `DriverHome.tsx` + `DriverPayoutForm.tsx`, componenti UI esistenti.
- Edge function `send-driver-payout-confirmation` **deployata e funzionante** (ACTIVE v1, `verify_jwt: true` — ok perché invocata da driver loggato).

**📧 Email — VERDE end-to-end (verificato con test send reale):**
- `RESEND_API_KEY` **già impostato** sul progetto live e valido.
- Dominio `thaiakhakitchen.com` **verificato** su Resend (il test send ha restituito message-id, HTTP 200).
- Test inviato a `office@thaiakhakitchen.com` con esito `{"success":true}`.
- Mittente payout: `Thai Akha Kitchen <driver@thaiakhakitchen.com>`, bcc `office@`.
- NB: la welcome (`send-welcome-email`) resta rotta a parte per `from: noreply@yourdomain.com` placeholder + webhook signup non attivo — non riguarda il payout.

**🆕 Modifiche form/UI (2026-06-11 sera):**
- Pax → **menu a tendina 1–14** (non più input numerico).
- Rimosso il badge "Modulo temporaneo · bypass booking".
- Tab **centrali**, ordine: **1) Dichiara servizio (default)** · 2) Dashboard.
- Nuovo **`DriverPayoutDashboard.tsx`**: vista payout giornalieri **raggruppati per settimana ISO (lun→dom)**, settimana corrente in cima, totale **pending = blocco da reportare/pagare**, badge stato per riga. Mostrato nel tab Dashboard sopra le card storiche.

**Modello payout settimanale (chiarito):** NON esiste un record settimanale separato per il bypass. Ogni submit = 1 riga `driver_payments` (per giorno+sessione). La "settimana" è **pura aggregazione** delle righe per settimana ISO, fatta lato client nella dashboard. Il cron `weekly_driver_payouts` → `generate_weekly_payouts()` è **booking-based** (path auto bypassato), **non toccato e non rilevante** qui.

**Design chiave — degradazione graziosa:** il form salva il payout e mostra la conferma **anche se l'email fallisce** (try/catch). Email ora attiva, ma il frontend non dipende da essa.

**🆕 Fase 2 — UI dinamica (2026-06-11 sera):**
- DB: nuove RPC `delete_my_payout(date,text)` (driver cancella un proprio servizio solo se `pending` e settimana non chiusa) e `mark_driver_week_paid(uuid,date)` (admin: chiude l'intera settimana `pending→paid`). `inject` aggiornata con **lucchetto settimana**: se la settimana ISO contiene un `paid`, blocca create/edit/delete su quei giorni.
- Form: rimosso campo Driver e campo Note · data sola lettura (oggi o data card) · **success card** col riepilogo (Data·Classe·N°hotel·Prezzo) + "Nuovo invio" · **smart-UI** (rileva servizio già inviato per data+classe → precompila + "stai modificando, sovrascrive") · **modifica da card** (date/sessione bloccate) · **elimina** su pending.
- Dashboard: **card cliccabili** per modifica · settimane **pagate compresse** a una riga · **filtro mese** (ultimi 6, settimana assegnata al mese del suo lunedì, settimane intere) · **realtime** su `driver_payments` + **popup "pagamento ricevuto"** (flag visto via localStorage).

**⏳ Rimandato:**
- **Task 5** (report settimanale PDF via email): sbloccabile, pattern `pg_net → Resend`.
- **UI admin "segna pagato"**: l'RPC `mark_driver_week_paid` è pronta, ma manca la **pagina admin** (selettore driver + lista settimane + bottone paga). La dashboard driver mostra solo i propri payout (RLS), quindi mark-paid vuole una sede admin dedicata.

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
- `packages/admin/src/pages/driver/DriverHome.tsx` — tab centrali Dichiara servizio/Dashboard (marcato `// BYPASS-PAYOUT`).
- `packages/admin/src/pages/driver/DriverPayoutForm.tsx` — **nuovo** componente form (pax dropdown 1–14, no badge).
- `packages/admin/src/pages/driver/DriverPayoutDashboard.tsx` — **nuovo** componente dashboard payout settimanale (read-only, grouping ISO week).
- `packages/shared/src/types/database.types.ts` — tipi rigenerati.
- `supabase/functions/send-driver-payout-confirmation/index.ts` — **nuova** edge function (deployata).
