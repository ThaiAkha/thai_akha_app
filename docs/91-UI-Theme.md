# 🎨 Thai Akha Kitchen — Design System & Theme Reference

> **Generato**: Mar 16, 2026 — Claude Sonnet 4.6 (analisi completa da codice sorgente)
> **Status**: Documentazione — nessuna modifica applicata ✅
> **Obiettivo**: Single source of truth per stili, colori, effetti, transizioni

---

## 1. Architettura File Stile

```
packages/shared/src/styles/
  ├── tokens.css              ← CSS variables :root — SINGLE SOURCE OF TRUTH colori
  ├── theme.css               ← Tailwind @theme — font, breakpoints, shadows, animazioni
  ├── tailwind.config.base.ts ← JS exports per tailwind.config.js delle app
  └── utilities.css           ← @utility: glass, menu-item, scrollbar

packages/admin/
  ├── tailwind.config.js      ← solo safelist + content paths (NO colori)
  └── src/index.css           ← import shared + override third-party (ApexCharts, Flatpickr, ecc.)

packages/front/
  ├── tailwind.config.js      ← safelist + semantic color mapping via CSS vars
  └── src/styles/index.css    ← import shared + front-specific (glass tokens, font override)

packages/shared/src/lib/
  ├── colors.constants.ts     ← COLORS, SEMANTIC_TOKENS, SIDEBAR_COLOR_SCHEMES, GLOW_SHADOWS
  └── sidebar.constants.ts    ← layout, dimensioni, transizioni sidebar
```

### Flusso import (ordine obbligatorio)
```
tokens.css → theme.css → utilities.css → tailwindcss → app overrides
```

---

## 2. Palette Colori — Riferimento Completo

### Brand Colors
| Token | Valore | Uso |
|-------|--------|-----|
| `brand-500` / `--color-brand-500` | `#E54063` | Admin sidebar active, CTA front |
| `brand-600` | `#C9334F` | Hover state brand |
| `brand-700` | `#A82741` | Pressed state brand |
| `brand-100` | `#FBDDE4` | Background attivo sidebar pill |

### Lime Green (Action)
| Token | Valore | Uso |
|-------|--------|-----|
| `lime-500` / `--color-lime-500` | `#BAD879` | Front sidebar active, Admin button |
| `lime-700` | `#82A64D` | Testo active front sidebar |
| `lime-400` | `#CDE89A` | Dark mode active text front |

### Orange (Secondary CTA)
| Token | Valore | Uso |
|-------|--------|-----|
| `orange-500` | `#FF6D00` | Front: "Acquista", "Book Fast" |
| `orange-600` | `#E56000` | Hover orange |

### System UI
| Token | Valore | Uso |
|-------|--------|-----|
| `--color-error` | `#EF4444` | Errori, delete |
| `--color-warning` | `#F59E0B` | Warning (amber) |
| `--color-success` | `#22C55E` | Successo, verified |
| `--color-info` | `#3B82F6` | Info, links |
| `--color-notice` | `#EAB308` | Notifiche |

### Quiz Colors
| Token | Valore | Uso |
|-------|--------|-----|
| `magenta-500` | `#D6366E` | Quiz primary |
| `purple-500` | `#8B5CF6` | Quiz secondary |

### Gray Scale (Warm Gray — Custom)
| Token | Valore | Uso |
|-------|--------|-----|
| `gray-25` | `#F6FCFC` | Background light mode |
| `gray-50` | `#E6ECEC` | Surface secondaria light |
| `gray-100` | `#D6DCDC` | Border light |
| `gray-200` | `#C2C8C8` | Border standard |
| `gray-400` | `#9AA0A0` | Icon neutral, testo decorativo |
| `gray-600` | `#727878` | Testo secondario |
| `gray-700` | `#5E6464` | Testo body (dark surface) |
| `gray-800` | `#4A504F` | Testo body (light surface) |
| `gray-900` | `#222827` | **Sidebar dark bg** ← warm gray |
| `gray-950` | `#121311` | Background dark mode |
| `gray-dark` | `#080808` | Very dark (quasi nero) |

