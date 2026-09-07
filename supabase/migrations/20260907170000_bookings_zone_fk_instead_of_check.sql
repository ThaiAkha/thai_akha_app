-- 20260907170000_bookings_zone_fk_instead_of_check.sql
-- /database · 2026-09-07 · dal riesame del pickup (commit aeb1383 dell'altra chat, non ancora
-- deployato). Applicata su GO lo stesso giorno.
--
-- IL DIFETTO: bookings.pickup_zone e bookings.dropoff_zone erano protette da un CHECK con la
-- lista LETTERALE delle zone (green, yellow, pink, azure, outside, walk-in), accanto alla tabella
-- pickup_zones che quelle sei righe le possiede. Due copie della stessa lista: oggi allineate
-- (6 = 6, 0 orfani), domani chi aggiunge una zona in pickup_zones si vede rifiutare ogni
-- prenotazione su quella zona da un CHECK di cui non ricorda l'esistenza. Stesso male della
-- lista lingue chiuso stamattina (20260907130000).
--
-- COSA FA: sostituisce i due CHECK con due FK verso pickup_zones(id). L'insieme accettato oggi
-- e' IDENTICO (le 6 chiavi del CHECK = le 6 righe della tabella), quindi il comportamento del
-- bundle deployato non cambia: cio' che era rifiutato resta rifiutato (codice 23503 invece di
-- 23514), cio' che passava passa. `on update cascade`: se un id zona cambia, le prenotazioni
-- seguono. `on delete` resta NO ACTION: una zona con prenotazioni non si cancella. NULL resta
-- ammesso (3 prenotazioni senza zona oggi).
--
-- VERIFICATO PRIMA: 0 orfani su entrambe le colonne; gli scrittori nel codice (admin
-- LogisticInspector e useAdminBooking, front PickUpPage) scrivono id di zona o 'walk-in', mai
-- stringhe vuote; nessun handler nel codice legge il codice errore 23514 (grep). I trigger su
-- bookings non c'entrano: nessun UPDATE di righe qui, solo DDL.
--
-- NON FA: la FK su bookings.meeting_point, che aspetta il deploy del codice (20260907180000).

alter table public.bookings drop constraint if exists bookings_pickup_zone_check;
alter table public.bookings drop constraint if exists bookings_dropoff_zone_check;
alter table public.bookings
  add constraint bookings_pickup_zone_fkey foreign key (pickup_zone)
    references public.pickup_zones(id) on update cascade;
alter table public.bookings
  add constraint bookings_dropoff_zone_fkey foreign key (dropoff_zone)
    references public.pickup_zones(id) on update cascade;

-- VERIFICA DOPO (attesi):
-- select conname, contype from pg_constraint where conrelid='public.bookings'::regclass and conname ~ 'zone' order by 1;
--   -> bookings_dropoff_zone_fkey f, bookings_pickup_zone_fkey f   (nessun _check)
-- update public.bookings set pickup_zone = 'mp_airport_gate1' where booking_ref = 'TAK00103';
--   -> ERROR 23503 (nessuna riga cambia)
-- select count(*) from public.bookings where pickup_zone is null;  -> 3, invariato
-- salute A-F -> 0
