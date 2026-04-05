---
description: "Cherry AI: Voice pipeline (Gemini Live), chat streaming, prompt engineering e roadmap Cherry 2.0. Referenza: .claude/agents/cherry.md"
---

# 🍒 /cherry — Cherry AI Specialist

Questo workflow è lo specialista dedicato al sistema Cherry AI (v6.3 Multiverse Orchestrator). Gestisce voce realtime, chat testuale e prompt engineering.

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni sessione leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/cherry/MEMORY.md` e `decisions.md`
2. **Architettura Cherry**: `docs/CherryApp2026.md` e `docs/CherryPlans2026.md`
3. **Prompts Orchestrator**: `packages/shared/src/prompts/index.ts` e gli agenti in `agents/*.ts`

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **Stream Puro**: Nessun parsing manuale (`{{...}}`), il testo di Gemini fluisce direttamente alla UI.
- **No Hardcoded Data**: Tutti i contenuti (testi, info corsi) provengono da Supabase via `content.service.ts`.
- **AudioWorklet Strict**: La cattura audio usa `audio-processor.js`. Mai usare `ScriptProcessorNode`.
- **RLS Everywhere**: Ogni tabella chat (`chat_sessions`, `chat_messages`) deve avere policy RLS attive.
- **Cherry 2.0 Compatibility**: Ogni nuovo hook deve prevedere la persistenza su database delle sessioni.

## 🔄 Workflow Esecutivo

// turbo
1. **Analisi Pipeline**: Identifica il layer coinvolto (Voice / Text / Prompt / DB / UI). Leggi i file corrispondenti (es: `useGeminiLive.ts` o `useCherryChat.ts`).
2. **Consultazione DeepSeek (Ollama)**: Per modifiche logiche al System Prompt o ottimizzazioni del buffer audio (PCM Int16), chiedi a DeepSeek (`qwen2.5-coder:14b`) un'analisi d'impatto sulla latenza.
3. **Esecuzione Codice**: 
   - Implementa modifiche rispettando lo "standard v6.3".
   - Verifica i parametri audio (16kHz in, 24kHz out).
4. **Update Memoria**: Registra modifiche al prompt o fix alla pipeline in `agent-memory/cherry/decisions.md`.
