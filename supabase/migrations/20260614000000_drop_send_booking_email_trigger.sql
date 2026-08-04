-- Rimuove il trigger "Database Webhook" appeso che POSTava ogni nuovo booking alla
-- edge function send-booking-confirmation (ora eliminata). Senza la funzione, il trigger
-- generava un webhook 404 a ogni INSERT su bookings (l'insert riusciva ma niente conferma).
--
-- NOTA: la booking confirmation verrà ricostruita da zero sul nuovo pattern email.
-- Se la nuova funzione manterrà lo stesso nome (send-booking-confirmation), basterà
-- ri-deployare l'edge + ricreare un trigger equivalente (o un Database Webhook da dashboard).

drop trigger if exists "send-booking-email" on public.bookings;
