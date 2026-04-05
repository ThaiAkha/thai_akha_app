# Thai Akha Kitchen 1.0 — CLAUDE.md

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
9. **Database** — `supabase/backups/full_backup_*.md` (DDL autorevole, 53+ tabelle). Nessuna nuova tabella senza analisi con `/database`.
10. **Agenti** — usare lo specialista giusto (tabella sotto). Per task multi-dominio usare `/deepseek`.

## Agenti Disponibili

| Comando | Specializzazione | Quando Usarlo |
|---|---|---|
| `/deepseek` | Orchestratore, architettura, decisioni strutturali | Task complessi multi-dominio, refactoring, piani |
| `/cherry` | Cherry AI: voce Gemini Live, chat streaming, system prompt | Bug voce, nuove feature Cherry, prompt engineering |
| `/database` | Data-UI bridge, implementazione query, TypeScript types (53+ tabelle) | Nuovi campi DB→UI, verificare flussi dati, mapping React |
| `/booking` | Booking state machine, business rules, prenotazioni | Feature booking, debug flussi prenotazione |
| `/style` | 9 palette colori, token, WCAG, design system | Nuovi colori, componenti UI, accessibilità |
| `/typography` | Audit testo hardcoded, varianti Typography.tsx | PR front con testo, nuovi componenti UI |
| `/thai-english` | Traduzioni EN/TH admin app, 15 namespace, 824 chiavi | Nuovi testi in admin, audit traduzioni |

## File Chiave

| Modulo | File da Leggere Prima |
|---|---|
| Booking | `docs/ARCHITECTURE.md`, `supabase/backups/full_backup_*.md` |
| Cherry AI (Front) | `.claude/agents/cherry.md`, `packages/front/src/prompts/` |
| Cherry AI (Admin) | `.claude/agents/cherry.md`, `packages/admin/src/prompts/` |
| Design System | `packages/front/src/styles/theme.css`, `packages/front/src/styles/tokens.css` |
| Typography | `packages/front/src/components/ui/Typography.tsx` |
| Skeleton | `packages/front/src/components/skeleton/` |
| Database | `supabase/backups/full_backup_*.md` (DDL autorevole) |
| i18n Admin | `packages/admin/src/i18n/` |
