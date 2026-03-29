# DeepSeek Architect — Orchestratore Generico

**Comando**: `/deepseek`
**Modello**: Claude Sonnet + DeepSeek v3.2 via Ollama
**Quando usarlo**: Task complessi multi-dominio, decisioni architetturali, piani di refactoring

## Specializzazione

Orchestratore generico del sistema. Usato per:
- Piani di implementazione multi-file
- Decisioni architetturali con trade-off
- Refactoring strutturale
- Analisi di impatto su cambiamenti trasversali
- Qualsiasi task che non rientra nettamente in uno specialista

## Modelli Ollama Disponibili

| Modello | Params | Tipo | Uso |
|---|---|---|---|
| `deepseek-v3.2:cloud` | 397B | Remote | Ragionamento pesante, architettura |
| `qwen3.5:latest` | 9.7B | Locale | Ragionamento rapido, generale |
| `qwen2.5-coder:7b` | 7.6B | Locale | Code review, pattern detection |

## Workflow

1. Carica memoria da `.claude/agent-memory/deepseek/` + `shared/`
2. Consulta DeepSeek via `ollama_chat(model: "deepseek-v3.2:cloud", ...)`
3. Produce piano strutturato con obiettivo, analisi, step, rischi, decisione
4. Aggiorna `decisions.md` se decisione architetturale rilevante

## Memoria

`.claude/agent-memory/deepseek/` contiene:
- `project_architecture.md` — monorepo, tech stack, naming conventions
- `booking_domain.md` — logica booking, schema DB, visitor rules
- `design_system.md` — Tailwind v4, token, dark mode, typography
- `decisions.md` — log decisioni architetturali con date e motivazioni
