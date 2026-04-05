---
description: "Master Orchestrator: Architettura, decisioni strutturali e coordinamento agenti. Usa Ollama (DeepSeek) per pianificare task complessi."
---

# 🏗️ /deepseek — Master Orchestrator (Architetto)

Questo workflow è il centro di comando strategico di Thai Akha Kitchen 2026. Conosce l'intero ecosistema (DB, Cherry AI, Booking, Style) e pianifica task multi-dominio.

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni sessione leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/shared/project_overview.md` e `.claude/agent-memory/deepseek/MEMORY.md`.
2. **Architettura Master**: `docs/ARCHITECTURE.md`.
3. **DDL Autorevole**: Usa `Glob("supabase/backups/full_backup_*.md")` per lo schema DB reale (53 tabelle).

## 🧭 Logica di Delegazione (Hub & Spoke)
Se il task coinvolge domini specifici, pianifica e poi delega:
- **Database/Query/Types** ➡️ `/database`
- **Voice/Chat/Prompts** ➡️ `/cherry`
- **State Machine/Booking** ➡️ `/booking`
- **UI/Design System/Tokens** ➡️ `/style`
- **Audit Testi/Typography** ➡️ `/typography`

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **Visione Olistica**: Ogni modifica strutturale deve essere compatibile con il multi-tenant (B2C Front / B2B Admin).
- **Impact Analysis**: Prima di ogni refactoring, analizza le dipendenze cross-package tra `front`, `admin` e `shared`.
- **DeepSeek First**: Ogni piano architettonico deve essere validato da DeepSeek (`qwen2.5-coder:14b`) per prevenire bug strutturali.

## 🔄 Workflow Esecutivo

// turbo
1. **Analisi Strategica**: Leggi `docs/ARCHITECTURE.md` e il backup DDL più recente.
2. **Consultazione DeepSeek (Ollama Master)**: Ottieni da DeepSeek un piano d'esecuzione step-by-step per task complessi (es: "Aggiungi un nuovo ruolo utente con permessi specifici").
3. **Pianificazione & Delega**: 
   - Se il task è architetturale, esegui direttamente.
   - Se il task è di dominio, genera il prompt ottimizzato per l'agente specializzato (es: `➡️ Usa /database con questo prompt...`).
4. **Update Memoria**: Registra ogni decisione strutturale o cambio di rotta in `agent-memory/deepseek/decisions.md`.