> ⚠️ Questi grigi sono **warm gray custom** — NON i grigi Tailwind default (che usano tonalità fredde).

---

## 3. Semantic Tokens (Light / Dark Mode)

### Variabili CSS `:root` (da tokens.css)
```css
/* Light mode */
--bg:          #F6FCFC   /* gray-25 — background pagina */
--surface:     #FFFFFF   /* white — card, modal, input */
--surface-2:   #EEF4F4   /* secondary surface */
--border:      #D6DCDC   /* gray-100 */
--border-2:    #C2C8C8   /* gray-200 */
--text-title:  #121311   /* gray-950 */
--text-body:   #4A504F   /* gray-800 */
--text-sub:    #727878   /* gray-600 */
--text-muted:  #9AA0A0   /* gray-400 */

/* Dark mode (body.dark) */
--bg:          #121311   /* gray-950 */
--surface:     #222827   /* gray-900 — sidebar bg! */
--border:      #4A504F   /* gray-800 */
--text-title:  #F6FCFC   /* gray-25 */
--text-body:   #D6DCDC   /* gray-100 */
```

### Front App: RGB Tokens (per alpha support)
```css
--color-primary:    251 46 88    /* Cherry #FB2E58 */
--color-secondary:  141 26 49    /* Dark cherry #8D1A31 */
--color-action:     152 201 60   /* Lime #98C93C */
--color-special:    255 109 0    /* Orange #FF6D00 */
--color-allergy:    255 109 0    /* Safety orange */
```
> Usati in front/tailwind.config.js come `action: 'rgb(var(--color-action) / <alpha-value>)'`

---

## 4. Sidebar System — Come Cambiare Colore in 1 File

### Dove vive ogni aspetto della sidebar

| Aspetto | File | Variabile/Classe |
|---------|------|-----------------|
| Background light | `sidebar.constants.ts` | `SIDEBAR_BASE: bg-white` |
| Background dark | `sidebar.constants.ts` | `SIDEBAR_BASE: dark:bg-gray-dark` |
| Colore active Admin | `colors.constants.ts` | `SIDEBAR_COLOR_SCHEMES.brand` |
| Colore active Front | `colors.constants.ts` | `SIDEBAR_COLOR_SCHEMES.action` |
| Larghezza chiusa | `sidebar.constants.ts` | `CLOSED_WIDTH: w-[108px]` |
| Larghezza aperta | `sidebar.constants.ts` | `OPEN_WIDTH: w-80` |
| Durata transizione | `sidebar.constants.ts` | `SIDEBAR_TRANSITION_DURATION: 800ms` |
| Testo inattivo | `sidebar.constants.ts` | `INACTIVE_TEXT: text-gray-700 dark:text-gray-300` |
| Icon inattiva | `sidebar.constants.ts` | `INACTIVE_ICON: text-gray-500 dark:text-gray-400` |
| Hover bg | `sidebar.constants.ts` | `HOVER_BG: group-hover:bg-gray-100 dark:group-hover:bg-white/5` |
| Pill active bg | `tailwind.config.js` | safelist `bg-brand-500/20` (admin) / `bg-lime-500/20` (front) |

### Scenario: cambiare il bg scuro della sidebar

**Attualmente**: `dark:bg-gray-dark` → `#080808`

**Per cambiare**: modificare SOLO `tokens.css`:
```css
/* DA */
--color-gray-dark: #080808;
/* A */
--color-gray-dark: #0F0F0F;  /* o qualsiasi altro valore */
```
Effetto immediato su entrambe le app.

### Scenario: cambiare il colore active dell'Admin sidebar

**Modificare SOLO `colors.constants.ts`**:
```typescript
brand: {
  activeBg: 'bg-brand-500/20 dark:bg-brand-500/20',  // ← cambia qui
  activeText: 'text-brand-600 dark:text-brand-400',   // ← e qui
  ...
}
```
E aggiornare il safelist in `packages/admin/tailwind.config.js` con le nuove classi.

### Scenario: cambiare il colore brand principale

