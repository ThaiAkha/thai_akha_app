# send-agency-booking-confirmation (#122)

> ✅ LIVE dal 2026-09-02. Test end-to-end riuscito (POST 200, conferma + invito
> cliente ricevuti, riga di prova cancellata).

Conferma automatica all'agenzia quando un booking `booking_source='agency'`
con `status='confirmed'` viene registrato. Sostituisce il vecchio trigger
`send-booking-email` (droppato: puntava a un'edge che non esisteva piu').

## Flusso

```
Portale agenzie (INSERT su bookings)
  -> trigger AFTER INSERT "send-agency-booking-confirmation"
     WHEN (booking_source='agency' AND status='confirmed')
  -> POST qui { record: { internal_id, ... } }
  -> rilegge il booking via service-role + profilo agency (email, nome)
  -> Resend: 1421_30 all'agenzia · se guest_email presente anche 1421_32 al cliente
```

- Template master: brain `142_Email_Flow/1421_Email_Agencies/1421_30` e `1421_32`.
- From: office@thaiakhakitchen.com (dominio verificato Resend).
- Invoke manuale per test: `{ "booking_id": "<internal_id>" }` (guardia: solo
  booking agency confermati, gli altri skip pulito).
- Migration trigger: `20260902260000_agency_emails_122.sql`.
- Pickup: `pickup_time` del booking se presente, altrimenti finestre canoniche
  015 (morning 8:15-9:00 am, evening 4:15-5:00 pm); senza hotel_name si
  presenta l'arrivo in cucina.
