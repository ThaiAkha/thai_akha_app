# 🥥 GEMINI.md — Manuale Operativo Gemini Code Assist

Questo file è la guida di riferimento per Gemini Code Assist nel progetto **Thai Akha Kitchen 1.0**. 
Deve essere consultato all'inizio di ogni task per garantire coerenza architettonica e stilistica.

---

## 🎯 Missione
Fornire suggerimenti di codice di alta qualità, type-safe e perfettamente allineati al Design System v1.0, agendo come un Senior Software Engineer che conosce profondamente il monorepo.

---

## 🛠 Regole d'Oro (No-Bypass)

### 1. Tipografia (v1.0)
- **MAI** usare tag HTML crudi (`<h1>`, `<p>`, `<span>`) per il testo nel package `front`.
- **USA SEMPRE** il componente `<Typography variant="...">`.
- Varianti numeriche obbligatorie per i dati: `numericPrice`, `numericStat`, `numericRegular`.

### 2. Colori e Token Semantici
- **MAI** usare classi Tailwind fisse come `text-gray-500` o `bg-red-500`.
- **USA SOLO** token semantici: `text-title`, `text-desc`, `text-sub`, `text-muted`, `text-inverse`.
- Per il brand: `primary` (#E31F33), `action` (#98C93C), `allergy` (#FF6D00).

### 3. Dark Mode
- La Dark Mode è gestita via classe `.dark` sull'elemento `html`.
- **NON** usare il prefisso `dark:` nel CSS o nelle classi Tailwind del frontend. I token semantici (es. `var(--text-title)`) cambiano valore automaticamente.

### 4. Architettura Tailwind v4
- I token runtime sono in `packages/front/src/styles/tokens.css` (Source of Truth per light/dark).
- I token Tailwind (`@theme`) sono in `packages/front/src/styles/theme.css`. Non duplicare logica in `tailwind.config.js`.

### 5. Fluid Space Palette
- **MAI** coppie breakpoint come `gap-2 md:gap-6` per spaziature standard.
- **USA** `[gap:var(--space-fluid-m)]`, `[padding:var(--space-fluid-s)]`, `[margin-bottom:var(--space-fluid-xs)]`.
- Token disponibili in `tokens.css :root`: `--space-fluid-2xs/xs/s/m/l/xl/2xl/3xl/section`.

### 6. Skeleton Loading States
- **MAI** skeleton inline nei componenti.
- **USA** sempre componenti da `components/skeleton/`.
- Testo/titoli: `SkeletonText`, `SkeletonTitle`, `SkeletonDivider` (colore `bg-surface-2`).
- Card/immagini: `SkeletonBase` (colore `bg-gray-200 dark:bg-white/5`).
- Header completi: `SkeletonHeader` composition.

---

## 🔄 Workflow Operativi

### 🛡 Sicurezza & Qualità (Guardian)
Prima di scrivere query Supabase:
1. Verifica le **RLS** nel backup DDL Supabase (`supabase/backups/full_backup_*.md`).
2. Assicurati che l'input sia sanitizzato e tipizzato in `packages/shared/src/types`.
3. Se la logica è complessa, proponi un test Vitest.

### 🗄 Database & Data Flow
- Consulta sempre il backup DDL Supabase (`supabase/backups/full_backup_*.md`) prima di ipotizzare campi o tabelle.
- Usa i tipi generati da Supabase ed esportali da `@thaiakha/shared`.

### 🪄 UI Generation (Stitch)
- Quando generi componenti, arricchisci i prompt con classi di micro-interazioni (`hover:scale-105 transition-all`).
- Usa `glass-card` o `brand-glass` per elementi premium.

---

## 📂 Mappa Rapida

| Se cerchi... | Vai a... |
|---|---|
| Regole Monorepo | `CLAUDE.md` |
| Schema Database | `supabase/backups/full_backup_*.md` (DDL autorevole) |
| Design System / Colori | `packages/front/src/styles/theme.css` |
| Varianti Testo | `packages/front/src/components/ui/Typography.tsx` |
| Componenti UI Front | `packages/front/src/components/ui/` |
| Fluid Spacing Tokens | `packages/front/src/styles/tokens.css` (sezione `--space-fluid-*`) |
| Skeleton Components | `packages/front/src/components/skeleton/` |
| Cherry AI Prompts | `packages/front/src/prompts/` (front), `packages/admin/src/prompts/` (admin) |

---

## 📝 Note per Gemini
Ogni volta che modifichi un componente UI, controlla se ci sono colori hardcoded (es. `#1a1a1a`) e sostituiscili con le variabili CSS appropriate definite in `tokens.css`.

*Ultimo aggiornamento: 04 Apr 2026 (v1.0 Launch)*