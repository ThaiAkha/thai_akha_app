# 📋 Booking Form — UI Reference Map

> Guida completa a tutti gli elementi UI, icone, stili e file utilizzati nel flusso di registrazione/prenotazione.
> Ogni sezione contiene link diretti ai file sorgente con indicazione di **cosa contengono**.

---

## 🗂️ File Structure

| File | Ruolo |
|------|-------|
| [BookingPage.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/pages/BookingPage.tsx) | Pagina principale, gestisce stato globale (date, session, pax, step) |
| [BookingCheckout.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingCheckout.tsx) | **Form di registrazione** (login/guest), pagamento, T&C |
| [BookingSelection.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingSelection.tsx) | Selezione data, sessione (Morning/Evening), calendario |
| [StepHeader.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/StepHeader.tsx) | Header di ogni step (numero, nome, titolo, sottotitolo) |
| [BookingSummaryPills.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingSummaryPills.tsx) | Pills riassuntive (Data, Classe, Gruppo) |
| [PaxVisitorPicker.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/PaxVisitorPicker.tsx) | Stepper per Cooks e Visitors |
| [PhonePrefixSelect.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/PhonePrefixSelect.tsx) | Dropdown custom per prefisso telefonico |
| [NationalitySelect.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/NationalitySelect.tsx) | Dropdown custom per nazionalità |
| [CalendarView.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/CalendarView.tsx) | Calendario mensile interattivo |
| [MiniCalendar.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/MiniCalendar.tsx) | Calendario compatto |
| [ClassPicker.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/ClassPicker.tsx) | Selettore Morning/Evening class |
| [BookingStickyFooter.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingStickyFooter.tsx) | Footer sticky con CTA e riepilogo |

---

## 🎨 UI Primitives (Componenti Base)

Tutti importati da `../ui/index`:

| Componente | File | Cosa contiene |
|------------|------|---------------|
| `Input` | [Input.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Input.tsx) | Campo di testo con varianti (`mineral`, `default`, `outline`, `ghost`, `filled`), icone sx/dx, label, helperText, stati error/success |
| `Typography` | [Typography.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Typography.tsx) | Sistema tipografico con 18 varianti e 10 colori semantici |
| `Button` | [Button.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Button.tsx) | Pulsante con varianti (`brand`, `action`, `mineral`), icone, loading state |
| `Card` | [Card.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Card.tsx) | Container con variante `glass` per glassmorphism |
| `Icon` | [Icon.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Icon.tsx) | Wrapper per icone Lucide, supporto emoji |
| `Modal` | [Modal.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Modal.tsx) | Modale per Terms of Service e Privacy Policy |

---

## 🔤 Stili Testo e Titoli

### Gerarchia Tipografica nel Form

| Elemento | Classi Tailwind | Dove |
|----------|----------------|------|
| **Step Number** | `text-lg md:text-xl font-mono font-bold text-sub/50` | `StepHeader.tsx` |
| **Step Name** | `text-lg md:text-xl font-mono font-bold uppercase tracking-[0.2em] text-sub/50` | `StepHeader.tsx` |
| **Step Title** | `text-2xl md:text-4xl font-display font-black tracking-tight text-title uppercase` | `StepHeader.tsx` |
| **Step Subtitle** | `text-sm md:text-base text-desc font-medium` | `StepHeader.tsx` |
| **Section Title** (h4) | `Typography variant="h4"` → `text-title italic uppercase` | `BookingCheckout.tsx` |
| **Field Label** | `font-accent text-xs font-black uppercase tracking-widest text-desc/70` | `Input.tsx`, `BookingCheckout.tsx` |
| **Helper Text** | `text-xs ml-1 font-medium text-desc/60` (o `text-red-500` / `text-action`) | `Input.tsx` |
| **Info Card Title** | `font-black text-sm text-title uppercase tracking-tight` | `BookingCheckout.tsx` |
| **Info Card Body** | `text-xs text-desc/70 leading-relaxed` | `BookingCheckout.tsx` |
| **Pill Label** | `text-[10px] font-black uppercase tracking-widest text-desc/50` | `BookingSummaryPills.tsx` |
| **Pill Value** | `text-base font-bold text-title` (o session color) | `BookingSummaryPills.tsx` |
| **Total Label** | `Typography variant="h6"` → `text-desc/60 uppercase` | `BookingCheckout.tsx` |
| **Total Amount** | `Typography variant="h3"` → `text-title font-black` | `BookingCheckout.tsx` |
| **T&C Text** | `text-xs text-desc/70 leading-relaxed` | `BookingCheckout.tsx` |
| **T&C Links** | `text-title font-bold underline underline-offset-2 hover:text-action` | `BookingCheckout.tsx` |
| **Stepper Label** | `font-black uppercase tracking-widest text-xl` (o `text-lg` compact) | `PaxVisitorPicker.tsx` |
| **Stepper Number** | `font-mono font-black text-title text-4xl` (o `text-3xl` compact) | `PaxVisitorPicker.tsx` |

