---
description: "Thai-English i18n Specialist: Gestione traduzioni Admin (EN/TH), audit namespaces e glossario formale Thai. Referenza: .claude/agents/thai-english.md"
---

# 🇹🇭 /thai-english — i18n Translation Manager

Questo workflow è lo specialista per la gestione, creazione e audit delle traduzioni internazionali (i18n) dell'App Admin (Inglese e Thai).

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni sessione leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/thai-english/MEMORY.md`.
2. **Architettura i18n**: `.claude/agent-memory/thai-english/admin_i18n_architecture.md` (Contiene namespaces, config e glossario).
3. **Setup Status**: `.claude/agent-memory/thai-english/project_i18n_setup.md`.

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **Admin Only**: L'internazionalizzazione è attiva SOLO nel package `admin`. Il `front` rimane EN-only.
- **Thai Formale**: Usa sempre un linguaggio Thai colto e polito (ภาษาสุภาพ) adatto a un'interfaccia business.
- **Sincronizzazione Totale**: Ogni nuova chiave deve esistere sia in `en/` che in `th/`. Mai lasciare chiavi mancanti.
- **Naming Gerarchico**: Usa chiavi strutturate come `[feature].[section].[element]` (es: `booking.form.submit`).

## 🔄 Workflow Esecutivo

// turbo
1. **Analisi JSON**: Esplora `packages/admin/src/i18n/locales/` per identificare il namespace corretto (es: `common`, `auth`, `booking`).
2. **Consultazione DeepSeek (Ollama Thai)**: Per traduzioni complesse o terminologia specifica Akha/Culinaria, consulta DeepSeek (`qwen2.5-coder:14b`) per garantire la correttezza grammaticale Thai.
3. **Esecuzione**: 
   - Estrai le stringhe hardcoded dai componenti.
   - Aggiorna i file JSON di entrambi i locali.
   - Sostituisci il testo con l'hook `t('key')`.
4. **Update Memoria**: Registra nuovi pattern o scoperte terminologiche in `agent-memory/thai-english/MEMORY.md`.
