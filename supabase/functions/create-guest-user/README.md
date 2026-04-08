# 🥥 Edge Function: create-guest-user

## 🎯 Scopo
Questa funzione gestisce la **Creazione di Account Guest** per gli ospiti che non hanno ancora un profilo completo. È progettata per garantire che ogni transazione (come una prenotazione) sia legata a un'identità nel sistema, senza forzare la procedura di onboarding classica.

## 🛠 Funzionamento
- **Protocollo**: REST (POST)
- **Logica**: Utilizza `admin.createUser` per bypassare la conferma email classica (l'utente viene immediatamente attivato).
- **Gestione Duplicati**: Se l'email è già registrata, la funzione recupera l'ID esistente e lo restituisce, evitando errori e garantendo la coerenza dei dati.
- **Profilazione**: Dopo la creazione dell'auth, la funzione crea un profilo nella tabella `profiles` con il ruolo `guest`.

## 📥 Input (JSON)
- `email`: Email dell'utente.
- `password`: Password temporanea.
- `fullName`: Nome completo.
- `phone`: Numero di telefono.

## 📤 Output (JSON)
- `userId`: L'ID univoco dell'utente creato (o trovato).
- `isNew`: (Opzionale) `false` se l'utente esisteva già.

## 🔑 Secret Richiesti (Supabase)
- `SUPABASE_SERVICE_ROLE_KEY`: Richiesto per le operazioni admin (`createUser`).

---
*Ultimo aggiornamento: Aprile 2026*
