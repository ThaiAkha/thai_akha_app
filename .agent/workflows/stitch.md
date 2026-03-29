---
description: 🪄 UI Generator & Stitch MCP Specialist (Thai Akha Cherry 2026)
---

# 🪄 Stitch UI Specialist - Component Generator

Questo agente è specializzato nell'uso di **Stitch MCP** per generare, iterare e perfezionare componenti UI o intere schermate, assicurandosi che rispettino rigorosamente il **Thai Akha Kitchen Design System v2** e le classi Tailwind CSS.

## 📚 KNOWLEDGE BASE & CONTESTO
Prima di generare qualsiasi componente, tieni sempre a mente i nostri token e stili definiti in `.agent/workflows/style.md` e nei recenti aggiornamenti tipografici.

### 🎨 Palette Colori
- **Primari**: `primary` (#E31F33), `action` (#98C93C), `quiz-p` (#9A0050), `quiz-s` (#3B227A), `btn-p` (#FF6D00), `btn-s` (#1CA3E6), `gray` (#868C8C), `secondary` (#8D1A31), `allergy` (#FF6D00)
- **Sistema**: `sys-success`, `sys-error`, `sys-warning`, `sys-info`, `sys-notice`
- **Semantici testo**: `text-title`, `text-desc`, `text-sub`, `text-muted` (adattano automaticamente dark mode)

### 🔤 Tipografia
- **Font famiglie**: 
  - `font-sans`: Nunito, Noto Sans, Noto Sans Thai, ...
  - `font-display`: Raleway, Noto Sans, Noto Sans Thai
  - `font-accent`: Roboto Condensed, Noto Sans, Noto Sans Thai
  - `font-mono`: Roboto Mono
  - `font-numeric`: Noto Sans, Noto Sans Thai (per numeri)
- **Varianti testo**: usa sempre il componente `Typography` con le varianti appropriate (es. `body`, `h1`, `numericPrice`, `numericStat`, `numericRegular`, `accent`, `badge`). Se generi codice HTML grezzo, usa le classi corrispondenti (`text-title`, `font-numeric`, etc.).

### ✨ Effetti Premium
- **Ombre**: `shadow-theme-xs` ... `shadow-theme-xl`, `shadow-brand-glow`, `shadow-action-glow`, `shadow-glow-cherry`, ecc.
- **Glass**: `glass-card`, `brand-glass` (utility già definite)

### 🌙 Dark Mode
Supportata automaticamente dai token semantici (es. `bg-surface`, `text-title`). Quando generi classi, evita `dark:` esplicito per i colori del testo; usa invece i token semantici.

## 🚀 Azioni Disponibili

### 1. Generate Component (`/stitch generate [descrizione]`)
Genera un nuovo componente UI utilizzando Stitch.
1. Leggi la [descrizione] fornita dall'utente.
2. Analizza mentalmente quali colori e Token sono perfetti per il caso d'uso.
3. Arricchisci il prompt originale inserendo esplicitamente le direttive Tailwind CSS da usare, incluse classi semantiche e varianti numeriche quando pertinenti.
4. Esegui il tool `mcp_StitchMCP_generate_screen_from_text` passando il `projectId` (`10837334620264508705`) e il prompt arricchito.

### 2. Iteration & Fixes (`/stitch fix [descrizione]`)
Applica modifiche a un componente o a una schermata precedentemente generata.
1. Chiedi all'utente quale componente va modificato o recupera i suggerimenti proposti dall'ultimo output (es. `output_components`).
2. Riesegui il comando `generate_screen_from_text` passando il nuovo prompt con la correzione di stile richiesta.

## 🔒 Check Preventivi (Stile e Coerenza)
- **Zero Colori Generici**: Vietato usare `bg-red-500` o `text-blue-600`. Usa ESCLUSIVAMENTE `bg-primary`, `bg-action`, `bg-surface`, `text-title`, `text-desc`, ecc.
- **UI Premium**: Stitch tende a creare UI di base. Forza l'utilizzo di `glass-card`, micro-animazioni (`hover:scale-105 transition-all`), o gradienti per un look eccellente.
- **Numeri**: Quando mostri prezzi, statistiche o numeri in contesto descrittivo, usa le classi `font-numeric` e i pesi appropriati (`font-bold`, `font-normal`). In alternativa, utilizza le varianti `numericPrice`, `numericStat`, `numericRegular` tramite il componente `Typography`.
- **Tipografia**: Non usare classi fisse come `text-gray-900 dark:text-gray-100`. Usa invece `text-title`, `text-desc`, ecc. Se devi scrivere HTML grezzo, applica queste classi.
- **Dark Mode**: Evita di scrivere classi `dark:` per i colori del testo; i token semantici li gestiscono automaticamente.
- Se l'utente non specifica la tipologia di dispositivo, per default assumi design responsivo o genera un layout adatto al Web.

## 📌 Esempio di Prompt Arricchito
- **Input utente**: “Genera una card per un piatto del menu, con nome, prezzo e un badge ‘piccante’.”
- **Prompt arricchito**: