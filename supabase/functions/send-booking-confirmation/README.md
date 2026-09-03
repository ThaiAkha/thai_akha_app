# send-booking-confirmation (#172)

> ⏳ **Codice pronto, NON deployata** (2026-09-03). Il flusso email B2C del booking cliente
> non e' mai stato live: il vecchio trigger `send-booking-email` puntava a un'edge con questo
> stesso nome che non esisteva piu' ed e' stato droppato il 02/09 (#122). Deploy, secret e
> trigger sono dell'owner (runbook sotto), poi test end-to-end con un booking di prova cancellato.

Conferma automatica al **cliente** quando un booking non-agency con `status='confirmed'`
viene registrato (front thaiakha.com o console staff), piu' la **notifica interna** allo staff.
Gemella di `send-agency-booking-confirmation` (#122): stessa meccanica, stesso involucro.

## Flusso

```
Front (useBookingSubmit) o console staff (INSERT su bookings)
  -> trigger AFTER INSERT "send-booking-confirmation"
     WHEN (status='confirmed' AND booking_source NOT IN ('agency','staff_internal'))
  -> POST qui { record: { internal_id, ... } }
  -> rilegge il booking via service-role + class_sessions (orari, prezzo) + profilo cliente
  -> Resend: 142_03_B2C-01a..d al cliente · 142_03_B2C-01-Admin alla casella staff
```

- Template master: brain `148_Email_Html/1481_Email_App_ThaiAkha/1481_01_Email_Booking/142_03_B2C-01a..d`
  e `142_03_B2C-01-Admin`; testi copiati in `../_shared/b2cEmailI18n.ts` (mai ritradurre nel codice).
- Variante: Morning/Evening da `session_id`, "cash on arrival" o "paid" da `payment_status='paid'`.
- Destinatario: `guest_email` se presente (console staff), altrimenti `profiles.email` del `user_id`.
- Pickup: hotel + finestra canonica 015 (8:15-9:00 am / 4:15-5:00 pm, o `pickup_time` se c'e');
  `pickup_zone='walk-in'` o nessun hotel = arrivo in cucina; `hotel_name='Update in profile'`
  (placeholder del front finche' il cliente non sceglie) = "pickup non ancora scelto".
- Orari e prezzo per persona da `class_sessions` (niente cablato). Link menu `thaiakha.com/menu`,
  cookbook con password, cancellazione gratuita fino a 48 ore prima.
- Lingua: `profiles.preferred_language` del cliente (il front la salva al signup dalla lingua del
  sito, ridotta a en|th|es|zh). Oggi il master B2C esiste solo in EN: la risposta riporta
  `results.lang` (partita) e `results.requested_lang` (chiesta). Un pack TH/ES/ZH si aggiunge in
  `b2cEmailI18n.ts` quando la traduzione arriva dal master.
- Notifica staff: destinatario dal secret `BOOKING_NOTIFY_TO`, fallback `CONTACT_NOTIFY_TO`
  (gia' impostato per il contact form); se mancano entrambi la notifica viene saltata e detto in `results.staff`.
- Invoke manuale per test: `{ "booking_id": "<internal_id>" }` (guardia: solo booking cliente
  confermati, gli altri skip pulito). Il trigger e' asincrono (pg_net): l'INSERT non aspetta l'email.
- Non coperti (backlog, master pronti): B2C-02 reminder scelta menu, B2C-03 cancellazione, B2C-05 menu confermato.

## Runbook (esegue l'umano, su GO)

```
# 1. secret (opzionale: senza, la notifica staff usa CONTACT_NOTIFY_TO)
supabase secrets set BOOKING_NOTIFY_TO=<casella scelta dall'owner>
# 2. deploy (porta con se' _shared/)
supabase functions deploy send-booking-confirmation
# 3. trigger: applicare la migration 20260903200000_b2c_booking_emails_172.sql (sezione 1)
#    via MCP apply_migration o SQL editor; poi la migration resta come copia versionata
# 4. test end-to-end: booking di prova dal front (status confirmed) -> conferma + notifica
#    ricevute -> cancellare la riga di prova (delete from bookings where internal_id = ...)
```