---

## 🎛️ Variante `mineral` — Stile Standard Form

Definita in [Input.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Input.tsx) (linea 42):

```
Light: bg-black/[0.03]  border-black/10   text-title  placeholder:text-desc/40
Dark:  bg-white/5        border-white/10   text-title  placeholder:text-desc/40
Focus: bg-black/[0.05]   border-action/50  ring-action/50
```

> ⚠️ **PhonePrefixSelect** e **NationalitySelect** usano ancora `bg-white/5 border-white/10` hardcoded.
> Per allinearli con la variante `mineral` aggiornata, vanno modificati allo stesso pattern `bg-black/[0.03] dark:bg-white/5`.

---

## 🖼️ Icone Utilizzate

### Registry centrale: [icons.ts](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/lib/icons.ts)
### Componente render: [Icon.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Icon.tsx)

| Nome Icona | Dove usata | Scopo |
|------------|------------|-------|
| `person` | BookingCheckout (login btn), PaxVisitorPicker (Visitors) | Utente esistente, icona visitor |
| `person_add` | BookingCheckout (guest btn) | Nuovo utente |
| `mail` | BookingCheckout (email field) | Icona campo email |
| `lock` | BookingCheckout (password field) | Icona campo password |
| `edit` | BookingCheckout (modify btn) | Pulsante modifica selezione |
| `info` | BookingCheckout (info card) | Card informativa |
| `credit_card` | BookingCheckout (CTA pagamento) | Pagamento con carta |
| `verified` | BookingCheckout (CTA conferma) | Conferma prenotazione |
| `login` | BookingCheckout (switch mode btn) | Switch a modalità login |
| `groups` | BookingSummaryPills (Group pill), PaxVisitorPicker (Cooks) | Gruppo / Cooks |
| `event` | BookingSummaryPills (Date pill) | Data selezionata |
| `wb_sunny` | BookingSummaryPills (Morning class) | Sessione mattina |
| `dark_mode` | BookingSummaryPills (Evening class) | Sessione sera |
| `chevron_right` | BookingSummaryPills (separatore) | Separatore tra pills |
| `add` | PaxVisitorPicker (incremento) | Pulsante + |
| `remove` | PaxVisitorPicker (decremento) | Pulsante − |
| `search` | PhonePrefixSelect, NationalitySelect | Ricerca nel dropdown |
| `close` | PhonePrefixSelect, NationalitySelect | Cancella ricerca |
| `expand_more` / `expand_less` | PhonePrefixSelect, NationalitySelect | Apri/chiudi dropdown |

---

## 🎨 Colori Semantici (Token CSS)

Definiti in [tokens.css](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/styles/tokens.css):

| Token | Light Mode | Dark Mode | Uso nel form |
|-------|-----------|-----------|-------------|
| `text-title` | `#121311` (gray-950) | `#f5f0e8` (cream) | Titoli, valori principali, links |
| `text-desc` | `#222827` (gray-900) | `#d5d0c8` | Paragrafi, sottotitoli |
| `text-sub` | `#4A504F` (gray-800) | `#a8a098` | Numeri step, testo secondario |
| `text-muted` | `#4A504F` (gray-700) | `#787068` | Hint, divider labels |
| `bg-surface` | `#faf8f5` | `#1a1a18` | Background card, contenitori |
| `border-border` | semitrasparente | semitrasparente | Bordi card e divider |
| `text-action` | `#98C93C` | `#98C93C` | Stato attivo, conferma, focus |
| `text-primary` | `#E31F33` | `#E31F33` | Brand accent (THB label) |

