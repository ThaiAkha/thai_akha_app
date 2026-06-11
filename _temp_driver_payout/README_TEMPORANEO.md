# ⚠️ SOLUZIONE TEMPORANEA — Iniezione manuale payout driver

**Cos'è.** Un bypass del sistema booking. Finché i booking non guidano il payout, il driver dichiara a mano il servizio (data, classe, n° hotel, pax) e il payout viene scritto direttamente in `driver_payments`. Da lì partono email di conferma e report settimanali.

## Stato attuale (2026-06-11)

- ✅ **Operativo end-to-end.** Migrazione DB applicata, form "Dichiara servizio" attivo in `DriverHome`, RPC testata e sicura.
- ✉️ **Email in degradazione graziosa.** L'invio è in `try/catch`: se la function non è deployata / il dominio Resend non consegna, il payout viene comunque salvato e il driver vede *"Payout salvato (email non disponibile)"*. Quando email + deploy sono pronti, la conferma parte da sola **senza modifiche al frontend**.
- ⏳ **Report settimanale rimandato.** Si costruisce quando le email consegnano. Il job `weekly_driver_payouts` esistente continua a girare, non toccato.
- 🔧 **Lato utente:** dominio Resend/secret/webhook + `supabase functions deploy send-driver-payout-confirmation`.

**Perché è temporanea.** Quando il sistema booking tornerà la fonte di verità, il payout sarà di nuovo calcolato in automatico da `calculate_driver_payout` (che legge i `bookings`). Questo bypass va allora **rimosso**.

**Come riconoscere i dati del bypass.** Ogni record iniettato a mano ha `driver_payments.source = 'manual'`. I record normali (da booking) hanno `source = 'auto'`. Così li distingui e ripulisci senza ambiguità.

---

## Tornare al punto attuale (rollback) — 3 livelli

### 1. Database
Esegui `rollback.sql`:
- elimina i payout `source='manual'` (opzionale: salta se vuoi tenerli nello storico),
- rimuove la RPC `inject_driver_payout_manual`,
- rimuove la colonna `source`.

Dopo, il DB è identico a oggi.

### 2. App (package `admin`)
- Rimuovi i **tab + viste** aggiunti in `pages/driver/DriverHome.tsx` — marcati col commento `// BYPASS-PAYOUT (temporaneo)`.
- Elimina i componenti `pages/driver/DriverPayoutForm.tsx` e `pages/driver/DriverPayoutDashboard.tsx`.
- Elimina l'edge function `supabase/functions/send-driver-payout-confirmation`.
- Disattiva/elimina lo **scheduled task** del report settimanale (quando esisterà; il job `weekly_driver_payouts` esistente non va toccato).
- Rigenera `packages/shared/src/types/database.types.ts` (sparisce la colonna `source`).

### 3. File di supporto
- Elimina l'intera cartella `_temp_driver_payout/`.

---

## Sicurezza Git (consigliato)

Prima di iniziare l'implementazione, crea un punto di ripristino pulito:

```bash
git checkout -b feature/driver-payout-bypass
git add -A && git commit -m "checkpoint: pre-bypass payout driver"
```

Così tornare al punto attuale è immediato:

```bash
git checkout main          # l'app torna esattamente a com'è oggi
git branch -D feature/driver-payout-bypass   # se vuoi scartare tutto
```

Il rollback del **database** (sopra) va comunque eseguito a parte: Git non versiona lo stato di Supabase.

---

## Regole d'oro
- **Mai muovere denaro reale in automatico.** Il sistema *prepara* payout e report; il pagamento lo conferma ed esegue una persona.
- I record `paid` non sono modificabili dal form (la RPC li blocca).
- Le tariffe restano in `driver_payout_tiers` (unica fonte di verità), non hardcodate nell'app.
