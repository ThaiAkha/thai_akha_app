# Resoconto Stato Server MCP (Model Context Protocol)
Data: 2026-03-25

Questo documento illustra lo stato attuale di connessione ai server MCP configurati per l'assistente (Antigravity/Cherry AI) e le funzionalità (tools) messe a disposizione da ciascuno. Ciascun server mappa un set di operazioni specifiche.

---

## 🟢 1. Filesystem MCP
**Stato**: 🟢 ATTIVO (Funzionante)
- **Funzionalità disponibili**: Il server è operativo e in grado di leggere il contesto locale.
  - Esplorazione cartelle: `list_directory`
  - Operazioni file: `read_text_file`, `write_file`, `edit_file`
- **Cosa posso fare**: Modificare i codici, sfogliare il progetto, scrivere nuovi file (es. questo markdown). Non ci sono problemi.

## 🟢 2. Supabase MCP
**Stato**: 🟢 ATTIVO (Funzionante)
- **Progetto attivo rilevato**: "Thai Akha Cherry 2026" (ID: `mtqullobcsypkqgdkaob`)
- **Funzionalità disponibili**: Connessione al database stabilita correttamente.
  - DB & Tabelle: `list_projects`, `list_tables`, `list_extensions`
  - SQL & Migrazioni: `execute_sql`, `apply_migration`
  - Edge Functions: `list_edge_functions`, `get_edge_function`, `deploy_edge_function`
  - Utilità: `generate_typescript_types`, `get_advisors`, `get_publishable_keys`, `search_docs`
- **Cosa posso fare**: Posso ispezionare tutta la struttura del DB, eseguire query RAW, scaricare log, eseguire test e aggiornare i tipi TypeScript.

## 🟢 3. Ollama MCP
**Stato**: 🟢 ATTIVO (Funzionante)
- **Modelli pronti rilevati**: `qwen2.5-coder:7b` (locale), `deepseek-v3.2:cloud` (remoto)
- **Funzionalità disponibili**:
  - Esecuzione modelli: `chat_completion`, `run`
  - Gestione Ollama: `list`, `show`, `pull`, `push`, `create`, `cp`, `rm`
- **Cosa posso fare**: Eseguire prompt tramite script contro il tuo Ollama locale o modelli cloud configurati.

---

## 🟢 4. Firebase MCP
**Stato**: 🟢 ATTIVO (Funzionante)
- **Account autenticato**: `admin@thaiakhakitchen.com`
- **Progetto attivo rilevato**: `thai-akha-app-2026` (alias `default`)
- **Note**: Configurato con successo il percorso del progetto. Legge correttamente il file `firebase.json` che gestisce i target di hosting per `frontend` e `admin`.
- **Funzionalità disponibili**: `get_environment`, `get_project`, `get_sdk_config`, `get_security_rules`, `list_apps`, `list_projects`, `init`, `read_resources`.
- **Cosa posso fare**: Modificare l'hosting, leggere configurazioni SDK per le app client, recuperare e aggiornare le regole di sicurezza Firestore/Storage, oltre a ispezionare tutti i progetti GCP legati.

---

## 🟢 5. NotebookLM MCP
**Stato**: 🟢 ATTIVO (Funzionante)
- **Contenuto rilevato**: Rilevati correttamente i tuoi quaderni (es. "App - Builder 2026", "Ingredients", "Supabase Recipe Category...").
- **Funzionalità disponibili**:
  - Gestione Quaderni: `notebook_list`, `notebook_create`, `notebook_query`
  - Ricerca Intensa (Deep Research): `research_start`, `research_status`, `research_import`
  - Contenuti Multimediali/Summary: `infographic_create`, estrazione testi da drive e siti integrati nel quaderno.
  - Altre funzioni su cartelle drive ed estrazione testuale raw.

## 🟢 6. Stitch MCP
**Stato**: 🟢 ATTIVO (Funzionante)
- **Progetto attivo**: "Thai Akha Cherry 2026" (Project ID: `10837334620264508705`)
- **Note**: Il progetto è stato inizializzato con successo nell'istanza Stitch di Google Cloud.
- **Funzionalità disponibili**: 
  - Architettura UI: Generata, importata e manipolata dinamicamente dal codice (`generate_screen_from_text`)
  - Gestione file di design e temi (`create_design_system`, `apply_design_system`, `list_design_systems`) 
- **Cosa posso fare**: Generare automaticamente da una descrizione testuale un intero layout, una singola schermata o componentistica complessa conformemente al nostro Design System.
