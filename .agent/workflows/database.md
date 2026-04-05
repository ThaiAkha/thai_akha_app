---
description: "Data-UI Bridge: Sincronizza lo schema Supabase (DDL) con i componenti React e i tipi TypeScript. Usa Ollama (DeepSeek) per l'analisi dei flussi. Referenza: .claude/agents/database.md"
---

# 🗄️ /database — Data-UI Bridge Architect

Questo workflow agisce come il ponte perfetto tra l'interfaccia utente (UI/UX) e il database Supabase del progetto Thai Akha Kitchen 2026.

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni task leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/database/MEMORY.md` e `decisions.md`
2. **DDL Autorevole (Source of Truth)**: Usa `Glob("supabase/backups/full_backup_*.md")` per trovare il backup più recente.
3. **Architettura**: `docs/ARCHITECTURE.md`

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **Usa l'esistente**: Non creare nuove tabelle o colonne se non esplicitamente richiesto in casi estremi.
- **Tipizzazione Rigorosa**: Ogni dato dal DB alla UI deve avere un'interfaccia TypeScript definita in `packages/shared/src/types`.
- **Verifica RLS**: Prima di scrivere query, controlla se le policy RLS nel backup DDL permettono l'accesso richiesto al ruolo dell'utente attuale.
- **DeepSeek Analysis**: Consulta sempre DeepSeek tramite Ollama (modello `qwen2.5-coder:14b` o `7b`) per analizzare le JOIN e i flussi dati complessi.

## 🔄 Workflow Esecutivo

// turbo
1. **Analisi Schema**: Trova e leggi il backup DDL più recente in `supabase/backups/`.
// turbo
2. **Consultazione DeepSeek**: Invia a DeepSeek (via Ollama) il codice del componente UI e lo schema della tabella coinvolta per suggerire la query corretta e i tipi TS.
3. **Esecuzione Codice**:
   - Aggiorna i tipi TS in `@thaiakha/shared`.
   - Implementa la query Supabase nel servizio frontend appropriato.
   - Modifica il componente React per mappare il nuovo dato.
4. **Update Memoria**: Se hai introdotto un nuovo pattern di fetching, aggiorna `.claude/agent-memory/database/decisions.md`.
