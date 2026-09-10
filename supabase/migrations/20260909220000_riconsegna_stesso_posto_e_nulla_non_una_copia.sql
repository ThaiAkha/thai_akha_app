-- ─────────────────────────────────────────────────────────────────────────────
-- "Stesso posto del ritiro" si scrive NULL, non copiando l'hotel.
--
-- Misurato il 2026-09-09 su tutte e 62 le prenotazioni:
--   40  `dropoff_hotel` e' una COPIA IDENTICA di `hotel_name`
--   17  `dropoff_hotel` e' NULL, che e' la forma giusta di "stesso posto"
--    5  destinazione davvero diversa (4 agenzia verso l'aeroporto, 1 hotel diverso)
--
-- La copia nasce alla creazione: `useAdminBooking.ts:353` scrive
-- `dropoff_hotel: hotel?.name || hotelSearchQuery || null` insieme al ritiro. Da li'
-- ogni prenotazione fatta dalla console porta la destinazione gia' "compilata", e il
-- pannello del manager accende "Different Location" su tutto, anche quando la
-- destinazione e' lo stesso albergo da cui si parte.
--
-- ── PERCHE' NON E' SOLO ESTETICA ─────────────────────────────────────────────
-- Una copia non e' un riferimento: non segue piu' l'originale. Se l'hotel di ritiro
-- cambia dopo, la destinazione resta quella di prima, e l'ospite verrebbe riportato
-- all'albergo in cui NON dorme piu'.
-- Non e' un timore: delle 40 copie, **30 hanno `dropoff_zone` diversa da
-- `pickup_zone`** pur nominando lo stesso albergo. Stesso posto, due zone diverse:
-- una delle due e' gia' sbagliata oggi, e la zona e' cio' che decide la fascia oraria
-- del giro di ritorno.
--
-- NULL invece segue il ritiro per costruzione: chi legge fa
-- `coalesce(dropoff_hotel, hotel_name)` e `coalesce(dropoff_zone, pickup_zone)`, e la
-- risposta e' sempre aggiornata perche' non c'e' niente da tenere sincronizzato.
-- Il front lo sa gia' e si difende: `useBookingLoader.ts:74-77` chiede
-- `dropoff_hotel && dropoff_hotel !== hotel_name` proprio per non farsi ingannare
-- dalla copia. L'ispettore admin quella guardia non ce l'ha, e infatti mostra il
-- difetto.
--
-- ── COSA TOCCA, E COSA NO ────────────────────────────────────────────────────
-- Azzera SOLO i campi del LUOGO di riconsegna, e solo dove il luogo e' letteralmente
-- lo stesso nome dell'hotel di ritiro. Non tocca:
--   • `requires_dropoff`  - dire "stesso posto" non e' dire "niente ritorno";
--   • `dropoff_driver_uid` (33 righe su 40 ce l'hanno) e `dropoff_sequence` - sono
--     decisioni vere di chi organizza il giro, e non c'entrano col luogo;
--   • le 5 destinazioni diverse, che restano intatte;
--   • le 17 gia' NULL, che sono gia' giuste.
-- Nessuna riga cambia significato: `coalesce` restituisce lo stesso albergo di prima.
-- Cambia che smette di poter divergere.
--
-- Backup in `archive` prima di scrivere, come da regola (create + revoke insieme).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists archive.bookings_bak_20260909_dropoff_copia as
  select internal_id, booking_ref, hotel_name, pickup_zone,
         dropoff_hotel, dropoff_zone, dropoff_lat, dropoff_lng
    from public.bookings
   where dropoff_hotel is not null and dropoff_hotel = hotel_name;
revoke all on archive.bookings_bak_20260909_dropoff_copia from anon, authenticated;

update public.bookings
   set dropoff_hotel = null,
       dropoff_zone  = null,
       dropoff_lat   = null,
       dropoff_lng   = null
 where dropoff_hotel is not null
   and dropoff_hotel = hotel_name;

-- Controllo: dopo, nessuna riga deve avere la destinazione uguale al ritiro.
do $$
declare n int;
begin
  select count(*) into n from public.bookings
   where dropoff_hotel is not null and dropoff_hotel = hotel_name;
  if n <> 0 then
    raise exception 'restano % righe con la destinazione copiata dal ritiro', n;
  end if;
end $$;
