# Admin DS - Baseline v2.1 (2026-09-02)

Standard unico del design system dell'app admin (`packages/admin`). Idioma TailAdmin: `gray-*` e `dark:` sono leciti; le regole front di `CLAUDE.md` #1-#6 NON si applicano. iPad/desktop-first. Adapt-only, diff minimo.
Sostituisce la v1 (giu 2026, 97 righe) e assorbe la baseline `/admin-style` del brain (`agent-memory/admin-style/design_system.md` + `decisions.md`, i cui numeri erano precedenti ai fix). Nei planner della manager vince `Admin_UX_2027/ADMIN_PLANNER_UX.md` dove e' piu' stringente.

## 0. Sorgenti e metodo

| Cosa | Dove (fonte di verita' = working tree, NON git HEAD) |
|---|---|
| Palette, breakpoint, ombre, z, easing (`@theme`) | `packages/admin/src/styles/base-theme.css` |
| Token semantici `--bg/--surface/--border/--text-*` light + `html.dark` | `styles/tokens.css` |
| Cablaggio token → utility (`--color-title`, `--color-surface`...) + font | `styles/theme.css` |
| Ordine import, `@custom-variant dark`, body, alias alpha, temi third-party | `src/index.css` |
| Utility custom (glass, menu-item, btn-flash, scrollbar) | `styles/utilities.css` |
| Componenti di riferimento | `components/ui/button/Button.tsx`, `ui/badge/Badge.tsx`, `typography/*.tsx`, `ui/inspector/InspectorShell.tsx` |

Metodo: contrasto = WCAG 2.x (luminanza relativa) calcolato sugli hex dei file, AA = 4.5 testo normale, 3.0 testo grande (WCAG: >= 24px, oppure >= 18.66px bold; `text-sm`/`text-xs` bold NON sono testo grande) e non-testo. Le famiglie Tailwind default (`green/amber/orange/red/blue-N`) non sono ridefinite in `base-theme.css`: i loro valori sono gli oklch di tailwindcss 4.2.1 (`node_modules/.pnpm/tailwindcss@4.2.1/node_modules/tailwindcss/theme.css`: green-700 #008236, green-400 #05df72, amber-700 #bb4d00, orange-400 #ff8904, red-700 #c10007, red-400 #ff6467, blue-700 #1447e6), NON gli hex v3 (#15803d, #f87171...). I fondi `/10` e `/15` si compongono in sRGB sulla superficie reale e si misurano sul caso peggiore fra `--surface` e `--bg`. Conteggi = regex su `packages/admin/src/**/*.{ts,tsx}` (310 file). Stato git: la Fase 0 (theme.css, tokens.css, Button, Badge, InspectorShell, typography + 172 file migrati) e' nel working tree e non in HEAD `62a8351` (`git diff HEAD --stat -- packages/admin/src`).

## 1. Il layer token: ordine e cablaggio dark

Ordine in `index.css:10-17`: `base-theme.css` → `tokens.css` → `theme.css` → `utilities.css` → `tailwindcss` → `@custom-variant dark (&:is(.dark *))`.

| Pezzo | File:riga | Cosa fa |
|---|---|---|
| Classe tema | `context/ThemeContext.tsx:35` | `document.documentElement.classList.add("dark")` → il tema sta su `<html>`, default `light`, persistito in localStorage; la preferenza di sistema NON e' letta |
| Token dark | `tokens.css:49` | `html.dark { --bg ... --text-muted }` ridefinisce le stesse variabili di `:root` |
| Variante `dark:` | `index.css:17` | `@custom-variant dark (&:is(.dark *))` → ogni `dark:x` diventa `:is(.dark *)` (529 occorrenze nel CSS compilato) |
| Utility semantiche | `theme.css:34-47` | `--color-title: var(--text-title)` ecc. dentro `@theme` → Tailwind genera `text-title`, `bg-surface`, `border-border`... |

Perche' NON c'e' `@media (prefers-color-scheme)`: il tema e' deciso da `ThemeContext`, non dal sistema. Un `@media` nei token li farebbe scattare in dark mentre le classi `dark:` resterebbero light: due temi sulla stessa schermata. In HEAD il blocco era `body.dark, @media (...) { :root {...} }`, CSS invalido (at-rule dentro una lista di selettori: la regola veniva scartata, `prefers-color-scheme` compariva 0 volte nel compilato) e puntava a `body.dark` mentre la classe sta su `html`. Regola: una sola sorgente del tema (`html.dark`); nel CSS compilato `prefers-color-scheme` deve restare a 0.

## 2. Testo semantico

Quattro classi, una per ruolo; il colore cambia da solo col tema. Contrasto misurato sul CASO PEGGIORE fra `--bg` (pagina) e `--surface` (card).

| Classe | Ruolo | Light (`tokens.css:23-26`) | CR light | Dark (`tokens.css:56-59`) | CR dark | Verdetto |
|---|---|---|---|---|---|---|
| `text-title` | titoli, valori | `#121311` | 17.97 | `#F6FCFC` | 14.45 | AAA |
| `text-body` | corpo, label, celle | `#4A504F` | 7.94 | `#D6DCDC` | 10.80 | AAA |
| `text-sub` | secondario, overline, hint | `#6E7474` | 4.59 | `#9AA0A0` | 5.65 | AA |
| `text-muted` | SOLO testo grande o decorazione | `#767C7C` | 4.10 | `#8A9090` | 4.62 | light AA-large, dark AA |

Regola `text-muted`: in light non esiste un gradino piu' tenue di `text-sub` che passi AA (4.10 < 4.5). Si usa solo per testo grande WCAG (>= 24px, o >= 18.66px bold: in pratica `Heading` xl+), icone, separatori, placeholder di stato (`null`, `-`), disabled. Mai per testo essenziale a dimensione normale, mai a `text-xs`.

Valori precedenti (HEAD): `--text-sub` light `#727878` = 4.33 (mancava AA), `--text-muted` light `#9AA0A0` = 2.56, dark `#727878` = 3.34.

Sulle superfici tinte il margine cala. Regola: `text-sub` e' AA solo su pagina e card; su chip/well/header di tabella e su `bg-surface-2` si usa `text-body`. "AA-large" nella tabella = 3.0-4.49: passa solo per testo >= 24px o >= 18.66px bold (§0); a `text-sm`/`text-xs`, anche bold, e' un FAIL.

| Superficie reale | `text-body` | `text-sub` | `text-muted` |
|---|---|---|---|
| light `bg-gray-50` `#E6ECEC` (body di `index.css:49`, header tabella) | 6.89 | 3.98 (AA-large) | 3.55 (AA-large) |
| light `bg-gray-100` `#D6DCDC` (chip, well) | 5.93 | 3.43 (AA-large) | 3.06 (AA-large) |
| light `bg-surface-2` `#EEF4F4` (riga alternata, well, §3) | 7.40 | 4.28 (AA-large) | 3.82 (AA-large) |
| dark `bg-surface-2` `#1a1f1e` | 12.02 | 6.28 | 5.14 |
| dark `bg-gray-800` `#4A504F` (card `dark:bg-gray-800`, aperti #12; NON e' `--surface-2`) | 5.93 | 3.10 (AA-large) | 2.54 (FAIL) |
| dark `bg-gray-700` `#5E6464` | 4.34 (AA-large) | 2.27 (FAIL) | 1.86 (FAIL) |

Adozione oggi (working tree): `text-title` 161 · `text-body` 150 · `text-sub` 530 · `text-muted` 28 (HEAD: 0 su tutte).
Nei componenti: `Heading` default→`text-title`, muted→`text-sub` · `Paragraph` primary→`text-body`, secondary/muted→`text-sub` · `Label`→`text-body` · `Caption`→`text-sub`, muted→`text-muted` · `InspectorHeader` sottotitolo `text-sub`, titolo `text-title` · `InspectorEmpty` `text-sub`.

## 3. Superfici e bordi

| Classe | Token | Light | Dark | Uso | Coppia gray equivalente (stessi hex) |
|---|---|---|---|---|---|
| `bg-background` | `--bg` | `#F6FCFC` | `#121311` | pagina | `bg-gray-25 dark:bg-gray-950` |
| `bg-surface` | `--surface` | `#FFFFFF` | `#222827` | card, modale, input, sidebar | `bg-white dark:bg-gray-900` |
| `bg-surface-2` | `--surface-2` | `#EEF4F4` | `#1a1f1e` | riga alternata, well; testo solo `text-title`/`text-body` (`text-sub` 4.28 in light, §2) | nessuna (derivato) |
| `border-border` | `--border` | `#D6DCDC` | `#4A504F` | bordo soft card, divisore | `border-gray-100 dark:border-gray-800` |
| `border-border-2` | `--border-2` | `#C2C8C8` | `#5E6464` | input, tabella, separatore forte | `border-gray-200 dark:border-gray-700` |

Cablate in `theme.css:43-47`; nel CSS compilato escono solo se usate (JIT): dopo #116 (2026-09-02) `bg-surface` e' su 75 righe. Le coppie gray a mano restano lecite perche' sono gli stessi hex; la classe semantica e' preferita nel codice nuovo. Attenzione: il body (`index.css:49`) e' `bg-gray-50` (`#E6ECEC`), non `--bg` (`#F6FCFC`): vedi aperti #1.
Surface 1 in dark = `gray-900`, non `gray-800` (`decisions.md` D2): su `gray-800` il testo secondario scende a 3.10. Il 2026-09-02 (#116) le 73 coppie `bg-white dark:bg-gray-800` sono passate a `bg-surface`; dove il className entra in un componente con `dark:bg-*` interno (Input, TextArea, Button outline) la forma e' `bg-surface dark:bg-surface`, perche' tailwind-merge deduplica per gruppo+variante e il solo `bg-surface` lascerebbe vivo il `dark:bg-gray-800/20` del componente. Le 67 coppie `bg-white dark:bg-gray-900` restano lecite (stessi hex).
Non-testo: nessun bordo raggiunge 3.0 (light 1.39/1.69, dark 1.82/2.49). Accettato perche' decorativo; stato e selezione non si comunicano mai col solo bordo (serve icona, fondo o testo).

## 4. Dove `text-gray-*` resta lecito

`text-gray-N` in tsx/ts: HEAD 1369 → working tree 175 (+51 in `index.css`/`utilities.css`: temi third-party e sidebar `menu-item`, by design). I 175 residui per categoria:

| Categoria | n | Esempio | Lecito? |
|---|---|---|---|
| `hover:`/`group-hover:` (stato, non colore base) | 35 | `hover:text-gray-700` | si |
| `dark:` meta' di una coppia con light non-gray | 21 | `text-primary-600 dark:text-gray-300` | si |
| `placeholder:` / `file:` | 14 | `placeholder:text-gray-400` | si |
| tinta icona (`<Icon className="w-4 h-4 text-gray-400">`) | 36 | `SalaryRoster.tsx:76` | si (non-testo, target 3.0 non richiesto per icone decorative) |
| testo su fondo colorato esplicito (CTA bianca in dark, lime, badge) | 30 | `Button.tsx:49` `text-gray-950` su lime | si, con contrasto misurato |
| meta' light di una coppia scritta a mano | 22 | `text-gray-800 ... dark:text-white/90` | tollerato, da migrare |
| altro (empty state `text-gray-300`, kicker `text-gray-600`) | 17 | `AgencyNews.tsx:160`, `SectionHeader.tsx:20` | da rivedere (aperti #10) |

Regola: `text-gray-*` mai per testo leggibile su pagina o card; per quello esistono le 4 classi di §2.

## 5. Colori di stato

Regola (`decisions.md` D3, `Badge.tsx:40-45`): fondo = token `sys-*` a `/10` light e `/15` dark; testo = shade `-700` in light, `-400` in dark; solid = fondo `-700` + `text-white`. Mai `text-sys-*` puro su fondo tenue, mai bianco sul token puro. Ratio con la palette Tailwind v4 (§0), fondo composto su `--surface`; fra parentesi il valore su `--bg` quando cambia il verdetto. Il Badge md e' `text-sm font-medium` (14px): non e' mai testo grande, quindi sotto 4.5 = FAIL. Il commento `Badge.tsx:40-45` riporta ancora i numeri v3 (4.60-5.96, 5.02-6.70): da riallineare.

| Stato | Light (fondo · testo) | CR | Dark (fondo · testo) | CR | Solid | CR | Token puro (vietato) |
|---|---|---|---|---|---|---|---|
| success | `bg-sys-success/10` · `text-green-700` | 4.54 (4.39 su `--bg`: FAIL) | `bg-sys-success/15` · `text-green-400` | 6.44 | `bg-green-700 text-white` | 4.95 | testo 2.09 · bianco 2.28 |
| warning | `bg-sys-warning/10` · `text-amber-700` | 4.66 (4.51 su `--bg`) | `bg-sys-warning/15` · `text-orange-400` | 4.77 | `bg-amber-700 text-white` | 5.03 | testo 1.99 · bianco 2.15 |
| error | `bg-sys-error/10` · `text-red-700` | 5.64 (5.44 su `--bg`) | `bg-sys-error/15` · `text-red-400` | 4.48 (FAIL su `--surface`; 5.57 su `--bg`) | `bg-red-700 text-white` | 6.42 | testo 3.30 · bianco 3.76 |
| info / primary | `bg-primary-50` · `text-primary-700` | 6.47 | `bg-primary-500/15` · `text-primary-400` | 3.67 (FAIL; 4.49 su `--bg`) | `bg-primary-500 text-white` (primary) / `bg-primary-700 text-white` (info, `Badge.tsx:65`) | 4.66 / 8.07 | `text-primary-500` su `primary-50` 3.73 |
| neutro | `bg-gray-100` · `text-gray-700` (`light.light`, 11 call-site letterali + 3 dinamici) | 4.34 (FAIL) | `bg-white/5` · `text-white/80` | 8.87 | `bg-gray-700 text-white` (`solid.dark`) | 6.03 | `light.dark` `bg-gray-500 text-white` 3.42 (`Badge.tsx:58`, 0 call-site: l'unico `color="dark"`, `market/ShopItemCard.tsx:95`, e' `solid`) · `solid.light` `bg-gray-600 text-white` 4.49 (`Badge.tsx:66`, 0 call-site). Neutro AA = `typography/Badge` default `bg-gray-100 text-gray-800` 5.93 |

Scala colore-stato dei planner (`ADMIN_PLANNER_UX.md`): grigio = da fare (neutro) · arancione = in corso/salvato (warning) · verde = fatto/cash (success) · blu = card (info). Ogni dominio mappa i suoi stati su queste 4 righe.
`base-theme.css:163-164` definisce anche `--color-sys-info` (#3B82F6) e `--color-sys-notice` (#EAB308), 0 usi in src. Riga blu dei planner: token concreto = `bg-sys-info/10` + `text-blue-700` (6.10) o `text-primary-700` (7.20); `text-sys-info` puro (3.28) e bianco su `sys-info` (3.68) sono vietati come per gli altri token. `sys-notice` e' fuori scala (non e' nelle 4 righe): non introdurlo, mappare su warning.
Misura: famiglie Tailwind default (`red|green|amber|orange|blue|purple|emerald|yellow|...-N`) 935 occorrenze (red 287, green 276, amber 91, orange 86, blue 82) contro 83 `sys-*` in tsx/ts (+6 in `index.css`); v1 contava 858 vs 90. Le `-700`/`-400` della tabella sono legittime; il debito sono i fondi/bordi e le 5 grafie dello stesso "ok" (`green-500/600/700`, `emerald-*`, `sys-success`).

## 6. Componenti di riferimento (valori nel file)

| Componente | Fatti (file:riga) | Contrasto |
|---|---|---|
| `Button` size | sm `px-4 py-2.5 text-xs` = 36px (solo toolbar densa) · md `px-5 py-3 text-sm` = 44px · icon `p-0` (`Button.tsx:33-37`) | - |
| `Button` primary | `bg-primary-500 text-white hover:bg-primary-600` (`:41`) | 4.66 · hover 6.05 |
| `Button` outline | `bg-white text-gray-700 ring-gray-700` (`:43`) | 6.03 |
| `Button` olive (DEFAULT) | `bg #BAD879 text-gray-950`, hover `#9EBF63`, active `#82A64D` (`:49`, `tokens.css:34-36`) | 11.70 · 8.95 · 6.66 (era bianco: 1.59) |
| `Button` focus | ring canonico §10 nella base (`Button.tsx:78-81`, dal 2026-09-02 #116): copre i 79 call-site; sulla variante `outline` il ring eredita `ring-inset` della variante (visibile comunque) | - |
| `ui/badge/Badge` | light/solid x 7 colori, `text-theme-xs` sm / `text-sm` md, `rounded-md` (`:31-38`); 27 file lo importano | tabella §5 |
| `typography/*` | 7 componenti: `Heading` (5xl..sm, colore default/onDark/brand/muted), `Paragraph` (lg..xs), `SectionTitle` `text-xs` uppercase (`:20`), `Label`, `Caption` `text-xs`, `Badge`, `Numeric` | `Heading` 14 file, `Paragraph` 10, `SectionTitle` 9, `Numeric` 1, `Caption`/`Badge`/`Label` 0 |
| `InspectorShell` | header `h-16`/`h-20`, `border-gray-200 dark:border-gray-800 bg-gray-50/50` (`:33`); sottotitolo `text-sub` `text-xs` uppercase; chiusura `text-sub` + ring focus ma senza dimensione = target 16px (`:44-49`); `InspectorEmpty` `text-sub` (`:71`, era 1.52); footer `border-gray-100 bg-gray-50/30` (`:78`) | sottotitolo `text-xs font-bold` (12px, `size="sm"`, `:37`) su `gray-50/50` = 4.36 su bianco, 4.28 su `--bg`: FAIL (12px bold non e' testo grande, §0). Fix candidato: `text-body` |

## 7. Radius, ombre, z-index, motion (occorrenze working tree)

| Asse | Standard | Conteggi | Fuori scala |
|---|---|---|---|
| Radius (concentrico: card >= button >= input) | `rounded-lg` input/chip · `rounded-xl` button · `rounded-2xl` card · `rounded-3xl` hero/modale · `rounded-full` pill | xl 151 · lg 131 · 2xl 102 · full 76 · 3xl 31 | `rounded` nudo 39, `rounded-md` 31 (ok solo su badge), `rounded-sm` 6; mai su card |
| Ombre | `shadow-sm` riposo · `shadow-lg` hover · `shadow-2xl` overlay · `shadow-theme-xs` Button/InputField | sm 91 · lg 41 · 2xl 24 · theme-xs 13 | `shadow-xl` 19 → lg, `shadow-md` 2; 24 token `--shadow-*` (+1 `--drop-shadow-4xl`) in `base-theme.css:179-213`, 11 usati (theme-xs 13 tsx +1 css · brand 8 · theme-sm 3 · slider-navigation 2 · theme-md, theme-xl, datepicker, focus-ring, brand-hover, glow-orange, glow-blue 1), 13 mai usati (theme-lg, tooltip, glass, brand-glow, action-glow, badge-glow, card-hover, glow-cherry/-h, glow-lime/-h, glow-orange-h, glow-blue-h) |
| Z-index | `z-10` sticky · `z-20` toolbar · `z-30` popover · `z-40` backdrop · `z-50` modale · `z-[99]` sidebar (`SIDEBAR_Z_INDEX`) | 10: 23 · 50: 12 · 20: 7 · 30: 7 · 40: 3 | `z-[999]` x3 `AdminChatBox.tsx:98,114,158`, `z-99999`/`z-999` `ui/modal/index.tsx:57,72`, `z-[99999]` `Tooltip.tsx:58` |
| Motion | `duration-200` colore · `300` elevazione · `500` entrata pagina (`PageContainer` `animate-in fade-in`) · `transition-colors` quando cambia solo il colore | - | `hover:translate-y-0.5` (scende invece di salire) `ui/Card.tsx:99`, `dashboard/BasicCard.tsx:28` |

Hover card canonico: `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300` (il meno e' obbligatorio).

## 8. Spacing

Scala Tailwind default, valori ammessi 2 · 3 · 4 · 6 · 8 (1/1.5 per icone e chip, 2.5/3.5 per controlli compatti esistenti). Card `p-4` sm · `p-6` md · `p-8` lg (`ui/Card.tsx:89-91` e' ancora `p-3/p-5/p-6`: aperti #7). Gap: `gap-2` icona+testo · `gap-3` righe · `gap-4` griglie · `gap-6` sezioni. Gutter di pagina solo via `PageContainer` (`px-4 md:px-6 2xl:px-10 py-4 md:py-6 lg:py-8`; container `max-w-[1920px]` default, `max-w-5xl` narrow, `max-w-7xl` wide).

## 9. Sizing e touch (standard planner, `ADMIN_PLANNER_UX.md`)

| Elemento | Standard | Realta' oggi |
|---|---|---|
| Floor testo informativo | 14px `text-sm`; titoli `text-base`+; vietato `text-xs`/`text-[7-13px]` nei planner | `text-xs` 538 vs `text-sm` 254 vs `text-base` 60; `text-[10px]` 18 in 8 file; `[7/8/9/11px]` = 0 |
| Target touch | >= 44px (`h-11`/`size-11`) | `Button` md 44px ok; sm 36px; chiusura Inspector 16px |
| Bottone primario | `h-12 text-base font-bold rounded-xl` | `InputField` gia' `h-12`, ma focus `focus:border-green-500 focus:ring-4 ring-green-500/20` (`InputField.tsx:44`: verde Tailwind, non `primary` ne' `sys-*`, aperti #13); `Button` md senza `h-*` esplicito |
| Icon-button | `size-11 rounded-xl`; `size-12` azione primaria | `size-10` 18 · `size-12` 9 · `size-11` 3 (v1) |
| Section title | `text-sm font-bold uppercase tracking-wide`, mai `text-xs` | UNA implementazione: `typography/SectionTitle` (`text-sm`, floor rispettato). `ui/SectionHeader` eliminato il 2026-09-02 (#114): 64 call-site in 23 file inlinati su SectionTitle, la variante `formfield` (etichetta di form, non titolo) migrata a `form/Label` in InputField/TextArea/SelectField/DriverPayoutForm |
| Info row | label `text-sm` · valore `text-base` | - |
| Card lista | titolo `text-base`, sottotitolo `text-sm`, avatar `h-10`; header avatar `h-14` | ok dove usato `LeaderHeader` |

Fuori dai planner: nessun testo leggibile sotto `text-xs` (12px); `text-[10px]` solo per micro-overline uppercase + tracking, e comunque debito (aperti #4).

## 10. Stati interattivi

| Stato | Standard |
|---|---|
| Focus (ogni elemento focusabile) | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900`; su card dentro `<Link>` → `group-focus-visible:` |
| Active | `active:scale-95` (card grandi `active:scale-[0.98]`) |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |
| Focus input | oggi `InputField.tsx:44` = `focus:border-green-500 focus:ring-4 ring-green-500/20` (verde Tailwind: `green-500` 108 token in src = border 45 · bg 31 · text 23 · ring 9, la "terza lime"); standard da fissare in aperti #13 |
| Copertura | `focus-visible:` in 24 file su 310; `Button.tsx` ha il ring canonico nella base (#116, copre 79 call-site); `<button>` grezzi 206 in 90 file, 201 senza `focus-visible:` sulla riga |

Nessun `outline-none` senza rimpiazzo `focus-visible`.

## 11. Stato migrazione (HEAD `62a8351` → working tree 28/08)

| Metrica | HEAD | Oggi | Nota |
|---|---|---|---|
| `text-gray-N` tsx/ts | 1369 | 175 (+51 css) | residui per categoria in §4, by design |
| `text-gray-N` senza prefisso | 954 | 105 | 36 icone · 30 fondo colorato · 22 coppie · 17 da rivedere |
| classi semantiche testo | 0 | 869 | title 161 · body 150 · sub 530 · muted 28 |
| classi morte (`text-md`, `gray-750/150/20`, `shadow-default`, `shadow-primary-glow`) | 12 | 0 | `gray-150/750` sopravvivono solo in un commento (`ReservationSidebar.tsx:119`) |
| `text-[Npx]` | 216+57+25+14 (v1 giu) | 18, solo `[10px]` | 8 file, quasi tutti overline uppercase |
| Fix AA | - | Button olive 1.59→11.70 · Badge light 4.54-6.47 su bianco (success 4.39 su `--bg`, error dark 4.48, info dark 3.67, neutro 4.34: ancora sotto AA, §5 e aperti #14) · Badge solid 4.95-8.07 · InspectorEmpty 1.52→4.59 · `--text-sub` 4.33→4.59 · `--text-muted` light 2.56→4.10, dark 3.34→4.62 | tutti in §2, §5, §6 |
| Blocco dark `tokens.css` | invalido (`body.dark, @media`) | `html.dark` | §1 |

## 12. Come verificare

```
pnpm --filter admin build            # CSS in packages/admin/dist/assets/index-*.css
# Il minificatore RAGGRUPPA i selettori: emette `.text-title,.text-title\/80{`.
# Cercare `\.text-title\{` da' 0 anche quando la utility esiste (falso positivo gia' pagato).
rg -oP '\.text-sub(?=[,{\\])'  dist/assets/index-*.css | wc -l   # 1 = utility emessa
rg -oP '\.bg-surface(?=[,{\\])' dist/assets/index-*.css | wc -l  # 0 = non usata nel sorgente (JIT), non "rotta"
rg -c  'prefers-color-scheme'   dist/assets/index-*.css          # atteso 0 (§1)
rg -o  'html\.dark\{[^}]*'      dist/assets/index-*.css          # blocco token dark
rg -o  ':is\(\.dark \*\)'       dist/assets/index-*.css | wc -l  # variante dark (529 al 28/08)
```
Controllo automatico (dal 2026-09-02, #113): `python3 thai_akha_brain/000_Core_Agents/010_Config/011_Tools/check_tailwind_classes.py` confronta i token classe dei `.ts/.tsx` (front+admin+shared) coi selettori del CSS compilato e stampa le classi che NON generano CSS, con file:riga. Senza argomenti usa i dist esistenti (0.6s, avvisa se stantii); `--build` ricompila prima (17s); `--self-test` verifica il rilevatore sulle famiglie note (gray-150/750, bg-gray-20, text-md, brand-*, text-theme-base). Gira anche in `sync_all.sh` del brain (senza build).
BSD `grep` di macOS non ha `-P`: usare `rg` o `perl -ne`. Contrasto: luminanza relativa L = 0.2126R + 0.7152G + 0.0722B (canali linearizzati sRGB), CR = (L1+0.05)/(L2+0.05); misurare sempre sul caso peggiore fra le superfici reali (§2). I colori Tailwind default sono oklch (§0): convertire oklch → oklab → sRGB lineare → sRGB a 8 bit prima della luminanza; i fondi `/10` `/15` si compongono in sRGB sulla superficie. Conteggi: regex `text-gray-\d+` (con e senza prefisso `(?<![a-z-:])`) su `src/**/*.{ts,tsx}`; le sostituzioni di classi si fanno con un tokenizer per prefisso di variante, mai con replace di stringa (`decisions.md`, tre errori documentati).

## 13. Aperti

| # | Voce | File | Numeri |
|---|---|---|---|
| 1 | Body `bg-gray-50` (`#E6ECEC`) diverso da `--bg` (`#F6FCFC`): `text-sub` direttamente sulla pagina in light = 3.98 (AA-large). Fix candidato: body → `bg-background` | `index.css:49` | 1 riga, cambia il grigio di pagina light |
| 2 | CHIUSO (#94 il 30/08 + #114 il 02/09): `SectionTitle` a `text-sm`, doppioni `typography/Badge`/`Label` eliminati, `Caption muted` rimossa, i 3 `text-muted` a 12px corretti, `ui/SectionHeader` eliminato (§9) | - | - |
| 3 | Colori di stato dai default Tailwind invece dei token `sys-*` | tutto `src` | 935 vs 83 (§5); overline `text-xs uppercase tracking-wide*` 230 righe |
| 4 | `text-[10px]` x18 | `SalaryRoster.tsx:78,88`, `pos/PosClassSidebar.tsx:130`, `salaryRoster/SalarySummary.tsx:27`, `PersonRow.tsx:30,60,65,109`, `common/LeaderHeader.tsx:70`, `WorkerSelector.tsx:126`, `market/ShopItemCard.tsx:86`, `pages/agency/AgencyReports.tsx:169,180,203,219,225,242,263` | 8 file |
| 5 | CHIUSO (#116 il 02/09): ring canonico D5 nella base di `Button` (§6, §10) | - | - |
| 6 | Touch: chiusura Inspector 16px, `Button` sm 36px, icon-button `size-10` dominante | `InspectorShell.tsx:44-49`, `Button.tsx:34` | standard 44px |
| 7 | `Card.tsx` padding `p-3/p-5/p-6` (standard `p-4/p-6/p-8`) e hover che scende | `ui/Card.tsx:89-91,99`, `dashboard/BasicCard.tsx:28` | 10 file usano `Card` |
| 8 | Z-index fuori scala | `AdminChatBox.tsx:98,114,158`, `ui/modal/index.tsx:57,72`, `ui/Tooltip.tsx:58` | 6 righe |
| 9 | `text-sub`/`text-muted` su superfici tinte (`bg-gray-50/100`, `dark:bg-gray-800`): sotto AA (§2) | audit da fare | nessun conteggio ancora |
| 10 | 17 `text-gray` "altro": empty state `text-gray-300` (`AgencyNews.tsx:160`, `ReservationInspectorPane.tsx:147`, `ReservationPreviewPane.tsx:99`, `DbContent.tsx:53`, `NewsContent.tsx:62`, `StorageContent.tsx:83`, `RunShoppingView.tsx:144`), kicker `text-gray-600` (`SectionHeader.tsx:20`) | vedi §4 | 2.10 / 4.49 su bianco |
| 11 | Fase 0 non committata: 172 file modificati in `packages/admin/src` vivono solo nel working tree | `git status packages/admin/src` | revisione avversaria del diff prima del commit |
| 12 | CHIUSO (#116 il 02/09): le 73 coppie `dark:bg-gray-800` → `bg-surface` (§3). Nota per #9: nei "well" `bg-gray-50 dark:bg-gray-900` (es. `RunShoppingView.tsx:23`) card e contenitore ora condividono la shade in dark e separano col bordo, come gia' in light; la gerarchia a superfici in dark si recupera con `bg-surface-2`, non tornando a gray-800 | - | - |
| 13 | Focus input in verde Tailwind (`green-500`, 108 token: border 45 · bg 31 · text 23 · ring 9) invece di `primary`/`sys-*`; nessuno standard di focus per gli input | `form/input/InputField.tsx:44` | decidere il ring (candidati `primary-500/20`, `action-*`) |
| 14 | Badge ancora sotto AA con la palette v4 (§5): `light.light` 4.34 (11+3 call-site), success light su `--bg` 4.39, error dark su `--surface` 4.48, info dark 3.67, `light.dark` 3.42 e `solid.light` 4.49 (0 call-site: eliminare); InspectorHeader sottotitolo 4.28-4.36 (§6); commento `Badge.tsx:40-45` con i numeri v3 | `ui/badge/Badge.tsx:42,57-58,66`, `InspectorShell.tsx:37` | fix candidati: fondo `/15` in light, `text-green-800`/`red-300` dove serve, sottotitolo `text-body` |
| 15 | 17 classi che non generano CSS in admin (build pulita 2026-09-02, via `check_tailwind_classes.py` §12): famiglia `blue-light-*` mai definita (`DataExplorerSidebar.tsx:54-56`, `ReportLineMedia.tsx:14`), `animate-in`/`animate-fade-in`/`animate-bounce-slow` senza plugin ne' keyframe (quindi l'entrata pagina `animate-in fade-in` di `PageContainer` dichiarata in §7 NON anima nulla), typo `border-gary-200` (`DemographicCard.tsx:55`), `dark:bg-dark-900` (`PhoneInput.tsx:93`), `bg-secondary-600` (`AkhaPixelPattern.tsx:15`), `focus:border-ring-primary-300` (`FileInput.tsx:12`), `max-h-select` (`MultiSelect.tsx:214`), `text-decoration-none` (`StorageInspector.tsx:141`), `text-theme-base` (`DataCardContent.tsx:26`). Il front ne ha 63 (fuori scope admin: famiglia `sys-*` e opacita' `/N` sui semantici `:root`-only, segnalate a /style) | output completo: lanciare lo script | 17 admin + 63 front |

## Delta v2 → v2.1 (2026-09-02, batch #113-#116)

#113 controllo automatico classi fantasma (`check_tailwind_classes.py`, §12) + nuovo aperto #15 · #114 `ui/SectionHeader` eliminato (§9, aperto #2 chiuso) · #116 ring focus canonico dentro `Button` (aperto #5 chiuso) e superficie dark unica via `bg-surface` (aperto #12 chiuso, regola twMerge in §3).

## Delta v1 (giu 2026) → v2

Aggiunti §1 cablaggio dark, §2 testo semantico, §3 superfici, §4 residui leciti, §5 regola stato, §9 planner, §11 migrazione, §12 verifica, §13 aperti. Sostituiti i numeri: focus 6 file → 23; `text-[Npx]` 312 → 18; `gray-*` 434 (v1) → 1783 totali oggi di cui `text-gray` 175; ruoli testo in coppie `gray` → 4 classi di §2. Conservati: radius, ombre, hover card, z-index, spacing, focus ring. Ogni standardizzazione successiva aggiorna questo file e bumpa la versione.
