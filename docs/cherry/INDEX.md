# 🥥 Cherry AI System Documentation (v2.1)

Benvenuto nella documentazione tecnica autoritativa di **Cherry**, l'assistente virtuale di **Thai Akha Kitchen**. Questo sistema implementa un'architettura **Static RAG** ibrida (Testo + Multimodal Voice) per offrire un'esperienza utente premium, sicura e culturalmente autentica.

---

## 📂 System Architecture Overview

La documentazione è suddivisa in tre aree principali: **Knowledge Base**, **Client & Hooks (UI Layer)**, e **Core Services (Infrastructure)**.

### 🧠 I. Knowledge Base (Master RAG)
Questi file contengono la conoscenza statica ed esperta su cui si basa Cherry. Ogni file Markdown è una copia conforme del codice sorgente `.ts` dei sub-agenti.

1.  **[01-identity.md](./system_files/01-identity.md)**: La voce, il tono e le "Chef's Rules" di Cherry.
2.  **[02-spices-allergies.md](./system_files/02-spices-allergies.md)**: Protocolli di sicurezza alimentare e livelli di piccantezza.
3.  **[03-recipes.md](./system_files/03-recipes.md)**: Il ricettario ufficiale Akha Kitchen 2026.
4.  **[04-akha-history.md](./system_files/04-akha-history.md)**: Curiosità storiche e tradizioni del popolo Akha.
5.  **[05-classes-booking.md](./system_files/05-classes-booking.md)**: Info logistiche, prezzi e assistenza prenotazioni.
6.  **[06-examples.md](./system_files/06-examples.md)**: Esempi di conversazione (Few-shot prompting).
7.  **[cherryPrompt.md](./system_files/cherryPrompt.md)**: Il compilatore finale che unisce tutti i sub-agenti sopra citati.

### 🎬 II. UI Architecture & Logic
Componenti e Hook che gestiscono l'interfaccia utente.

8.  **[ChatBox.md](./system_files/ChatBox.md)**: L'interfaccia React unificata (Testo + Voce).
9.  **[useCherryChat.md](./system_files/useCherryChat.md)**: Logica di stato per la chat testuale (History Window = 3).
10. **[useGeminiLive.md](./system_files/useGeminiLive.md)**: Orchestrazione audio per la modalità voce (Gemini Multimodal Live).
11. **[audio-processor.md](./system_files/audio-processor.md)**: Elaborazione PCM a 1024 campioni (WebSocket optimization).

### 🛠️ III. Core Services & Infrastructure
Servizi di basso livello per connettività e persistenza.

12. **[ai.service.md](./system_files/ai.service.md)**: Proxy sicuro per le chiamate API Gemini (No-Key-Exposure).
13. **[chatSession.service.md](./system_files/chatSession.service.md)**: Persistenza database, sessioni guest e rate-limiting.
14. **[geminiClient.md](./system_files/geminiClient.md)**: Gestione degli Ephemeral Token per il WebSocket Live.

### 📜 IV. History & Evolutions
15. **[MIGRATION_v2.0.md](./system_files/MIGRATION_v2.0.md)**: Note sulla transizione da Dynamic a Static RAG.

---

## 🚀 Performance Optimizations (Cherry 2.1)

| Feature | Optimization | Result |
|---|---|---|
| **Audio Buffer** | Increased to 1024 samples | -50% WebSocket traffic, lower CPU load. |
| **Chat History** | HISTORY_WINDOW = 3 messages | -40% Input tokens, faster TTFB. |
| **RAG Protocol** | 100% Static Sync (Synchronous) | Zero latency on prompt building, no Supabase dependency. |
| **Security** | Ephemeral JWT for WebSockets | Safe real-time audio streams without key exposure. |

---

> [!IMPORTANT]
> Tutti i file Markdown in questa cartella sono mantenuti in sincronia 1:1 con il codice sorgente. Se modifichi la logica di Cherry, aggiorna immediatamente il file `.md` corrispondente.
