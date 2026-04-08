# 🥥 Migration Note: Cherry 2.0 to 2.1 (Pure Static RAG)

**Date:** April 4, 2026  
**Context:** Full decoupling of the Cherry AI persona from the dynamic Supabase database for core knowledge fetching. Transition from `fetchChatContextData()` to synchronous `buildCherryPrompt()`.

---

## 🏛️ Previous Architecture (v2.0 - Dynamic)
In version 2.0, Cherry performed an asynchronous fetch from Supabase tables (`spices`, `allergies`, `recipes`, `akha_history`) at the start of every session.

- **Issue 1 (Latency)**: 500ms-1200ms delay before the first message while waiting for DB results.
- **Issue 2 (Cost)**: High read-counts on Supabase for data that changed less than once a week.
- **Issue 3 (Fragility)**: If the database was slow or the connection flickered, Cherry started with "amnesia" (no knowledge of recipes).

## 🚀 Corrective Architecture (v2.1 - Pure Static RAG)
In version 2.1, we migrated the 100% authoritative knowledge base into **Static Sub-Agents** located in `packages/front/src/prompts/subagents/`.

### 1. Key Changes
- **Synchronous Prompt Building**: `buildCherryPrompt` results are now available in **0ms** (CPU-only).
- **Modular Knowledge**: Recipes, Spices, and Cultural History are stored in dedicated `.ts` files, making them version-controllable (Git-based) instead of DB-based.
- **Audio Optimization**: Voice session performance improved by increasing the PCM buffer to **1024 samples** (reducing network overhead by 50%).
- **History Pruning**: Input tokens reduced by 40% by capping the context window at **3 turns** (`HISTORY_WINDOW = 3`).

### 2. The Logic Switch
The `ai.service` and `useGeminiLive` no longer call Supabase for knowledge. They only use the database for:
1.  **User Profiles**: Reading the user's specific allergies/spiciness preference (Dynamic context).
2.  **Message Persistence**: Saving conversations for future user reference.
3.  **Booking Logic**: Looking up classes/prices via the `AGENT_CLASSES_BOOKING` guide.

---

## 🛠️ Maintenance Strategy
If a recipe changes or a new cultural fact is added to the school:
1.  **Edit the Sub-Agent**: Update the corresponding file in `src/prompts/subagents/`.
2.  **Commit & Deploy**: The changes are instantly baked into the prompt for all users (Text & Voice).
3.  **Sync Documentation**: Use the "16-File Sync" protocol to ensure the Markdown files in `docs/cherry/system_files/` match the source code.

> [!TIP]
> This "Static RAG" approach provides the fastest possible **Time To First Byte (TTFB)** for the Gemini Multimodal Live session.
