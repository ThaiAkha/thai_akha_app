# 🥥 Edge Function: send-booking-confirmation

## 🎯 Scopo
Questa funzione è il cuore delle **Notifiche di Prenotazione**. Inviando email transazionali e ricevute a clienti, agenzie e uffici amministrativi, assicura una gestione professionale di ogni classe di cucina.

## 🛠 Funzionamento
- **Trigger**: Webhook di Supabase su Database Insert/Update nella tabella `bookings`.
- **Logica**:
    - Recupera il profilo dell'utente (Agenzia o Privato).
    - Determina il destinatario in base al metodo di pagamento (`agency_invoice` o altri).
    - Compone l'email utilizzando i template HTML in `templates.ts`.
- **Infrastruttura**: Utilizza l'API di **Resend** per il delivery.

## 📥 Input (DB Payload)
- Il record completo della tabella `bookings`.

## 📤 Output (API Resend)
- Invia in parallelo:
    - 🔔 Notifica per l'Ufficio Admin.
    - 🧾 Ricevuta B2B per l'Agenzia (se applicabile).
    - ✅ Voucher di Conferma per il Guest (con istruzioni di account se è un nuovo profilo).

## 🔑 Secret Richiesti (Supabase)
- `RESEND_API_KEY`: API Key valida da Resend.com.
- `SUPABASE_SERVICE_ROLE_KEY`: Per interrogare i profili incrociando gli ID.

---
*Ultimo aggiornamento: Aprile 2026*
