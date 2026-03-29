# 🥥 GEMINI.md — Manuale Operativo Gemini Code Assist

Questo file è la guida di riferimento per Gemini Code Assist nel progetto **Thai Akha Kitchen 2026**. 
Deve essere consultato all'inizio di ogni task per garantire coerenza architettonica e stilistica.

---

## 🎯 Missione
Fornire suggerimenti di codice di alta qualità, type-safe e perfettamente allineati al Design System v2, agendo come un Senior Software Engineer che conosce profondamente il monorepo.

---

## 🛠 Regole d'Oro (No-Bypass)

### 1. Tipografia (v4)
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

---

## 🔄 Workflow Operativi

### 🛡 Sicurezza & Qualità (Guardian)
Prima di scrivere query Supabase:
1. Verifica le **RLS** in `docs/DB-2026-Full.md`.
2. Assicurati che l'input sia sanitizzato e tipizzato in `packages/shared/src/types`.
3. Se la logica è complessa, proponi un test Vitest.

### 🗄 Database & Data Flow
- Consulta sempre `docs/DB-2026-Full.md` prima di ipotizzare campi o tabelle.
- Usa i tipi generati da Supabase ed esportali da `@thaiakha/shared`.

### 🪄 UI Generation (Stitch)
- Quando generi componenti, arricchisci i prompt con classi di micro-interazioni (`hover:scale-105 transition-all`).
- Usa `glass-card` o `brand-glass` per elementi premium.

---

## 📂 Mappa Rapida

| Se cerchi... | Vai a... |
|---|---|
| Regole Monorepo | `CLAUDE.md` |
| Schema Database | `docs/DB-2026-Full.md` |
| Design System / Colori | `docs/91-UI-Theme.md` |
| Varianti Testo | `docs/typography-v4.md` |
| Componenti UI Front | `packages/front/src/components/ui/` |
| Logica Condivisa | `packages/shared/src/` |

---

## 📝 Note per Gemini
Ogni volta che modifichi un componente UI, controlla se ci sono colori hardcoded (es. `#1a1a1a`) e sostituiscili con le variabili CSS appropriate definite in `tokens.css`.

*Ultimo aggiornamento: 29 Mar 2026*