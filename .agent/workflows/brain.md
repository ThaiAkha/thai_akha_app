---
description: 🧠 Deep Reasoning Agent (Ollama + DeepSeek + Antigravity)
---

# Brain Workflow: Deep Reasoning & Execution

Questo workflow trasforma me (Antigravity) in un orchestratore che delega il ragionamento complesso a modelli LLM specializzati (come DeepSeek-v3 via Ollama) prima di eseguire modifiche strutturali o logiche.

## 🛠 Come Funziona
1. **Context Loading**: Leggo i file rilevanti e la documentazione del progetto.
2. **Delegation**: Invio una richiesta strutturata ad Ollama (`deepseek-v3.2:cloud` o `qwen2.5-coder:7b`).
3. **Synthesis**: Ti presento il ragionamento del "Cervello" esterno.
4. **Execution**: Se confermi, procedo con l'implementazione fisica dei file.

---

## 🚀 Comandi Disponibili

### 1. Deep Analysis (`/brain analyze [target]`)
Chiede a DeepSeek un'analisi profonda di un componente o di un bug.
// turbo-all
1. Analisi file: `view_file [percorso]`
2. Prompt Ollama: `mcp_ollama_run --name deepseek-v3.2:cloud --prompt "Analizza questo file per trovare [obiettivo]"`
3. Presentazione report.

### 2. Logic Refactor (`/brain refactor [target]`)
Suggerisce un refactoring logico complesso basato sulle best practice.
// turbo-all
1. Carica contesto: `view_file [percorso]`
2. Design del piano: `mcp_ollama_run --name deepseek-v3.2:cloud --prompt "Genera un piano di refactoring per [obiettivo]"`
3. Verifica e approvazione umana.
4. Esecuzione: `replace_file_content` o `write_to_file`.

### 3. Debugging Assistant (`/brain debug [error_log]`)
Usa i modelli locali per interpretare log di errore e suggerire fix.
// turbo-all
1. Analisi log.
2. Cross-reference con il codice.
3. Suggerimento soluzione via Ollama.

---

## ⚙️ Modelli Configurati (MCP Ollama)
- **Cervello Principale**: `deepseek-v3.2:cloud` (671B) - Per ragionamento strategico e architetturale.
- **Coder Locale**: `qwen2.5-coder:7b` - Per task di coding veloci e offline.

> [!TIP]
> Usa `/brain` quando il problema richiede più di una semplice modifica di testo, ma una vera "comprensione" architetturale del monorepo.