**Modificare SOLO `tokens.css`**:
```css
--color-brand-500: #E54063;  /* ← nuovo valore */
--color-brand-600: #C9334F;  /* ← aggiornare tutta la scala */
```
Tailwind @theme e le CSS vars si aggiornano automaticamente.

---

## 5. Ombre & Glow Effects

### Sistema ombre standard (UI components)
```css
--shadow-theme-xs:  0px 1px 2px rgba(16,24,40,0.05)
--shadow-theme-sm:  0px 1px 3px + 0px 1px 2px rgba(16,24,40,0.1/0.06)
--shadow-theme-md:  0px 4px 8px + 0px 2px 4px rgba(16,24,40,0.1/0.06)
--shadow-theme-lg:  0px 12px 16px + 0px 4px 6px rgba(16,24,40,0.08/0.03)
--shadow-theme-xl:  0px 20px 24px + 0px 8px 8px rgba(16,24,40,0.08/0.03)
```

### Glow shadows (CTA buttons)
```css
--glow-cherry:   0 4px 20px rgba(229,64,99,0.40)    /* riposo */
--glow-cherry-h: 0 8px 36px rgba(229,64,99,0.60)    /* hover */

--glow-lime:     0 4px 16px rgba(186,216,121,0.40)
--glow-lime-h:   0 8px 28px rgba(186,216,121,0.55)

--glow-orange:   0 4px 20px rgba(255,109,0,0.40)
--glow-orange-h: 0 8px 36px rgba(255,109,0,0.60)

--glow-blue:     0 4px 16px rgba(59,130,246,0.35)
--glow-blue-h:   0 8px 28px rgba(59,130,246,0.55)
```

### Brand/Special shadows
```css
--shadow-brand:       0 10px 30px -10px rgba(227,31,51,0.3)
--shadow-brand-hover: 0 20px 40px -15px rgba(227,31,51,0.4)
--shadow-glass:       0 8px 32px 0 rgba(31,38,135,0.07)
```

---

## 6. Transizioni & Easing

### Easing functions
| Token | Curva | Uso |
|-------|-------|-----|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bounce — buttons, cards active |
| `--ease-cinematic` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Page transitions, modali |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Color/opacity hover |
| `--ease-elastic` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Overshoot elastico |
| Sidebar | `cubic-bezier(0.32, 0.72, 0, 1)` | Apertura/chiusura sidebar |

### Durate standard
```css
--transition-fast: 150ms var(--transition-bezier)
--transition-base: 300ms var(--transition-bezier)
--transition-slow: 500ms var(--transition-bezier)
Sidebar: 800ms (in sidebar.constants.ts)
```

---

## 7. Animazioni — Keyframes

| Nome | Durata | Tipo | Uso |
|------|--------|------|-----|
| `fade-slide-down` | 0.9s ease-out | one-shot | Hero sections, modali open |
| `fade-slide-up` | 0.9s ease-out | one-shot | Toast, drawer open |
| `pulse-slow` | 10s infinite | loop | Background decorativo |
| `flash` | 0.6s forwards | one-shot | Shine effect su click |
| `icon-pulse` | 2s infinite | loop | Loading icon |
| `mic-listening` | 1.5s infinite | loop | Voice input active |
| `shine` | 4s linear | loop | CTA button shine |
| `shine-oblique` | 4s linear | loop | Card/button premium shine |

### Uso
```css
/* Tailwind utility */
className="animate-fade-slide-down"
className="animate-shine"

/* Via CSS var */
animation: var(--animate-shine);
```

---

## 8. Glass Effects

### Admin (brand-glass — leggero)
```css
bg-white/3 dark:bg-black/3
backdrop-blur-[8px]
border border-white/10 dark:border-white/5
```

### Front (glass-card — premium)
```css
bg-white/70 dark:bg-black/40
backdrop-blur-xl
border border-white/20 dark:border-white/10
shadow-xl
```

### Front CSS Tokens (in front/index.css)
```css
--glass-bg:     rgba(255,255,255,0.7)  /* light */
--glass-border: rgba(255,255,255,0.5)
--glass-blur:   20px

/* dark mode */
--glass-bg:     rgba(255,255,255,0.05)
--glass-border: rgba(255,255,255,0.1)
```

