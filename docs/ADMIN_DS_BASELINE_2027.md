# Admin DS — Baseline token (report-first, Giu 2026)

Token canonici dell'app admin, **derivati dall'uso reale** (frequenze nel codice) e canonizzati. Idioma TailAdmin: `gray-*`/`dark:` leciti. Questa baseline guida l'estrazione delle shell (Fase 1) e le migrazioni. Diff minimo, adapt-only.

## Radius (concentrico)
| Ruolo | Token | Note (freq. reale) |
|---|---|---|
| Input / control piccolo | `rounded-lg` | lg=104 |
| **Button** | `rounded-xl` | xl=127 (dominante) |
| **Card** | `rounded-2xl` | 2xl=94 |
| Hero / banner / modal | `rounded-3xl` | 3xl=32 |
| Pill / avatar / icon-badge | `rounded-full` | full=61 |
→ Regola concentrica: contenitore esterno ≥ interno. **Vietato**: `rounded-md`/`sm` su card (residui da migrare).

## Ombre / elevazione
| Stato | Token |
|---|---|
| Card a riposo | `shadow-sm` (88) |
| Button | `shadow-theme-xs` (token esistente) |
| Hover card | `shadow-lg` |
| Overlay / modal / popover | `shadow-2xl` |
→ Hover canonico card: `hover:shadow-lg hover:-translate-y-0.5` (no più mix `xl`/`2xl` casuale).

## Border (card & divider)
| Ruolo | Token |
|---|---|
| **Card soft border** (canonico) | `border-gray-100 dark:border-gray-800` (156/180 — dominante) |
| Divider / input / border forte | `border-gray-200 dark:border-gray-700` (152/109) |
→ Una card = soft border; eliminare l'uso misto `gray-200` sulle card.

## Padding card
| Size | Token | Uso |
|---|---|---|
| sm | `p-4` | card densa / list item |
| **md (default)** | `p-6` | card standard |
| lg | `p-8` | hero / sezioni ariose |
(`Card.tsx` oggi sm=p-3/md=p-5/lg=p-6 → riallineare a 4/6/8, i più usati.)

## Colore semantico (gray → ruolo) — già negli `Paragraph`/`Heading`
| Ruolo | Light / Dark |
|---|---|
| Title | `text-gray-900 dark:text-white` |
| Body | `text-gray-700 dark:text-gray-200` |
| Secondary | `text-gray-600 dark:text-gray-300` |
| Muted / meta | `text-gray-400 dark:text-gray-500` |
| Surface base | `bg-white dark:bg-gray-900` |
| Surface raised | `bg-gray-50 dark:bg-gray-800` |
→ Usare i 6 componenti typography (non `text-gray-*` grezzo) per il TESTO. `bg-gray-*` resta lecito per superfici.

## Stati interattivi
- **Hover card-link**: `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`.
- **Focus (STANDARD — oggi in soli 6 file = gap a11y)** — ogni elemento focusabile:
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900`
  (su Card avvolta in Link: `group-focus-visible:` sul Card).
- **Active**: `active:scale-95` (o `active:scale-[0.98]` per card grandi).
- **Disabled**: `opacity-50 cursor-not-allowed`.

## Z-index (scala)
| Layer | z |
|---|---|
| Sidebar | `z-[99]` (costante `SIDEBAR_Z_INDEX`) |
| Sticky header tabella / toolbar | `z-10` / `z-20` |
| Backdrop | sotto la sidebar |
| Modal / keypad | gestito da `<Modal>` |
→ Niente z-index arbitrari nuovi fuori da questa scala.

## Motion
- Transizione standard: `transition-all duration-300` (card/hover). Sidebar: `800ms` (costante).
- Entrata pagina/blocchi: `animate-in fade-in (slide-in-from-bottom-4) duration-500`.

---
**Applicazione**: durante Fase 1 (shell) e Fase 2 (migrazioni) si adottano questi token; le divergenze residue (`rounded-md` su card, border `gray-200` su card, `p-5`, focus mancante) si correggono a diff minimo, comportamento invariato.

---

## Typography & Numbers Standard (Giu 2026) — REGOLE

Problema misurato: `text-[10px]`×216, `[9px]`×57, `[11px]`×25, `[8px]`×14 su 76 file; ~38 titoli grezzi `text-2xl/3xl font-bold`; numeri a size sparse. Lo standard esiste (6 componenti typography) ma **non è propagato**.

### ① Floor testi — niente minuscoli
- ❌ VIETATI `text-[7px]/[8px]/[9px]`.
- `text-[10px]`/`text-[11px]` ammessi **solo** per micro-overline **uppercase + tracking** (kicker, badge, label maiuscola).
- Qualsiasi label/valore **leggibile** → minimo **`text-xs` (12px)**. Contenuto/descrizioni → `text-sm` (14px)+.

### ② Titoli — sempre via componenti
- Header pagina = `<Heading level="h2">` (30px) · Card/pannello = `<Heading level="h4">` (20px) · Sotto-titolo card = `h5` (16px) · Overline/kicker = `<SectionTitle>` (xs uppercase tracking).
- ❌ Niente `text-2xl/3xl/4xl font-bold/black` grezzi nelle pagine → usare `Heading`.

### ③ Numeri — componente `<Numeric>` (3 ruoli uniformi)
`import { Numeric } from '../components/typography'`
- `variant="stat"` → KPI grande (mono black 2xl) · `variant="value"` → prezzo/totale inline (mono black lg) · `variant="meta"` → conteggio piccolo (mono bold sm).
- `tabular-nums` integrato. Colore a carico del chiamante (es. `className="text-primary-600"`). ❌ Niente `font-mono font-black text-*` ad-hoc.

### ④ Enforcement & migrazione
- Componenti condivisi (reports-lib, InspectorShell) **già ≥12px** ✅.
- Migrazione **mirata** (non blanket) per area, top-offender prima: Media → Hotels → Storage → News → Inventory → pages (AgencyReservations, KitchenBookings, MarketRunner…).
- Gate: `grep -rho 'text-\[[0-9]*px\]'` non deve avere `[7/8/9px]`; `[10/11px]` solo su righe con `uppercase`.
