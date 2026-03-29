# Thai Akha Kitchen 2026 — CLAUDE.md

Monorepo pnpm con 3 packages: `packages/admin` (React dashboard B2B), `packages/front` (React app B2C),
`packages/shared` (tipi, utils, costanti condivise). Deploy: Firebase Hosting + Supabase (Tokyo, Postgres 17).

## Struttura

```
packages/
  admin/src/        → layout/, pages/, components/, hooks/, i18n/
  front/src/        → pages/, components/, styles/, hooks/
  shared/src/       → lib/, types/, constants/, prompts/
docs/               → schema DB, architettura, design system, agent docs
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
5. **Cross-package** — import solo da `@thaiakha/shared/...`. Mai path relativi tra packages.
6. **Database** — `docs/DB-2026-Full.md` è la source of truth (51 tabelle). Nessuna nuova tabella senza analisi con `/database`.
7. **Agenti** — usare lo specialista giusto (tabella sotto). Per task multi-dominio usare `/deepseek`.

## Agenti Disponibili

| Comando | Specializzazione | Quando Usarlo |
|---|---|---|
| `/deepseek` | Orchestratore, architettura, decisioni strutturali | Task complessi multi-dominio, refactoring, piani |
| `/cherry` | Cherry AI: voce Gemini Live, chat streaming, system prompt | Bug voce, nuove feature Cherry, prompt engineering |
| `/database` | Data-UI bridge, schema Supabase, TypeScript types | Nuovi campi DB→UI, verificare flussi dati, query |
| `/booking` | Booking state machine, business rules, prenotazioni | Feature booking, debug flussi prenotazione |
| `/style` | 9 palette colori, token, WCAG, design system | Nuovi colori, componenti UI, accessibilità |
| `/typography` | Audit testo hardcoded, varianti Typography.tsx | PR front con testo, nuovi componenti UI |
| `/thai-english` | Traduzioni EN/TH admin app, 15 namespace, 824 chiavi | Nuovi testi in admin, audit traduzioni |

## File Chiave

| Modulo | File da Leggere Prima |
|---|---|
| Booking | `docs/ARCHITECTURE.md`, `docs/DB-2026-Full.md` |
| Cherry AI | `docs/Agent-Cherry.md`, `packages/shared/src/prompts/` |
| Design System | `packages/front/src/styles/theme.css`, `packages/front/src/styles/tokens.css` |
| Typography | `docs/typography-v4.md`, `packages/front/src/components/ui/Typography.tsx` |
| Database | `docs/DB-2026-Full.md` |
| i18n Admin | `docs/88-Admin-TH-EN.md`, `packages/admin/src/i18n/` |
