# MCP Servers Configuration - Thai Akha Kitchen

**Data**: 2026-04-06  
**File**: `~/.gemini/antigravity/mcp_config.json`  
**Stato**: ✅ Tutti i server attivi e configurati correttamente

---

## 📊 Riepilogo Generale

| # | Server | Stato | Tool Abilitati | Tool Disabilitati |
|:---|:---|:---|:---|:---|
| 1 | **notebooklm** | 🟢 Attivo | Lista predefinita | 14 |
| 2 | **supabase-mcp-server** | 🟢 Attivo | Lista predefinita | 16 |
| 3 | **StitchMCP** | 🟢 Attivo | Lista predefinita | 5 |
| 4 | **ollama** | 🟢 Attivo | **Tutti** | 0 |
| 5 | **filesystem** | 🟢 Attivo | Lista predefinita | 10 |
| 6 | **firebase-mcp-server** | 🟢 Attivo | Lista predefinita | 6 |

**Totale server attivi**: 6  
**Totale tool disabilitati**: 51

---

## 🟢 1. NotebookLM MCP

**Comando**: `/Users/svevomondino/.local/bin/notebooklm-mcp`  
**Stato**: 🟢 ATTIVO

### Tool disabilitati (14)
- `notebook_delete`
- `notebook_rename`
- `chat_configure`
- `studio_status`
- `studio_delete`
- `mind_map_create`
- `data_table_create`
- `quiz_create`
- `flashcards_create`
- `report_create`
- `slide_deck_create`
- `video_overview_create`
- `audio_overview_create`
- `source_delete`

### Tool abilitati (tutti gli altri)
- `notebook_list` ✅
- `notebook_create` ✅
- `notebook_add_source` ✅
- `notebook_query` ✅
- `source_list` ✅
- `source_add` ✅
- `source_add_url` ✅
- `source_add_text` ✅
- `chat_session_create` ✅
- `chat_send_message` ✅

---

## 🟢 2. Supabase MCP Server

**Comando**: `npx -y @supabase/mcp-server-supabase@latest`  
**Progetto**: `mtqullobcsypkqgdkaob` (Thai Akha Cherry 1.0)  
**Stato**: 🟢 ATTIVO

### Tool disabilitati (16)
- `rebase_branch`
- `reset_branch`
- `merge_branch`
- `delete_branch`
- `list_branches`
- `create_branch`
- `list_migrations`
- `get_logs`
- `pause_project`
- `restore_project`
- `create_project`
- `get_project`
- `get_cost`
- `confirm_cost`
- `list_organizations`
- `get_organization`

### Tool abilitati (tutti gli altri)
- `execute_sql` ✅
- `apply_migration` ✅
- `list_tables` ✅
- `list_extensions` ✅
- `list_edge_functions` ✅
- `get_edge_function` ✅
- `deploy_edge_function` ✅
- `generate_typescript_types` ✅
- `get_advisors` ✅
- `get_publishable_keys` ✅
- `search_docs` ✅

---

## ⚪ 3. Stitch MCP (Google)

**Comando**: `npx -y mcp-remote https://stitch.googleapis.com/mcp`

**Stato (verificato 2026-08-05)**: ⚪ **NON CONFIGURATO**. La riga diceva 🟢 ATTIVO, ma non lo era: nessuna config MCP di questa macchina referenzia Stitch (controllati `~/.claude.json`, `~/.claude/settings.json`, la config di Claude Desktop e il `.mcp.json` del repo), e il server non compare tra quelli attivi in sessione. L'elenco di tool qui sotto descrive com'era configurato, non com'e' adesso.

**API Key**: tolta da questo file il 2026-08-04, perche' in chiaro bloccava il push (GitHub secret scanning la classifica *GCP API Key Bound to a Service Account*). La chiave di allora e' stata **cancellata il 2026-08-05** ed e' morta.

Le chiavi Stitch **non si creano a mano**: Stitch se le genera da solo quando ci si collega, nel progetto Google `effortless-snowfall-tb7dx` (numero `1032008173202`), col nome `Auto-generated Stitch API Key`. Per questo stanno in un progetto dal nome autogenerato e non tra i progetti Thai Akha.

Dove guardare: `https://console.cloud.google.com/apis/credentials?project=effortless-snowfall-tb7dx`
Da riga di comando: `gcloud services api-keys list --project=effortless-snowfall-tb7dx`

Se un domani si riattiva questo MCP, la chiave nuova va nella config MCP locale e **mai** in repo.

### Tool disabilitati (5)
- `generate_variants`
- `edit_screens`
- `get_screen`
- `list_screens`
- `list_projects`

### Tool abilitati (tutti gli altri)
- `generate_screen_from_text` ✅
- `create_design_system` ✅
- `apply_design_system` ✅
- `list_design_systems` ✅
- `get_design_system` ✅
- `update_design_system` ✅

