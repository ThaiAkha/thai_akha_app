# Thai Akha Kitchen 1.0 — CLAUDE.md (layer tecnico, repo git)

> Questo file è il **layer tecnico** (regole monorepo, autorevole, git-safe).
> 🤖 Agenti & cascata di questo progetto → **`thai_akha_brain/010_ThaiAkha_com/AGENTS.md`**
> 🪜 Cascata globale & ambienti (Cowork · Claude Code · Antigravity · Gemini) → **`thai_akha_brain/AGENTS.md`**

Monorepo pnpm con 3 packages: `packages/admin` (React dashboard B2B), `packages/front` (React app B2C),
`packages/shared` (tipi, utils, costanti condivise). Deploy: Firebase Hosting + Supabase (Tokyo, Postgres 17).

## Struttura

```
packages/
  admin/src/        → layout/, pages/, components/, hooks/, i18n/, prompts/
  front/src/        → pages/, components/, styles/, hooks/, prompts/
  shared/src/       → lib/, types/, constants/
docs/               → architettura, design system
.claude/
  agents/           → definizioni agenti specializzati
  commands/         → comandi slash /nomeagente
  agent-memory/     → memoria persistente per agente + shared/
```

## Stack Tecnico

- React 18 + TypeScript strict — no `any`, tipi generati da Supabase
- Vite 6 — bundle separato per admin e front
- Tailwind CSS v4 — token in `@theme {}` in CSS, non in `tailwind.config.js`
- Supabase — auth, DB, RLS, Edge Functions, Storage
- pnpm workspaces — `pnpm --filter admin`, `pnpm --filter front`

## Regole Critiche

1. **Typography** — nel front, usare solo `<Typography variant="...">`. Zero raw `<p>`, `<h1>`, classi font hardcoded.
2. **Colori** — solo token semantici: `text-title`, `text-desc`, `text-sub`, `text-muted`, `text-inverse`. Mai `text-gray-xxx`.
3. **Dark mode** — gestita via `html.dark` class in `App.tsx`. Non usare `dark:` prefix Tailwind nel front.
4. **Tailwind v4** — i token `--color-*` vanno in `packages/front/src/styles/theme.css` via `@theme {}`. Non duplicarli in `tailwind.config.js`.
5. **Fluid Typography** — le dimensioni testo usano `clamp()` via `--text-fluid-*` in `:root` di `tokens.css`. Tailwind v4 `@theme` azzera le espressioni `vw` — mai spostare questi token in `@theme`. Usare sempre `<Typography variant="...">`, non classi `text-*` dirette.
6. **Fluid Space Palette** — spaziature usano `--space-fluid-2xs` → `--space-fluid-section` (in `:root` di `tokens.css`). Applicarli come arbitrary CSS properties: `[gap:var(--space-fluid-m)]`, `[padding:var(--space-fluid-s)]`. Mai coppie breakpoint separate (`gap-2 md:gap-6`) per spaziature gestibili con un token fluid.
7. **Skeleton System** — loading states usano `components/skeleton/`. Atoms: `SkeletonBase` (card/img, `bg-gray-200`), `SkeletonText`/`SkeletonTitle`/`SkeletonDivider` (testo, `bg-surface-2`). Compositions: `BlogGridSkeleton`, `ArticleDetailSkeleton`, `SkeletonHeader`. Mai skeleton inline — usare/estendere il sistema esistente.
8. **Cross-package** — import solo da `@thaiakha/shared/...`. Mai path relativi tra packages.
9. **Database** - lo schema autorevole vive nel brain: `thai_akha_brain/000_Core_Agents/050_Infrastructure/054_Supabase/backups/_SCHEMA/schema_public__*.sql`. **`supabase/backups/` non esiste piu'** (2026-08-05): conteneva dati clienti tracciati da git. Backup e dump stanno nel brain, che non e' versionato; `supabase/migrations/` e `supabase/functions/` restano qui, perche' sono codice e la CLI legge da questi percorsi. Nessuna nuova tabella senza analisi con `/database`.
10. **Agenti** — usare lo specialista giusto (tabella sotto). Per task multi-dominio usare `/deepseek`.
11. **Mobile-first** — ogni nuovo componente front deve essere progettato mobile-first. Usare `--space-fluid-*` e `clamp()` per spaziature responsive. Verificare su viewport 375px prima del desktop.
12. **Cherry prompts master** — i file prompt vivono in `thai_akha_brain/000_Core_Agents/030_Cherry/033_App_Prompts/800_Admin/` (admin) e `801_Front/` (front). I file in `packages/*/src/prompts/` (`adminAgents.ts`, `adminPrompt.ts`, `cherryPrompt.ts`, `subagents/`) sono **COPIE tracciate** (dal 2026-08-17: i symlink assoluti non risolvono in CI): modificare sempre il master nel brain, poi `pnpm sync-prompts` prima del commit (`pnpm check-prompts` segnala divergenze; in CI, senza brain, viene saltato). Il prompt ha UNA sorgente: il `.ts` nel brain. Mai duplicarlo in `.md` "per documentazione" (le copie divergono in silenzio).
13. **Recipe tables — separazione RIGIDA** (Giugno 2026):
    - `recipe_key_ingredients` → UI visiva class flow (showroom ingredienti). Contiene `dietary_adaptations` JSONB per override per-ricetta (Sistema B).
    - `dietary_substitutions` → sostituzioni globali text-based per profilo dietetico (Sistema A).
    - `recipe_composition` → **VIETATA nel class flow**. Solo per futura pagina CookBook. Contiene dosi, unità, prep_note.
    - `is_key_ingredient` su `recipe_composition` → **DEPRECATA**, ignorare.
    - `dietary_profiles.id` → sempre underscore (`diet_vegan`, `allergy_peanuts`). MAI usare `.slug` come chiave.
    - Manuale completo: `docs/RECIPE-ARCHITECTURE.md` · Regole agente: `.claude/agent-memory/database/recipe_pipeline.md`

