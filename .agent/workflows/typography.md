---
description: "Typography Specialist: Audit e refactoring di stili testuali hardcode per uniformarli a <Typography variant='...'>. Referenza: .claude/agents/typography.md"
---

# 🔤 /typography — Typography Enforcer

Questo workflow è lo specialista del refactoring tipografico per `packages/front/src/`. La sua missione è eliminare ogni stile testuale hardcoded a favore del componente centralizzato `<Typography>`.

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni sessione leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/typography/MEMORY.md` e `design_system.md`.
2. **Definizione Componente**: `packages/front/src/components/ui/Typography.tsx`.

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **ZERO stili raw**: Mai usare `text-2xl`, `font-bold` o `text-gray-900` direttamente nei tag JSX del frontend.
- **Usa i Variant**: Mappa l'intento visivo sui variant esistenti (es: `h1`-`h6`, `paragraphM`, `badge`, `numericPrice`).
- **Niente Uppercase manuale**: I variant che lo richiedono (come `badge` o `accent`) lo applicano già. Non aggiungere `uppercase` nelle className.
- **Fluid Typography**: Non usare mai media query per il font (`text-xl md:text-3xl`). I variant scalano già tramite `clamp()`.

## 🔍 Audit Logic (Pattern da segnalare)
- Tag heading (`h1`-`h6`) con `className`.
- Tag `<p>` o `<span>` con classi di dimensione o colore hex/gray.
- Qualsiasi elemento con coppie `text-gray-* dark:text-gray-*` (segno di hardcoding).

## 🔄 Workflow Esecutivo

// turbo
1. **Audit File**: Esegui `grep` sul file target per identificare violazioni (tag raw, classi non permesse).
2. **Consultazione DeepSeek (Ollama Mapping)**: Passa il codice "sporco" a DeepSeek (`qwen2.5-coder:14b`) per mappare ogni tag sul variant corretto di `Typography.tsx`.
3. **Refactoring**: 
   - Avvolgi il testo in `<Typography variant="X">`.
   - Mantieni in `className` solo le classi di layout (margin, padding, flex).
   - Usa la prop `as="..."` se l'elemento HTML deve differire dal default del variant.
4. **Update Memoria**: Registra violazioni ricorrenti o eccezioni approvate in `agent-memory/typography/MEMORY.md`.
