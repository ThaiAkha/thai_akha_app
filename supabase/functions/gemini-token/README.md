# 🥥 Edge Function: gemini-token

## 🎯 Scopo
Questa funzione genera un **Ephemeral Token** (token effimero) per l'API Google Gemini Live. È il cuore della sicurezza di **Cherry AI**, permettendo al frontend di connettersi via WebSocket senza esporre la `GEMINI_API_KEY` master.

## 🛠 Funzionamento
- **Protocollo**: REST (POST/GET)
- **Modello**: Riceve richieste da `useGeminiLive.ts`.
- **Auth**: Opzionale. Se l'utente è loggato, il suo ID viene loggato. Se è un ospite, viene trattato come `guest`.
- **Validità**: Il token generato vale per una singola sessione WebSocket (max 30 minuti).

## 📥 Input (Headers)
- `Authorization`: (Opzionale) Bearer JWT di Supabase Auth.

## 📤 Output (JSON)
- `ephemeralToken`: Stringa con il nome del token generato (es: `providers/google/tokens/...`).

## 🔑 Secret Richiesti (Supabase)
- `GEMINI_API_KEY`: API Key valida da Google AI Studio.

---
*Ultimo aggiornamento: Aprile 2026*
