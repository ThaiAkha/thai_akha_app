# Cherry AI - System Documentation Index

Welcome to the internal documentation of the Cherry AI ecosystem (Voice & Text) for **Thai Akha Kitchen 2026**.

## Architecture Overview

The system is built as a hybrid real-time communication stack:
1. **Text Engine**: `useCherryChat` + `sendChatMessageProxy` (ai.service) -> Edge Function `gemini-proxy-chat`
2. **Voice Engine**: `useGeminiLive` + `getLiveGeminiClient` (geminiClient) -> Gemini 2.5 Flash Native Audio Live WebSocket
3. **System Prompt**: `cherryPrompt.ts` assembla 6 sub-agenti modulari con blocco utente dinamico
4. **Audio Pipeline**: `audio-processor.js` (AudioWorklet) cattura PCM 16kHz senza bloccare il main thread
5. **Persistenza**: `chatSession.service.ts` gestisce sessioni, messaggi e rate limiting su Supabase

---

## File di Documentazione

### Hook (Front)

| File | Sorgente | Descrizione |
|---|---|---|
| [useCherryChat.md](useCherryChat.md) | `packages/front/src/hooks/useCherryChat.ts` | Chat testuale: sessioni Supabase, rate limiting, bridge voice, auto-summary |
| [useGeminiLive.md](useGeminiLive.md) | `packages/front/src/hooks/useGeminiLive.ts` | Voice realtime: WebSocket, AudioWorklet, trascrizioni live, onTurnComplete bridge |

### Componenti UI (Front)

| File | Sorgente | Descrizione |
|---|---|---|
| [ChatBox.md](ChatBox.md) | `packages/front/src/components/chat/ChatBox.tsx` | Widget chat floating: FAB, pannello, toggle voice, live transcription, input |
| [Message.md](Message.md) | `packages/front/src/components/chat/Message.tsx` | Bubble singolo messaggio (standalone, non usato da ChatBox) |
| [LoadingIndicator.md](LoadingIndicator.md) | `packages/front/src/components/chat/LoadingIndicator.tsx` | Tre dot animati (standalone, non usato da ChatBox) |

### Servizi (Front)

| File | Sorgente | Descrizione |
|---|---|---|
| [geminiClient.md](geminiClient.md) | `packages/front/src/services/geminiClient.ts` | Client Gemini Live con token efimeri da Edge Function |

### Servizi (Shared)

| File | Sorgente | Descrizione |
|---|---|---|
| [ai.service.md](ai.service.md) | `packages/shared/src/services/ai.service.ts` | Proxy chat testuale verso Edge Function `gemini-proxy-chat` |
| [chatSession.service.md](chatSession.service.md) | `packages/shared/src/services/chatSession.service.ts` | Sessioni, messaggi, rate limiting (VIP / loggato / guest) su Supabase |

### Prompt e Sub-Agenti (Front)

| File | Sorgente | Descrizione |
|---|---|---|
| [cherryPrompt.md](cherryPrompt.md) | `packages/front/src/prompts/cherryPrompt.ts` | Compiler del system prompt: assembla 6 sub-agenti + blocco utente dinamico |
| [01-identity.md](01-identity.md) | `subagents/01-identity.ts` | Persona Cherry, Golden Rules, firma "kha" |
| [02-spices-allergies.md](02-spices-allergies.md) | `subagents/02-spices-allergies.ts` | 5 livelli spiciness, regole allergie e sostituzioni |
| [03-recipes.md](03-recipes.md) | `subagents/03-recipes.ts` | 11 piatti, Akha Trinity, regole anti-hallucination |
| [04-akha-history.md](04-akha-history.md) | `subagents/04-akha-history.ts` | Heritage culturale Akha |
| [05-classes-booking.md](05-classes-booking.md) | `subagents/05-classes-booking.ts` | Classi, prezzi, pickup zones |
| [06-examples.md](06-examples.md) | `subagents/06-examples.ts` | Few-shot patterns |

### Audio

| File | Sorgente | Descrizione |
|---|---|---|
| [audio-processor.md](audio-processor.md) | `packages/front/public/audio-processor.js` | AudioWorkletProcessor: buffer 512 campioni, PCM Float32, 16kHz |

### Deprecati

| File | Stato |
|---|---|
| [cherry-core-knowledge.md](cherry-core-knowledge.md) | DEPRECATO — sorgente eliminato, contenuto migrato ai sub-agenti 01-06 |

---

## Interazione tra i moduli

```
ChatBox
  |
  |-- useCherryChat (testo)
  |     |-- sendChatMessageProxy (ai.service) --> Edge Function gemini-proxy-chat
  |     |-- getOrCreateSession / saveMessage (chatSession.service) --> Supabase
  |     |-- buildCherryPrompt (cherryPrompt) --> 6 sub-agenti
  |
  |-- useGeminiLive (voce) [onTurnComplete -> addVoiceMessages -> useCherryChat]
        |-- getLiveGeminiClient (geminiClient) --> Edge Function gemini-token --> Gemini Live WS
        |-- audio-processor.js (AudioWorklet) --> PCM 16kHz --> sendRealtimeInput
        |-- buildCherryPrompt (cherryPrompt) --> stesso prompt del testo
```

*Ultimo aggiornamento indice: 07 Apr 2026*