## Agenti Disponibili

> Master in `thai_akha_brain/010_ThaiAkha_com/claude/agents/` · `.claude/` → symlink

| Comando | Specializzazione | Quando Usarlo |
|---|---|---|
| `/deepseek` | Orchestratore, architettura, decisioni strutturali | Task complessi multi-dominio, refactoring, piani |
| `/cherry` | Cherry AI **FRONT + engine condiviso**: voce Gemini Live, chat streaming, orchestrator v6.3, system prompt | Bug voce, feature Cherry front, engine condiviso, prompt engineering |
| `/admin-cherry` | Cherry AI **ADMIN** (dominio a sé, completamente diverso): persona/logica/prompt/chat/voce interni, `adminPrompt.ts`, `AdminChatBox`, Function Calling dati | Cherry staff/agency, prompt/logica admin. Attinge all'engine di `/cherry` |
| `/database` | Data-UI bridge, implementazione query, TypeScript types (53+ tabelle) | Nuovi campi DB→UI, verificare flussi dati, mapping React |
| `/booking` | Booking state machine, business rules, prenotazioni | Feature booking, debug flussi prenotazione |
| `/driver` | Mondo pickup-driver back-office: report, payout, commissioni, pagamenti, fatture | Report driver, payout/commissioni, pagamenti driver, fatturazione. Campagna: `thai_akha_brain/700_To_Do_2027/730_Operations/Driver_Ops_2027/` |
| `/email` | Sistema email completo: config Resend (dominio/SPF/DKIM, secret), Edge Functions, template, trigger (webhook/invoke/pg_net) | Email non arrivano, configurare/ripristinare sistema email, ripara welcome/booking, nuova email (es. `send-driver-payout-confirmation`). Non fa deploy/secret/DNS. Campagna: `thai_akha_brain/700_To_Do_2027/730_Operations/Email_System_2027/` |
| `/market` | Mondo market/approvvigionamento: flusso spese (`market_runs`→Zoho), ingredienti, COGS, UI/UX logistic·teacher·manager | Spese mercato, report COGS, domanda ingredienti, acquisti logistic. Campagna: `thai_akha_brain/700_To_Do_2027/730_Operations/Market_Ops_2027/` |
| `/pos` | POS / chiusura giornaliera: incasso a fine classe (quota+prodotti), catalogo `shop_storefront`, ordini, report Manager/Teacher, income Zoho | Chiusura giornaliera, incasso clienti, vendita/catalogo prodotti, report incassi. Entrate (speculare a `/market`). Campagna: `thai_akha_brain/700_To_Do_2027/730_Operations/POS_Ops_2027/` |
| `/zoho` | Owner integrazione Zoho Books: connettore MCP, edge functions (market/driver/agency), pagamenti, conti/box, mappe expense/vendor, nuove connessioni & funzioni | Fattura/expense/payment Zoho, nuova edge/connessione, conti/vendor, income POS→Zoho, OAuth. Driver/market/pos delegano la meccanica Zoho. Mai denaro reale automatico. Campagna: `thai_akha_brain/700_To_Do_2027/730_Operations/Zoho_Integration_2027/` |
| `/style` | 9 palette colori, token, WCAG, design system | Nuovi colori, componenti UI, accessibilità |
| `/typography` | Audit testo hardcoded, varianti Typography.tsx | PR front con testo, nuovi componenti UI |
| `/mobile-ux` | Revisore mobile: audit, fix, nuovi componenti mobile-native | Qualsiasi problema mobile, touch targets, spaziature, hover→touch |
| `/admin-visual` ⊃ `/admin-style` · `/admin-typography` · `/admin-copy` | **Famiglia UI/UX app ADMIN** (iPad/desktop-first, idioma admin gray-*/dark: leciti): coordinatore + design-system baseline + tipografia + microcopy EN | Refactor UI/UX + codice app admin, coerenza tra pagine, baseline DS, testi (card/banner/tooltip/FAQ). Campagna: `thai_akha_brain/700_To_Do_2027/710_App_React/Admin_UX_2027/` |
| `/i18n` | **Traduttore FILE** locale JSON admin (preserva chiavi/`{{placeholder}}`/ICU), EN→TH/ES/ZH | Stringhe UI admin, nuova lingua, namespace agency. Sostituisce `/thai-english` (deprecato) |
| `/translate-db` | **Traduttore DATABASE** (sidecar `{tabella}_translations`) + email/documenti/fatture agenzia | Contenuti DB multilingua EN→TH/ES/ZH, comms agency. Campagna: `thai_akha_brain/700_To_Do_2027/750_Data_Content/DB_Translation_2027/` |
| `/asset-manager` | Gestione universale media_assets e audio_assets | Nuove foto/audio, collegare cover/gallery a ricette/news/pagine |
| `/backup` | Backup schema Supabase: dump SQL completo o aggiornamento MD | Aggiornare docs schema DB, prima di lavori su tabelle |
| `/db-audit` | Audit SEO/GEO/AI-search tabella-per-tabella (accoppiato a `/database`): correttezza campi, riempimento vuoti via /humanizer, flusso dati/ridondanze/sync, governance media+JSON-LD | Audit di una tabella DB, campi vuoti per SEO, verifica flusso dati, pattern `*_asset_id`. Campagna: `thai_akha_brain/700_To_Do_2027/750_Data_Content/DB_Audit_Fix_2027/` |

