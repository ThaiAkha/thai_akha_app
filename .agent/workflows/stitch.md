---
description: 🪄 UI Generator & Stitch MCP Specialist (Thai Akha Cherry 2026)
---

# 🪄 Stitch UI Specialist - Component Generator

Questo agente è specializzato nell'uso di **Stitch MCP** per generare, iterare e perfezionare componenti UI o intere schermate, assicurandosi che rispettino rigorosamente il **Thai Akha Kitchen Design System v2** e le classi Tailwind CSS.

## 📚 KNOWLEDGE BASE & CONTESTO
Prima di generare qualsiasi componente, tieni sempre a mente i nostri token e stili definiti in `.agent/workflows/style.md`.
- **Palette Principale**: `primary` (Cherry Red), `action` (Lime Green), `gray` (Neutral).
- **Stili Bottoni/CTA**: Usa shadow e glow personalizzati (`shadow-glow-lime`, `glow-cherry`).
- **Dark Mode**: Supporto nativo tramite i token semantici (`bg-title`, `text-desc`, `border-border`).

## 🚀 Azioni Disponibili

### 1. Generate Component (`/stitch generate [descrizione]`)
Genera un nuovo componente UI utilizzando Stitch.
// turbo-all
1. Leggi la [descrizione] fornita dall'utente.
2. Analizza mentalmente quali colori e Token di `style.md` sono perfetti per il caso d'uso.
3. Arricchisci il prompt originale inserendo esplicitamente le direttive Tailwind CSS da usare (es. "Fallo con sfondo `bg-primary/10`, testo `text-primary-500` e un bottone `bg-action shadow-glow-lime`").
4. Esegui il tool `mcp_StitchMCP_generate_screen_from_text` passando il `projectId` (`10837334620264508705`) e il prompt arricchito.

### 2. Iteration & Fixes (`/stitch fix [descrizione]`)
Applica modifiche a un componente o a una schermata precedentemente generata.
1. Chiedi all'utente quale componente va modificato o recupera i suggerimenti proposti dall'ultimo output (es. `output_components`).
2. Riesegui il comando `generate_screen_from_text` passando il nuovo prompt con la correzione di stile richiesta.

## 🔒 Check Preventivi (Stile e Coerenza)
- **Zero Colori Generici**: Vietato usare `bg-red-500` o `text-blue-600`. Usa ESCLUSIVAMENTE `bg-primary`, `bg-action`, o i `sys-*`.
- **UI Premium**: Stitch tende a creare UI di base. Forza l'utilizzo di `glass`, micro-animazioni (`hover:scale-105 transition-all`), o gradienti per un look eccellente.
- Se l'utente non specifica la tipologia di dispositivo, per default assumi design responsivo o genera un layout adatto al Web.
