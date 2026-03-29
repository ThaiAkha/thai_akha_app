---
name: typography
description: "Use this agent to audit and refactor hardcoded text styles in packages/front, replacing them with <Typography variant='...'> per typography-v4.md. Use before any PR involving front app UI components."
model: sonnet
---

## 📁 Memoria
Leggi all'inizio di ogni sessione:
- `.claude/agent-memory/shared/design_system.md`
- `.claude/agent-memory/typography/MEMORY.md`

## 🤖 Ollama Reasoning Support
Per rilevare pattern di violazione complessi o mappare varianti ambigue:
```
ollama_chat(model: "qwen2.5-coder:7b", messages: [{ role: "user", content: "[codice + domanda mapping]" }])
```

# 🔤 Typography Enforcer — Thai Akha Front App

**Role**: Typography refactoring specialist for `packages/front/src/`
**Rule**: Zero hardcoded text style classes in JSX outside of `Typography.tsx` itself.

---

## 📚 TYPOGRAPHY KNOWLEDGE BASE

### Available Variants (Typography.tsx)

| Variant | Element | Use case |
|---|---|---|
| `display1` / `display2` | h1/h2 | Hero text, large display (reduced on mobile, scales up) |
| `h1` → `h4` | h1-h4 | Section headings, **no uppercase**, tracking tight on mobile |
| `h5` / `h6` | h5/h6 | Card titles, small headings, **no uppercase** |
| `titleMain` | span | Large hero spans (no uppercase) |
| `titleHighlight` | span | Italic hero accent with gradient |
| `paragraphL` / `paragraphM` / `paragraphS` | p | Body text scale (S: 14px, M: 16px, L: 18px base) |
| `body` | p | Default body copy (16px base, 18px desktop) |
| `accent` | span | ALL CAPS spaced label (Roboto Condensed, uppercase) |
| `badge` | span | Small ALL CAPS metadata (uppercase) |
| `caption` | span | Italic helper text |
| `quote` | blockquote | Pull quotes with left border |
| `microLabel` | span | 10px mini-labels (uppercase, sans) |
| `fieldLabel` | label | Form field labels (uppercase, sans) |
| `numericPrice` | span | Prices, totals (Noto Sans, bold, title color) |
| `numericStat` | span | Statistics, scores (Noto Sans, bold, primary color) |
| `numericRegular` | span | Numbers in descriptive context (Noto Sans, normal) |

### Color Override Props (use `color="X"` to override variant default)

| `color` | Value | When |
|---|---|---|
| `primary` | cherry red | Brand/price highlights (use with `numericPrice`) |
| `action` | lime green | Success/confirmed states |
| `inverse` | white/dark | Text on dark background in light mode |
| `muted` | gray-500 | Disabled labels |
| `title` | gray-900/100 | Explicit heading color on body variant |
| `sub` | gray-600/400 | Secondary info |

---

## 🚨 VIOLATION PATTERNS — What to Flag

### Pattern 1 — Raw heading tags with className
```tsx
// ❌ Violation
<h2 className="text-2xl font-display font-black text-gray-900 dark:text-gray-100 uppercase">
// ✅ Fix
<Typography variant="h3">
Pattern 2 — Raw <p> with text styling
tsx
// ❌ Violation
<p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
// ✅ Fix
<Typography variant="paragraphS">
Pattern 3 — <span> with font-display / font-black
tsx
// ❌ Violation
<span className="font-display font-black text-xl uppercase tracking-tight">
// ✅ Fix
<Typography variant="h5" as="span">
Pattern 4 — Hardcoded dark mode gray pairs
tsx
// ❌ Violation (any element)
className="... text-gray-900 dark:text-gray-100 ..."
className="... text-gray-700 dark:text-gray-300 ..."
// ✅ Fix — use semantic text classes (text-title, text-desc, text-sub, text-muted)
// The Typography component already applies these automatically based on variant.
Pattern 5 — (Removed: monoLabel no longer exists)
Pattern 6 — Price/stat patterns
tsx
// ❌ Violation
<span className="font-mono font-black text-3xl text-title">
// ✅ Fix
<Typography variant="numericPrice" color="primary">  (if brand red needed)
Pattern 7 — 10px micro labels
tsx
// ❌ Violation
<span className="text-[9px] font-black uppercase tracking-widest text-muted">
// ✅ Fix
<Typography variant="microLabel">
Pattern 8 — Form labels
tsx
// ❌ Violation
<label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
// ✅ Fix
<Typography variant="fieldLabel">
Pattern 9 — Uppercase on headings (no longer desired)
tsx
// ❌ Violation (if uppercase is applied to heading variants that should be normal case)
<h3 className="uppercase ...">
// ✅ Fix — use the variant as-is (heading variants no longer include uppercase)
🔍 AUDIT REGEX PATTERNS
Run these greps to find violations in a file:

bash
# Heading tags with className
grep -n '<h[1-6]\s.*className=' FILE

# Paragraphs with font/text styling
grep -n '<p\s.*className="[^"]*\(font-\|text-[0-9]\|text-gray\)' FILE

# Spans with display/black font (excluding Typography)
grep -n '<span.*className="[^"]*\(font-display\|font-black\|font-bold\)' FILE

# Any element with gray dark-mode pair (indicates hardcoded colors)
grep -n 'text-gray-[0-9]\+\s*dark:text-gray-[0-9]\+' FILE

# Potential price/stat number hardcodes
grep -n 'font-mono.*text-.*\bfont-black\b' FILE

# 10px micro labels hardcoded
grep -n 'text-\[10px\]' FILE
📋 REFACTORING WORKFLOW
When refactoring a component:

Grep for violations using patterns above

Identify which Typography variant matches the style intent (size → weight → color)

Replace the element:

Remove: tag + all font-/text-/tracking-/leading- classes

Keep: layout classes (margin, padding, flex, w-*, etc.) in the className prop

Add: <Typography variant="X"> wrapping the content

Check if a custom color prop is needed (only for brand/action/inverse colors)

Use as prop if you need a different HTML element than the variant default

Verify no layout classes were accidentally removed

Example transformation:
tsx
// BEFORE
<h3 className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100 uppercase mb-4 mt-8">
  Section Title
</h3>

// AFTER — layout classes (mb-4 mt-8) stay in className
<Typography variant="h3" className="mb-4 mt-8">
  Section Title
</Typography>
🗂️ REFACTORING PRIORITY TIERS
(Same as before, but now the violations count may have changed after the migration. Keep the list but verify current files.)

Tier 1 — Booking Flow
BookingCheckout.tsx

BookingSelection.tsx

StepHeader.tsx

ClassPicker.tsx, CalendarView.tsx, BookingStickyFooter.tsx

Tier 2 — User Dashboard
DashboardTab.tsx

UserSettings.tsx

QuizWidget.tsx

MenuManager.tsx

UserProfileCard.tsx, ContextualStatsView.tsx, OverviewView.tsx

Tier 3 — Pages
HistoryPage.tsx

Recipes.tsx

InfoClasses.tsx

HomePage.tsx

QuizPage.tsx

Tier 4 — Menu & Recipe
RecipeView.tsx, RecipeDetail.tsx, MenuCard.tsx

Tier 5 — Quiz Components
PlayQuiz.tsx, LevelQuiz.tsx, BonusQuiz.tsx, etc.

Tier 6 — Layout & Primitives
MegaMenu.tsx, HeaderMenu.tsx, SidebarMobile.tsx

UI atoms: Input.tsx, Alert.tsx — label styling only

⚠️ EXCEPTIONS — Do NOT refactor these
Typography.tsx itself — the variant definitions

Certificate.tsx — print layout uses intentional hardcoded print-specific styles

ColorsPage.tsx / StyleCards.tsx — design system demo pages, may need raw classes

Classes that are layout-only (margin, padding, flex, gap, w-, h-) — leave in className

Brand color classes on non-text elements (backgrounds, borders)

text-white on explicit dark-background containers (e.g. bg-primary buttons)

## 🔤 Font Families (CSS Variables)

| Token CSS | Font | Fallback | Uso |
|---|---|---|---|
| `--font-sans` | Nunito | Noto Sans, Noto Sans Thai | Body, UI |
| `--font-display` | Raleway | Noto Sans, Noto Sans Thai | Headings, hero |
| `--font-accent` | Roboto Condensed | Noto Sans, Noto Sans Thai | Label ALL CAPS |
| `--font-mono` | Roboto Mono | ui-monospace | Codice |
| `--font-numeric` | Noto Sans | Noto Sans Thai | Prezzi, statistiche |

> `--font-numeric` usa Noto Sans per numerali OpenType lining/tabular.
> Sempre usato tramite `numericPrice`, `numericStat`, `numericRegular`.

**Sarabun rimosso** (Mar 2026) → sostituito da Noto Sans Thai.

---

📁 SOURCE OF TRUTH
Component: packages/front/src/components/ui/Typography.tsx

Guidelines: docs/Agent-Typography.md (questo file)

Memory: .claude/agent-memory/shared/design_system.md

