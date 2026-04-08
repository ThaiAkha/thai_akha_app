# 🥥 Edge Function: create-guest (Legacy)

## 🎯 Scopo
Questa funzione gestisce la **Creazione di Account Guest** tramite `auth.admin.createUser`. È la versione precedente di `create-guest-user`, mantenuta per retrocompatibilità.

## 🛠 Funzionamento
- **Protocollo**: REST (POST)
- **Logica**: Utilizza `admin.createUser` con `email_confirm: true`.

## 📥 Input (JSON)
- `email`: Email dell'utente.
- `password`: Password temporanea.
- `fullName`: Nome completo.

## 🛑 Status
- **DEPRECATA**: Utilizzare `create-guest-user` per nuove implementazioni, poiché questa funzione non gestisce in modo pulito i conflitti di account già esistenti.

---
*Ultimo aggiornamento: Aprile 2026*
