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

## 🤖 Ollama Models

| Modello | Uso | Quando |
|---|---|---|
| **translategemma:12b** | Traduzione EN→TH | Traduzioni di UI strings, labels, messaggi |
| **qwen2.5-coder:14b** | Reasoning i18n | Analisi namespace, naming conventions, chiavi mancanti |

**Nota**: `translategemma:12b` è specializzato per traduzione (55+ lingue), ideale per qualità Thai nativa. Usalo per le vere traduzioni.

---

## 🔄 Workflow Esecutivo

1. **Analisi JSON**: Esplora `packages/admin/src/i18n/locales/` per identificare il namespace corretto (es: `common`, `auth`, `booking`).

2. **Traduzioni Thai (con translategemma:12b)**:
   - Per UI strings, labels, messaggi di conferma → usa `translategemma:12b` (modello specializzato)
   - Esempio: tradurre il testo EN del form di login in Thai formale

3. **Reasoning i18n (con qwen2.5-coder:14b)**:
   - Per analizzare terminologia specifica Akha/Culinaria → usa `qwen2.5-coder:14b`
   - Per valutare naming conventions e coherenza namespace
   - Per identificare chiavi mancanti o inconsistenze
   - Fallback: `qwen2.5-coder:7b` se 14b non disponibile

4. **Esecuzione**:
   - Estrai le stringhe hardcoded dai componenti.
   - Aggiorna i file JSON di entrambi i locali (EN + TH).
   - Sostituisci il testo con l'hook `t('key')`.

5. **Update Memoria**: Registra nuovi pattern o scoperte terminologiche in `agent-memory/thai-english/MEMORY.md`.
