# send-booking-reminder (#172)

> ⏳ **Codice pronto, NON deployata** (2026-09-03). Deploy, secret, config e cron sono
> dell'owner (runbook sotto).

Promemoria al **cliente** B2C circa 24 ore prima della classe (template `142_03_B2C-06`).
Gemella di `send-agency-reminder` (#122): pg_cron orario → tick in `private` → `net.http_post`
con header `x-booking-cron-secret` → questa edge invia e marca `bookings.reminder_sent_at`.

## Decisioni (/booking, 2026-09-03)

- **24 ore, non 48**: il testo del master dice "tomorrow"; il "48h" nel titolo era un residuo.
  La tick prende le classi tra 12 e 24 ore (ora di Bangkok): finestra larga, un tick perso non
  perde il reminder; l'idempotenza per riga (`reminder_sent_at`) evita i doppi invii.
- **Va a tutti**, non solo a chi ha il pickup: con hotel = orario pickup e cartello; senza =
  "vieni in cucina alle 9:00 am"; con `hotel_name='Update in profile'` (pickup mai scelto) =
  invito a sceglierlo nell'account o venire in cucina. Il master diceva "non inviare senza
  pickup": aggiornato, perche' indirizzo, mappa e riga thai per il tassista servono proprio a chi arriva da solo.
- Nome del driver non stampato: `pickup_driver_uid` e' assegnato dal front al primo driver
  della tabella, non e' una scelta reale.
- `reminder_sent_at` e' la stessa colonna del reminder agenzia: un booking e' o agency o cliente.

## Runbook (esegue l'umano, su GO)

```
# 1. secret
supabase secrets set BOOKING_REMINDER_CRON_SECRET=<stringa lunga casuale>
# 2. deploy (verify_jwt: la tick non manda JWT -> deployare con --no-verify-jwt come send-agency-reminder,
#    l'autenticazione e' il secret nell'header)
supabase functions deploy send-booking-reminder --no-verify-jwt
# 3. migration 20260903200000_b2c_booking_emails_172.sql (sezioni 2 e 3: config, tick, cron)
# 4. riga di config (il secret NON sta nel repo):
insert into private.booking_reminder_config (id, enabled, edge_url, cron_secret)
values (true, true, 'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-booking-reminder', '<lo stesso secret>')
on conflict (id) do update set edge_url = excluded.edge_url, cron_secret = excluded.cron_secret, enabled = true;
# 5. test: booking di prova con booking_date = domani e status confirmed, poi
select private.booking_reminder_tick();   -- entro pochi secondi arriva l'email, reminder_sent_at valorizzato
# 6. cancellare la riga di prova
```
