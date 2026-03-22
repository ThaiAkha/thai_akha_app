# 📝 Typography v4 — Text Rendering Guidelines

Questa guida illustra il nuovo standard (v4) per l'uso dei testi nell'applicazione Thai Akha Kitchen.
**Regola d'oro:** Evita di usare tag HTML crudi (`<h1>`, `<h2>`, `<p>`, `<span>`) con classi Tailwind lunghe hardcoded. **USA SEMPRE il componente `<Typography>`**.

---

## 🛑 Il Problema (Cosa NON fare)

Nel codice legacy, titoli e paragrafi sono definiti con stringhe di classi lunghissime. 
- Porta a inconsistenze tipografiche e delusione del Design System.
- Gestire il colore Light vs Dark (`text-gray-900 dark:text-gray-100`) in ogni istanza è noioso e prono ad errori (vedi i vecchi bug di `text-title` o opacity errate).

**Esempio legacy errato (da `StepHeader.tsx`):**
```tsx
<h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-gray-900 dark:text-gray-100 mb-3 uppercase">
  {title}
</h2>
<p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-xl mx-auto font-medium">
  {subtitle}
</p>
```

---

## ✅ La Soluzione (Cosa FARE)

Usa il componente `<Typography>` in [Typography.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/components/ui/Typography.tsx). È impostato con le tag corrette (`as` / `element`), i pesi corretti dei font (`font-display` o `font-sans`), ma soprattutto **i colori gray esatti per il Light ed il Dark mode**.

**Esempio corretto:**
```tsx
import { Typography } from '../ui/index';

<Typography variant="h2" className="mb-3">
  {title}
</Typography>

<Typography variant="paragraphM" className="max-w-xl mx-auto">
  {subtitle}
</Typography>
```
Nessuna dichiarazione hardcoded del tag HTML, zero classi font-*, zero dichiarazioni testuali di testo grigio! I font, i tracking e il resizing responsive delle fonti base sono gestite dalla variante.

---

## 🔧 Varianti Disponibili

Tutte le varianti base incorporano da sole l'adattamento Cromatico (Es: `gray-900/100`).

### 🏛️ Headings (Titoli)
Ideali per titoli di pagina e di sezione.
*   `display1` / `display2`: Hero Text giganteschi (es. Home) -> `text-gray-900 dark:text-gray-100`
*   `h1` a `h4`: Titoli principali e secondari strutturati -> `text-gray-900 dark:text-gray-100`
*   `h5`: Sottotitoli -> `text-gray-800 dark:text-gray-200`
*   `h6`: Eyebrow text, titoli cards piccole -> `text-gray-700 dark:text-gray-300`

### 🦸‍♂️ Hero Specific
*   `titleMain`: Variante particolare per grossi header Hero -> `text-gray-800 dark:text-gray-400`
*   `titleHighlight`: Testo inclinato, senza colore assegnato (spesso per sfumature Gradient con classi).

### 📄 Body Text (Paragrafi)
Uso normale. Base di testo su blocchi.
*   `paragraphL` / `paragraphM` / `paragraphS`: Diverse scale -> `text-gray-700 dark:text-gray-300`
*   `body`: Corpo testo default -> `text-gray-700 dark:text-gray-300`

### 💡 UI & Accents
Etichette o componenti minime.
*   `accent` / `badge`: Tag caps lock spessi (es: step name in StepHeader) -> `text-gray-600 dark:text-gray-400`
*   `caption`: Microtesto helper (es input) -> `text-gray-500 dark:text-gray-500`
*   `quote`: Blocchi di testo accentati in corsivo.

### 📊 UI Data (v4.9 — aggiunto 2026-03-19)
Varianti per dati numerici, etichette di sezione e form. Non usare `<span>` con classi mono hardcoded!
*   `monoLabel`: Numeri step, booking ref, label sequenziali -> `font-mono bold uppercase tracking-[0.2em] text-gray-500`
    ```tsx
    <Typography variant="monoLabel">01. SCEGLI DATA</Typography>
    ```
*   `statNumber`: Prezzi (THB 2,400), pax count, punteggi quiz -> `font-mono black text-2xl/4xl gray-900/100`
    ```tsx
    <Typography variant="statNumber" color="primary">THB 2,400</Typography>
    ```
*   `microLabel`: Header di sezione card, mini-etichette metadati -> `sans 10px black uppercase tracking-widest gray-600/400`
    ```tsx
    <Typography variant="microLabel">GUESTS</Typography>
    <Typography variant="microLabel">#REF-001</Typography>
    ```
*   `fieldLabel`: Label sopra i campi form -> `sans xs semibold uppercase tracking-wider gray-700/300`
    ```tsx
    <Typography variant="fieldLabel">Full Name</Typography>
    <Input ... />
    ```

---

## 🎨 Override del Colore Semantic (quando il grigio non basta)

Se serve un testo con colore di BRAND (primary red, action green), o un colore invertito su un background scuro in light-mode, usa la prop **`color`**. Questa prop **spegne il colore di default della variante e applica quello richiesto**.

| Prop `color="X"` | Usa questo caso |
|-----------|---|
| `primary` | `#E31F33` - Messaggi Brand / Prezzi grossi (THB). |
| `action` | `#98C93C` - Stile o stato "Confermato / Successo". |
| `inverse` | `white dark:gray-900` - Titoli piazzati in bottoni con bg scuro in light mode. |
| `muted` | `gray-500` - Label disabilitati. |

**Stato di base:** (viene grigio 700 / 300)
```tsx
<Typography variant="body">Hello World</Typography> 
```
**Stato Esplicito Custom:** (per esempio per evidenziare un helper d'errore o colorare text-action).
```tsx
<Typography variant="caption" color="action">Password corretta!</Typography>
```

---

## 🕵️‍♂️ Refactoring Guidelines per agenti

Per convertire il codice esistente:

1. **Trova**: Qualsiasi testo `<span>`, `<p>`, `<h1>`-`<h6>` che monta lunghe stringhe `className` legate alla font o size (es `font-display`, `text-lg font-mono`, `text-gray-900 dark:text-gray-100`).
2. **Identifica**: Trova la `TypographyVariant` corrispondente che abbia quegli stessi stili o colori. Confronta in `Typography.tsx`. 
3. **Rimpiazza**: Cancella il tag standard. Pura le vecchie stringhe CSS di font/size/color dal className. Inietta solo un `<Typography variant="LA_VARIANTE" className="quello-che-rimane">Testo</Typography>`.
4. **Prop as (opzionale)**: Se ti serve un tag HTML particolare non previsto di default dalla variante, usa `as`, esempio: `<Typography variant="h4" as="span">`.
