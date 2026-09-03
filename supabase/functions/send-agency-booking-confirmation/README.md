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

## Lingue (#142, dal 2026-09-03)

- Testi in `../_shared/agencyEmailI18n.ts`, 4 lingue agenzia EN·TH·ES·ZH
  copiate dalla Consegna_142 del brain (mai ritradurre nel codice).
- Lingua della 1421_30 = `profiles.preferred_language` dell'agenzia
  (`en|th|es|zh`, default `en`, migration `20260903100000_profiles_preferred_language_142.sql`).
  Si imposta a mano: `update public.profiles set preferred_language='zh' where id='<agency uuid>';`
- La 1421_32 al cliente resta EN: la lingua del guest non e' nota al booking
  (Consegna_142, decisione 3). Per cambiarla: `buildGuestInvite(b, lang)` in index.ts.
- Orari: EN in 12h (8:15 am), le altre lingue in 24h (16:15). Date nel locale
  della lingua (th-TH mostra l'anno buddista).
- La risposta JSON riporta `results.lang` per capire quale lingua e' partita.

Deploy dopo una modifica ai testi: `supabase functions deploy send-agency-booking-confirmation`
(porta con se' `_shared/`); il reminder va ridispiegato a parte.
