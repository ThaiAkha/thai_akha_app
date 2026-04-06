# 🍒 Cherry AI - System Documentation Interface

Welcome to the internal documentation of the Cherry AI ecosystem (Voice & Text) for **Thai Akha Kitchen 2026**.

## 🏗️ Architecture Overview

The system is built as a hybrid real-time communication stack:
1.  **Text Engine**: Uses `useCherryChat` with `gemini-3-flash-preview` (REST API) and Supabase for session persistence.
2.  **Voice Engine**: Powered by **Gemini 2.5 Flash Native Audio** via `useGeminiLive` (Live/WebSocket API).
3.  **Core Intelligence**: Managed by `cherryPrompt.ts` (System Instruction logic).
4.  **Audio Pipeline**: Low-latency sampling using `audio-processor.js` (Web Audio API).

---

## 📂 System Files Catalog

| Category | File | Description |
| :--- | :--- | :--- |
| **Logic** | [cherryPrompt.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/cherryPrompt.md) | **[Updated]** The "Brain": System instructions, personality, and **Context Caching**. |
| **Service**| [geminiClient.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/geminiClient.md) | **[Updated 2026-04-06]** Dual-client factory: `getTextGeminiClient()` (REST) + `getLiveGeminiClient()` (ephemeral tokens). |
| **Hooks** | [useCherryChat.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/useCherryChat.md) | **[Updated 2026-04-06]** Text chat: `gemini-3-flash-preview` (REST API). Main controller for history & DB. |
| **Hooks** | [useGeminiLive.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/useGeminiLive.md) | **[Updated 2026-04-06]** Voice chat: `gemini-2.5-flash-native-audio` (Live WebSocket). Decoupled from text engine. |
| **UI** | [ChatBox.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/ChatBox.md) | **[Optimized]** Monolithic UI with **Jank-Free Smart Scroll** + responsive mobile button. |
| **Audio** | [audio-processor.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/audio-processor.md) | **[Stable]** Web Audio API worklet: 16kHz PCM Int16 microphone input. |
| **Changelog** | [MIGRATION_v2.0.md](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/docs/cherry/system_files/MIGRATION_v2.0.md) | **[NEW 2026-04-06]** Model migration log, bug fixes, architecture decisions. |

---

## 🔄 Interaction Diagram

\`\`\`mermaid
graph TD
    User([User]) <--> ChatBox
    ChatBox -- "onTurnComplete" --> useCherryChat
    ChatBox <--> useGeminiLive
    useCherryChat -- "saveMessage" --> Supabase[(Supabase DB)]
    useGeminiLive -- "Unified Prompt" --> geminiClient[geminiClient Singleton]
    useCherryChat -- "Unified Prompt" --> geminiClient
    geminiClient <--> GeminiAPI[Gemini 3 Flash API]
    useGeminiLive --- AudioAPI[Web Audio API]
    AudioAPI --- AudioProcessor[audio-processor.js]
    useCherryChat --- Prompt[cherryPrompt.ts Context]
    useGeminiLive --- Prompt
\`\`\`

---

## 🛠️ Maintenance Notes (v2.0 — Model Migration)

**2026-04-06 — Production Model Migration**:
- ✅ **Text Chat**: Migrated to `gemini-3-flash-preview` (REST API) — more capable than gemini-pro
- ✅ **Voice Chat**: Migrated to `gemini-2.5-flash-native-audio` (Live WebSocket) — production-stable
- ✅ **Dual Clients**: `getTextGeminiClient()` (direct API key) vs `getLiveGeminiClient()` (ephemeral tokens via Supabase)
- ⚙️ **Bug Fixes**: Fixed stale closure in voice transcription, explicit error on chat init failure

**Architecture**:
- **The "Bridge" Pattern**: Unified persistence where `useGeminiLive` notifies `useCherryChat` to save transcripts
- **Context Data Caching**: Database lookups (recipes/classes) cached for 5 minutes in `cherryPrompt.ts`
- **Smart Scroll**: The `ChatBox` only auto-scrolls for new *complete* messages, ignoring live chunks
- **Static Greeting**: Initial "Sawasdee kha!" is UI-only to save prompt tokens

**Roadmap (Future)**:
- 📅 **June 2026+**: Evaluate `gemini-3.1-flash-live` (2x conversation memory, improved audio quality)

*Last Index Update: 06 Apr 2026 (Model Migration v2.0)*