---

## 9. Typography

### Font Families

| Ruolo | Admin | Front |
|-------|-------|-------|
| `font-display` | Inter, Noto Sans Thai | Raleway, Sarabun |
| `font-sans` | Roboto, Noto Sans Thai | Nunito, Sarabun |
| `font-accent` | Inter, Noto Sans Thai | Roboto Condensed, Sarabun |

> Admin usa Inter/Roboto (dashboard professionale), Front usa Raleway/Nunito (experience premium).

### Text Scale (da theme.css)
```
title-2xl: 72px/90px
title-xl:  60px/72px
title-lg:  48px/60px
title-md:  36px/44px
title-sm:  30px/38px
theme-xl:  20px/30px
theme-sm:  14px/20px
theme-xs:  12px/18px
```

---

## 10. Breakpoints

| Token | Valore | Uso |
|-------|--------|-----|
| `2xsm` | 375px | iPhone SE, small phones |
| `xsm` | 425px | Small phones |
| `sm` | 640px | Tailwind default |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |
| `3xl` | 2000px | Ultra-wide |

---

## 11. ⚠️ Gap Analysis — Hardcoded Hex da Tokenizzare

### Problema: colori dark hardcoded nei componenti front

| Valore | Occorrenze | Dovrebbe essere |
|--------|-----------|-----------------|
| `#1a1a1a` | 8 file | `var(--surface)` dark mode = `#222827`, oppure nuovo token `--surface-elevated` |
| `#121212` | 5 file | `var(--bg)` dark mode = `#121311` (quasi uguale, da allineare) |
| `#0a0a0a` | 1 file (PlayQuiz) | `gray-dark` = `#080808` |
| `#0a0b0d` | 2 file (ChatBox, AuthForm) | `gray-dark` o nuovo token `--surface-overlay` |
| `#1d1d1d` | 1 file (PickupMapBackground) | nuovo token `--map-bg` |
| `#344054` | utilities.css scrollbar | nuovo token `--scrollbar-thumb-dark` |

### Problema: colori inconsistenti in Certificate.tsx

| File | Valore usato | Token corretto | Differenza |
|------|-------------|----------------|------------|
| `Certificate.tsx` | `#E31F33` | `brand-500` = `#E54063` | -0.3 luminosità (più scuro) |
| `Certificate.tsx` | `#98C93C` | `lime-500` = `#BAD879` | diversa saturazione |
| `AkhaPixelPattern.tsx` | `#98C93C` | `lime-500` = `#BAD879` | idem |
| `Certificate.tsx` | `#C0C0C0` | nessun token silver | va aggiunto |

> **Nota**: `#E31F33` in Certificate sembra intenzionalmente più scuro (stampa/print). Va documentato come variante print o aggiunto come token `--color-brand-print`.

---

## 12. Token Mancanti — Da Aggiungere a tokens.css

```css
/* tokens.css — aggiungere in :root */

/* === DARK SURFACES (fix hardcode) === */
--surface-elevated: #1a1a1a;    /* card overlay su dark bg (sostituisce #1a1a1a) */
--surface-overlay: #0a0b0d;     /* chat, auth overlay scuro */
--map-bg: #1d1d1d;              /* background mappa */

/* === SCROLLBAR === */
--scrollbar-thumb-dark: #344054; /* scrollbar su dark bg */

/* === PRINT/CERTIFICATE === */
--color-brand-print: #E31F33;   /* brand red per stampa/PDF */
--color-action-print: #98C93C;  /* lime per stampa/PDF */
--color-silver: #C0C0C0;        /* argento Certificate */

/* === SIDEBAR (esplicitare) === */
--sidebar-bg-light: #FFFFFF;
--sidebar-bg-dark: #080808;     /* = gray-dark attuale */
--sidebar-border-light: var(--color-gray-100);
--sidebar-transition: 800ms cubic-bezier(0.32, 0.72, 0, 1);
```

---

## 13. Checklist Cleanup (Priorità)