> **Agenti shared brain** (disponibili come additional dir) — `/humanizer`, `/writer`, `/seo`, `/publisher`, `/news-audit`, `/culture-audit`, `/page-audit`, `/mobile-ux`, `/code-review`, `/seo-flow-audit`

## File Chiave

| Modulo | File da Leggere Prima |
|---|---|
| Architettura & Booking | `thai_akha_brain/000_Core_Agents/060_Manuals/061_Manuals_AI/0616_Architecture/06161_Architecture_EN.md`, `supabase/backups/full_backup_*.md` |
| Flusso utenti & ruoli | `thai_akha_brain/000_Core_Agents/060_Manuals/061_Manuals_AI/0616_Architecture/06162_User_Flow_EN.md` (tecnico) · `.../062_Manuals_Human/0626_Architecture/06261_User_Flow_Manual_EN.md` (narrativo per ruolo) |
| Cherry AI (Front) | `.claude/agents/cherry.md`, `packages/front/src/prompts/` |
| Cherry AI (Admin) | `.claude/agents/cherry.md`, `thai_akha_brain/000_Core_Agents/030_Cherry/033_App_Prompts/800_Admin/adminPrompt.ts` |
| Cherry identità/tono | `thai_akha_brain/000_Core_Agents/030_Cherry/031_Foundations/00_identity.md`, `.../02_tone.md` |
| Cherry doc tecnica (hook/servizi) | `thai_akha_brain/000_Core_Agents/030_Cherry/034_Code_Docs/` |
| Design System | `packages/front/src/styles/theme.css`, `packages/front/src/styles/tokens.css` |
| Typography | `packages/front/src/components/ui/Typography.tsx` |
| Skeleton | `packages/front/src/components/skeleton/` |
| Database | `thai_akha_brain/000_Core_Agents/050_Infrastructure/054_Supabase/backups/_SCHEMA/schema_public__*.sql` (nel brain) · struttura: [[011_Supabase_Backend_Index]] |
| i18n Admin | `packages/admin/src/i18n/` |
| Brand voice | `thai_akha_brain/800_Manuals/810_Manuals_EN_2026/811_Brand_Brochure/8111_Brand_Guidelines_EN.md` |
| Cherry backlog tecnico | `thai_akha_brain/010_ThaiAkha_com/claude/agent-memory/cherry/MEMORY.md` |