---

## 🟢 4. Ollama MCP

**Comando**: `ollama-mcp-server`  
**Endpoint**: `http://127.0.0.1:11434`  
**Stato**: 🟢 ATTIVO

### Modelli disponibili

| Modello | Dimensione | Uso |
|:---|:---|:---|
| `qwen2.5-coder:7b` | 4.7 GB | Task veloci, fix semplici |
| `qwen2.5-coder:14b` | 9.0 GB | Refactoring complessi, architettura |
| `translategemma:12b` | 8.1 GB | Traduzioni EN↔TH e 55+ lingue |

**Totale modelli**: 3  
**Spazio totale**: ~22 GB

### Tool disabilitati: **NESSUNO** (tutti abilitati)

### Tool disponibili
- `chat_completion` ✅
- `run` ✅
- `list` ✅
- `show` ✅
- `pull` ✅
- `push` ✅
- `create` ✅
- `cp` ✅
- `rm` ✅

---

## 🟢 5. Filesystem MCP

**Comando**: `npx -y @modelcontextprotocol/server-filesystem`  
**Directory consentita**: `/Users/svevomondino/Desktop/thaiakha-cherry-2026`  
**Stato**: 🟢 ATTIVO

### Tool disabilitati (10)
- `read_media_file`
- `create_directory`
- `move_file`
- `list_directory_with_sizes`
- `directory_tree`
- `search_files`
- `get_file_info`
- `list_allowed_directories`
- `read_file`
- `read_multiple_files`

⚠️ **Nota**: Molti tool di lettura sono disabilitati. Per abilitarli, rimuovere dalla lista `disabledTools`.

### Tool abilitati
- `write_file` ✅
- `edit_file` ✅
- `list_directory` ✅
- `delete_file` ✅

---

## 🟢 6. Firebase MCP Server

**Comando**: `npx -y firebase-tools@latest mcp`  
**Stato**: 🟢 ATTIVO

### Tool disabilitati (6)
- `developerknowledge_search_documents`
- `firebase_create_android_sha`
- `firebase_create_app`
- `firebase_create_project`
- `firebase_login`
- `firebase_logout`

### Tool abilitati
- `firebase_get_projects` ✅
- `firebase_get_apps` ✅
- `firebase_get_config` ✅
- `firebase_get_hosting` ✅
- `firebase_get_functions` ✅
- `firebase_get_firestore` ✅
- `firebase_get_storage` ✅
- `firebase_get_remote_config` ✅
- `firebase_get_analytics` ✅
- `firebase_get_crashlytics` ✅
- `firebase_get_performance` ✅
- `firebase_get_authentication` ✅
- `firebase_get_extensions` ✅

---

## 📝 Note Operative

### Per NotebookLM
- ✅ Puoi creare notebook (`notebook_create` abilitato)
- ✅ Puoi aggiungere fonti (`notebook_add_source` abilitato)
- ✅ Puoi listare notebook (`notebook_list` abilitato)
- ✅ Puoi interrogare (`notebook_query` abilitato)

### Per Filesystem
- ⚠️ **Lettura file disabilitata** (`read_file` è in disabledTools)
- Per leggere file, usa altri MCP o modifica configurazione

### Per Ollama
- ✅ Tutti i tool sono abilitati
- ✅ Supporto completo per Qwen 14B, Qwen 7B e TranslateGemma 12B
- ✅ Traduzioni EN↔TH e 55+ lingue disponibili localmente

---

## 🚀 Novità

### TranslateGemma:12b aggiunto il 2026-04-06
- Modello specializzato per traduzioni
- Supporto 55+ lingue
- Ideale per: traduzione dump database, UI strings, documentazione
- Comando: `ollama run translategemma:12b "Translate to Thai: ..."`

---

## 🔄 Ultimo Aggiornamento

**Data**: 2026-04-06  
**File salvato**: `~/.gemini/antigravity/mcp_config.json`  
**Backup consigliato**: `cp ~/.gemini/antigravity/mcp_config.json ~/.gemini/antigravity/mcp_config.json.backup`

### Modifiche recenti
- ✅ Aggiunto TranslateGemma:12b ai modelli Ollama
- ✅ Aggiornata lista modelli con dimensioni e usi
- ✅ Corretta formattazione liste

---

## ✅ Stato Generale

**Tutti i 6 server MCP sono operativi e pronti per l'uso in Antigravity.**

### Modelli Ollama disponibili
- `qwen2.5-coder:7b` - Task veloci
- `qwen2.5-coder:14b` - Refactoring complessi
- `translategemma:12b` - Traduzioni professionali

**Pronto per backup, traduzioni e sviluppo multi-lingua!** 🎉