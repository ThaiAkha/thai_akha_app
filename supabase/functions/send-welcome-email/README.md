# 🥥 Edge Function: send-welcome-email

## 🎯 Scopo
Questa funzione automatizza l'invio della **Email di Benvenuto** non appena un nuovo utente si registra sull'App Thai Akha Kitchen. È progettata per dare un'accoglienza calorosa e guidare l'utente verso le prime attività (Ricette, Classi, Quiz).

## 🛠 Funzionamento
- **Trigger**: Webhook di Supabase su `Auth Signup`.
- **Logica**:
    - Riceve il payload del nuovo utente (`email`, `full_name`).
    - Compone un'email HTML brandizzata con stile Thai Akha.
- **Infrastruttura**: Utilizza l'API di **Resend** per il delivery.

## 📥 Input (Auth Webhook)
- JSON contenente `type: "user_signup"` e i dati utente in `record`.

## 📤 Output (API Resend)
- Invia l'email al destinatario impostato in `to`.

## 🔑 Secret Richiesti (Supabase)
- `RESEND_API_KEY`: API Key valida da Resend.com.

---
*Ultimo aggiornamento: Aprile 2026*
