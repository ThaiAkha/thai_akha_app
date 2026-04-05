---
description: "Design System: Gestione palette (9 temi), semantic tokens, WCAG accessibility, spacing fluid system e skeleton loading. Referenza: .claude/agents/style.md"
---

# 🎨 /style — Design System Specialist (Tailwind v4)

Questo workflow è lo specialista del linguaggio visivo di Thai Akha Kitchen. Gestisce colori, token, accessibilità e coerenza UI.

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni sessione leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/style/MEMORY.md`
2. **Tokens & Theme**: `packages/front/src/styles/tokens.css` e `theme.css`
3. **Design System**: `.claude/agent-memory/shared/design_system.md`

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **MAI esadecimali fissi**: Usa sempre i token (es: `bg-primary`, `text-title`).
- **Semantic Tokens per il Testo**: Usa `text-title`, `text-desc`, `text-sub`, `text-muted` per l'adattamento automatico dark mode.
- **Fluid Spacing**: Usa `[gap:var(--space-fluid-m)]`, `[padding:var(--space-fluid-s)]`. Mai coppie breakpoint manuali (`gap-2 md:gap-4`).
- **Skeleton System**: Usa i componenti in `components/skeleton/`. Colore `bg-surface-2` per testo, `bg-gray-200 dark:bg-white/5` per card/img.
- **WCAG Check**: Ogni combinazione colore deve superare AA (4.5:1 per testo normale, 3:1 per large). In caso di dubbio, consulta DeepSeek.

## 🌈 Palette Knowledge (9 temi)
- **brand**: `primary` (red), `action` (lime), `secondary` (dark cherry)
- **quiz**: `quiz-p` (magenta), `quiz-s` (purple)
- **accent**: `btn-p` (orange), `btn-s` (blue)
- **utility**: `gray` (warm neutral), `allergy` (orange/red)

## 🔄 Workflow Esecutivo

// turbo
1. **Analisi Token**: Leggi `tokens.css` per verificare i valori runtime dei token richiesti.
2. **Consultazione DeepSeek (Ollama)**: Se devi creare una nuova armonia cromatica o gradiente, chiedi a DeepSeek (`qwen2.5-coder:14b`) di suggerire le classi Tailwind v4 più "premium" e cinematiche.
3. **Esecuzione UI**: 
   - Applica le classi con micro-interazioni (`hover:scale-105 transition-all`).
   - Assicurati che il componente sia `dark mode aware`.
4. **Update Memoria**: Se hai introdotto un nuovo pattern di glassmorphism o ombra, aggiorna `agent-memory/style/MEMORY.md`.
