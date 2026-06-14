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
- DB: nuove RPC `delete_my_payout(date,text)` (driver cancella un proprio servizio solo se `pending` e settimana non chiusa), `mark_driver_week_paid(uuid,date)` (admin: chiude l'intera settimana `pending→paid`) e **`admin_delete_payout(uuid,date,text)`** (admin/manager elimina UN servizio di un driver — guardia `is_admin()`, solo `pending`, settimana non chiusa). `inject` aggiornata con **lucchetto settimana**: se la settimana ISO contiene un `paid`, blocca create/edit/delete su quei giorni.
- Manager (`ManagerDriverPayouts`): **cestino per riga** (conferma inline) che chiama `admin_delete_payout` + `send-driver-cancellation` (driver TH + office EN). Visibile solo su righe `pending` di settimane non fatturate.
- Form: rimosso campo Driver e campo Note · data sola lettura (oggi o data card) · **success card** col riepilogo (Data·Classe·N°hotel·Prezzo) + "Nuovo invio" · **smart-UI** (rileva servizio già inviato per data+classe → precompila + "stai modificando, sovrascrive") · **modifica da card** (date/sessione bloccate) · **elimina** su pending.
- Dashboard: **card cliccabili** per modifica · settimane **pagate compresse** a una riga · **filtro mese** (ultimi 6, settimana assegnata al mese del suo lunedì, settimane intere) · **realtime** su `driver_payments` + **popup "pagamento ricevuto"** (flag visto via localStorage).

**🆕 Fase 3 — Manager, report PDF & Zoho (verificato 2026-06-12):**
- Pagine manager: `ManagerReports.tsx` (report payout + pagamento/fatturazione) e `ManagerDriverPayouts.tsx` (report driver-centric, **segna pagato** via `mark_driver_week_paid`). Rotta `/manager-reports` (admin, manager). i18n nuovo `manager.json` (en/th).
- Edge `render-report` — genera il **PDF report A5** (proxy Cloud Run / WeasyPrint), stile Driver Report con colonna Stops, divider Akha, layout print-safe.
- Edge `zoho-create-driver-expense` — crea la **spesa driver su Zoho Books** (fatturazione, conferma umana).

**⏳ Aperto:**
- **Task 5 — invio automatico schedulato** del report settimanale via email: il report PDF on-demand esiste (`render-report` + bottoni Stampa/PDF nelle card), manca solo il **cron** che lo genera e lo spedisce ogni settimana (pattern `pg_net → render-report → Resend`).
- **Commit working tree:** le pagine manager, le dashboard e gli i18n sono ancora **non committati** sul branch `feature/driver-payout-bypass` (vedi nota a fondo file).

## Mappa driver ↔ Zoho vendor (agg. 2026-06-12)

Reset dati demo eseguito: `driver_payments` svuotata. Mapping profili→vendor Zoho Books (org `663160082`):

**2 driver attivi** (`role='driver'`): At, Kasem.

| Profilo Supabase | id | role | Zoho vendor | Note |
|---|---|---|---|---|
| **Kasem** | `1f947c52…f47cc` | driver | `1215788000003602337` ("04 - Driver - Kasem") | ✅ **definitivo**. Vendor spostato qui dall'ex profilo test. |
| **At** (profilo reale) | `5629d491…ba45f` | driver | `1215788000001485001` ("03 - Driver - At") | ✅ **collegato** (vendor spostato qui dal vecchio profilo At il 2026-06). Default pickup booking-based aggiornato a questo id. |
| At (vecchio) | `b7866c46…73de5` | kitchen | `null` | Ex profilo driver di At, ora convertito a kitchen. Fuori dal mondo driver. |
| **Teacher 01** (ex-Som) | `b85dffbe…a757f37` | logistics | `null` | Ex profilo test driver, ora convertito (kitchen→logistics). Fuori dal mondo driver. |

> ⚠️ Expenses Zoho demo: **NON toccate da noi** (le gestisce Svevo a mano).
> ⚠️ `useAdminBooking.ts` ha il default pickup driver booking-based su At (`b7866c46`): rivedere alla migrazione di At.

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

### ☑ Task 4 — Edge function email conferma ✅ DEPLOYATA E LIVE
`send-driver-payout-confirmation` ACTIVE. `RESEND_API_KEY` valido, dominio `thaiakhakitchen.com` verificato, mittente `driver@thaiakhakitchen.com` (bcc `office@`). Invocata dal client dopo l'RPC, `try/catch` con degradazione graziosa.

### ◐ Task 5 — Report settimanale — PDF FATTO, cron APERTO
Report PDF A5 **costruito** (edge `render-report` + bottoni Stampa/PDF nelle card manager, stile Driver Report con colonna Stops). Manca solo l'**invio automatico schedulato**: cron settimanale `pg_net → render-report → Resend`. Il job esistente `weekly_driver_payouts` (booking-based) continua a girare, non toccato.

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

## File toccati nel repo (per il rollback — tutti marcati `// BYPASS-PAYOUT`)
Driver:
- `packages/admin/src/pages/driver/DriverHome.tsx` — tab Dichiara servizio/Dashboard.
- `packages/admin/src/pages/driver/DriverPayoutForm.tsx` — **nuovo** form (pax dropdown 1–14, smart-UI, modifica/elimina).
- `packages/admin/src/pages/driver/DriverPayoutDashboard.tsx` — **nuovo** dashboard settimanale ISO + popup pagamento realtime.

Manager:
- `packages/admin/src/pages/manager/ManagerReports.tsx` — report + pagamento/fatturazione Zoho.
- `packages/admin/src/pages/manager/ManagerDriverPayouts.tsx` — report driver-centric + **segna pagato**.
- Rotta `/manager-reports` in `packages/admin/src/App.tsx`.

Shared / i18n / edge:
- `packages/shared/src/types/database.types.ts` — tipi rigenerati (`source` + nuove RPC).
- `packages/admin/src/i18n/locales/{en,th}/driver.json` — chiavi payout.
- `packages/admin/src/i18n/locales/{en,th}/manager.json` — **nuovo**.
- `supabase/functions/send-driver-payout-confirmation/index.ts` — email creazione/modifica (deployata, live).
- `supabase/functions/send-driver-cancellation/index.ts` — **email cancellazione** (driver TH + office EN, payload-driven). Trigger collegato in `DriverPayoutForm.handleDelete`. ⏳ da **deployare** (`supabase functions deploy send-driver-cancellation`) + test.
- `supabase/functions/render-report/index.ts` — **nuova**, PDF report A5 (Cloud Run/WeasyPrint).
- `supabase/functions/zoho-create-driver-expense/index.ts` — **nuova**, spesa driver su Zoho Books.

---

## ⚠️ Working tree (stato git al 2026-06-12)
Committati sul branch `feature/driver-payout-bypass`: migrazione/supporto + prima ondata (DriverHome, DriverPayoutForm, types, edge email) + sistema report (commit `b67c2c3`…`8ad8d9e`).
**Non ancora committati**: pagine manager (`ManagerReports`, `ManagerDriverPayouts`), `DriverPayoutDashboard`, i18n `driver.json`/`manager.json`, hook manager. Committare **solo i path della feature** (restano fuori ~230 file di rumore pre-esistente + modifiche front non correlate come `ContentRenderer.tsx`, `MenuManager.tsx`).