---

## 🔘 Stati Interattivi

### Toggle Yes/No (WhatsApp)
In [BookingCheckout.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingCheckout.tsx) (linee 202-220):

| Stato | Classi |
|-------|--------|
| **Yes attivo** | `border-action/60 bg-action/10 text-action shadow-glow` |
| **No attivo** | `border-red-500/50 bg-red-500/10 text-red-400` |
| **Inattivo** | `border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-desc/50` |

### Payment Method Buttons
In [BookingCheckout.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingCheckout.tsx) (linee 314-322):

| Stato | Classi |
|-------|--------|
| **Pay on Arrival (attivo)** | `bg-action/10 border-action text-title` |
| **Credit Card (attivo)** | `bg-primary/10 border-primary text-title` |
| **Inattivo** | `bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-desc` |

### Checkbox Terms & Conditions
In [BookingCheckout.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingCheckout.tsx) (linee 278-289):

| Stato | Classi |
|-------|--------|
| **Checked** | `bg-action border-action shadow-glow-lime` |
| **Unchecked** | `bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/20` |

### Summary Pills
In [BookingSummaryPills.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/BookingSummaryPills.tsx) (linee 18-21):

| Stato | Classi |
|-------|--------|
| **Attivo** | `bg-action/10 border-action shadow-glow` |
| **Inattivo** | `bg-surface border-dashed border-border/60 opacity-60` |
| **Icon attiva** | `bg-action text-background` |
| **Icon inattiva** | `bg-black/10 dark:bg-white/10 text-desc` |

### Stepper (Cooks/Visitors)
In [PaxVisitorPicker.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/booking/PaxVisitorPicker.tsx):

| Stato | Classi |
|-------|--------|
| **Cooks attivo** | `bg-action/10 border-action shadow-glow-lime scale-105` |
| **Visitors attivo** | `bg-btn-s-500/10 border-btn-s-500 shadow-glow-blue scale-105` |
| **Inattivo** | `bg-surface border-border opacity-80` |
| **+ button attivo** | `bg-action shadow-action-glow` (Cooks) / `bg-btn-s-500` (Visitors) |
| **+ button disabilitato** | `bg-black/10 dark:bg-white/10` |

---

## 📐 Layout

### Griglia Form (Guest Mode)
```
Row 1: [Full Name ─── col-span-6] [Email ──── col-span-6]
Row 2: [Prefix ─ col-3] [Phone ─ col-5] [WhatsApp ── col-4]
Row 3: [Age ─ col-3] [Gender ─ col-4] [Nationality ── col-5]
Row 4: [Password ──────────────── col-span-12]
Row 5: [Info Card ─────────────── col-span-12]
Row 6: [☐ Terms & Conditions ─── col-span-12]
```

### Griglia Form (Login Mode)
```
Row 1: [Email ──────── col-span-12]
Row 2: [Password ───── col-span-12]
```

---

## 📦 Dati Shared

| File | Contenuto |
|------|-----------|
| [BOOKING_PHONE_PREFIXES](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/data) | Lista prefissi telefonici con bandiere |
| [COUNTRIES](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/data) | Lista nazioni ISO 3166-1 con bandiere |
| [TERMS_OF_SERVICE](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/data) | Documento legale T&C strutturato |
| [PRIVACY_POLICY](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/data) | Documento legale Privacy strutturato |
| [getCountryFlag](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/data) | Helper per emoji bandiera da country code |

---

## 🔧 Utilities

| File | Contenuto |
|------|-----------|
| [cn (utils.ts)](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/lib/utils.ts) | `clsx` + `twMerge` per classNames condizionali |
| [icons.ts](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/shared/src/lib/icons.ts) | Registry icone: PascalCase, snake_case, kebab-case → Lucide |
| [tokens.css](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/styles/tokens.css) | Variabili CSS semantiche per Light/Dark mode |
| [index.css](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/styles/index.css) | Entry point CSS, importa tokens, utilities, animazioni |