### 🔴 Critico (coerenza visiva)
- [ ] Allineare `#E31F33` in Certificate.tsx → usare `brand-500` o aggiungere `--color-brand-print`
- [ ] Allineare `#98C93C` in Certificate.tsx e AkhaPixelPattern.tsx → `lime-500` o `--color-action-print`

### 🟡 Alto (manutenibilità)
- [ ] Sostituire `#1a1a1a` (8 file) con `var(--surface)` dark o `gray-900`
- [ ] Sostituire `#121212` (5 file) con `var(--bg)` dark o `gray-950`
- [ ] Aggiungere `--surface-elevated` e `--map-bg` a tokens.css
- [ ] Sostituire `#344054` in utilities.css con `--scrollbar-thumb-dark`

### 🟢 Basso (ottimizzazione)
- [ ] Aggiungere token `--sidebar-bg-dark` per rendere esplicito il valore
- [ ] Documentare perché Front usa `--color-action: 152 201 60` (#98C93C) invece di `lime-500` (#BAD879)
- [ ] Verificare se `--color-button-primary: #bad879` in theme.css è ridondante con `lime-500`

---

## 14. Reference Rapido — "Cosa tocco se voglio cambiare X?"

| Voglio cambiare... | Tocco questo file | Riga/Variabile |
|--------------------|------------------|----------------|
| Colore brand principale | `tokens.css` | `--color-brand-500` |
| Sidebar bg dark | `tokens.css` | `--color-gray-dark` |
| Sidebar colore active Admin | `colors.constants.ts` | `SIDEBAR_COLOR_SCHEMES.brand` |
| Sidebar colore active Front | `colors.constants.ts` | `SIDEBAR_COLOR_SCHEMES.action` |
| Larghezza sidebar | `sidebar.constants.ts` | `CLOSED_WIDTH`, `OPEN_WIDTH` |
| Velocità animazione sidebar | `sidebar.constants.ts` | `SIDEBAR_TRANSITION_DURATION` |
| Font Admin | `front/src/styles/index.css` `:root` → `theme.css` | `--font-display`, `--font-sans` |
| Font Front | `front/src/styles/index.css` `:root` | `--font-display`, `--font-sans` |
| Glow dei bottoni CTA | `tokens.css` | `--glow-cherry`, `--glow-lime`, ecc. |
| Ombre card | `theme.css` | `--shadow-theme-*` |
| Glass effect front | `front/src/styles/index.css` `:root` | `--glass-bg`, `--glass-blur` |
| Colori quiz | `tokens.css` | `--color-magenta-*`, `--color-purple-*` |
| Breakpoints | `tailwind.config.base.ts` | `baseBreakpoints` |
| Easing animazioni | `tokens.css` | `--ease-spring`, `--ease-cinematic`, ecc. |
| Keyframes | `theme.css` | `@keyframes` section |

---

## 15. Safelist — Classi Dinamiche Forzate

Le seguenti classi NON appaiono letteralmente nel JSX ma sono generate dinamicamente da `SIDEBAR_COLOR_SCHEMES` → devono stare in safelist:

### Admin (`packages/admin/tailwind.config.js`)
```javascript
safelist: [
  'dark:bg-gray-dark',      // sidebar bg dark
  'bg-brand-500/20',        // pill active bg
  'dark:bg-brand-500/20',
  'hover:bg-brand-500/10',  // pill hover bg
  'dark:hover:bg-brand-500/10',
  'text-brand-600',         // active text
  'dark:text-brand-400',
  'bg-brand-600',           // badge bg
  'pl-5',
]
```

### Front (`packages/front/tailwind.config.js`)
```javascript
safelist: [
  'dark:bg-gray-dark',
  'bg-lime-500/20',
  'dark:bg-lime-500/20',
  'hover:bg-lime-500/10',
  'dark:hover:bg-lime-500/10',
  'text-lime-700',
  'dark:text-lime-400',
  'bg-lime-700',
  'pl-5',
]
```

---

**Ultimo Aggiornamento**: Mar 16, 2026
**Analisi**: Claude Sonnet 4.6 (DeepSeek offline durante generazione)
**Azione richiesta**: Review + applicare cleanup in ordine priorità sezione 13
