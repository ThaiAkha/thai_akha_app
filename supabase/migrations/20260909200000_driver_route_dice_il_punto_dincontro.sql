-- ─────────────────────────────────────────────────────────────────────────────
-- driver_route: l'autista deve vedere DOVE va, leggerlo nella sua lingua, e
-- sapere quale delle due gambe e' la sua.
--
-- Questa versione FONDE due proposte scritte lo stesso giorno da due parti diverse:
-- il punto d'incontro (questa chat) e i campi del giro - data, coordinate, zona di
-- riconsegna, le due sequenze, la gamba - dal documento sul flusso ritiro/riconsegna.
-- Tenerle separate avrebbe voluto dire due drop+create sulla stessa funzione.
--
-- ── IL GUASTO CHE LA MOTIVA, misurato il 2026-09-09 su righe vere ────────────
-- Due prenotazioni di quel giorno hanno un punto d'incontro di citta' (Central
-- Airport Plaza, `point_type='pickup'`) e un autista assegnato. Sul telefono
-- dell'autista quelle fermate mostravano:
--   • come luogo: NIENTE (`hotel_name` vuoto, e `TransportStopCard:71` stampa
--     `displayHotel || stop.hotel_name`);
--   • come etichetta: "WALK-IN" (`:92` mette in badge `pickup_zone`), il contrario
--     del vero;
--   • come mappa: il nulla (`DriverRoute.tsx:27` compone `hotel + " Chiang Mai"`
--     senza guardia, e con hotel NULL cerca letteralmente "null Chiang Mai").
-- L'autista era stato mandato a prendere qualcuno, e la sua app gli diceva che quel
-- qualcuno arriva da se', senza dirgli dove. La causa: `driver_route` non ha mai
-- restituito `meeting_point`, e l'interfaccia `Stop` non ha campi per il punto.
--
-- REGOLA DEL PROPRIETARIO (2026-09-09): «i meeting point non prendono dati da
-- zone, hanno orari e regole proprie». Qui non si deriva niente dalla zona: si
-- restituisce il punto com'e'. Stessa regola di `shared/lib/pickupCategory.ts`.
--
-- ── LE SCELTE CHE NON SI VEDONO NEL CODICE ───────────────────────────────────
-- `p_lang` (default 'en'): il sidecar `meeting_points_translations` copre 11 lingue
-- e per il THAI ha tutti e 12 i punti con la descrizione piena. Gli autisti sono
-- thai, e la descrizione e' la riga che dice il marciapiede ("aspetta sulla strada
-- principale, davanti all'ingresso"): il nome dice la citta', non il posto.
-- Sul nome il sidecar e' misto, verificato: "Central Airport Plaza" in thai resta
-- identico, mentre la scuola diventa "Thai Akha Kitchen - <Chiang Mai in thai>".
-- Il merge prende cio' che c'e' e non impone una politica: chi ha tradotto ha
-- deciso caso per caso, ed e' la persona giusta per deciderlo.
--
-- `p_date` (default NULL = nessun filtro): la funzione oggi restituisce TUTTE le
-- prenotazioni di sempre, e il filtro lo fa il client dopo (`useDriverRoute.ts:81`,
-- `.eq('booking_date', activeDate)`). Con 62 righe non si vede, a 6.000 si'. Ma il
-- default NON puo' essere "oggi": l'autista puo' cambiare giorno dalla sua pagina
-- (`DriverRoute.tsx:48`, `onDateChange`), e un filtro fisso nel server gli
-- spegnerebbe la navigazione. NULL non filtra, quindi i chiamanti di oggi non
-- cambiano comportamento; passare la data e' un miglioramento che il client fa
-- quando vuole.
--
-- `my_leg` e' NULL per admin/manager/kitchen, che vedono tutte le righe e per cui
-- la domanda "quale gamba e' la mia" non ha risposta. Dire 'dropoff' come ripiego
-- sarebbe stata una risposta falsa a chi non aveva fatto la domanda.
--
-- Perche' DROP e non CREATE OR REPLACE: cambiano firma e colonne di ritorno, e
-- Postgres rifiuta la sostituzione. Drop e ricreazione stanno nella STESSA
-- transazione, quindi non esiste un istante in cui la funzione manca. I grant, che
-- il drop si porta via, sono rimessi identici: authenticated + service_role, MAI anon.
-- ─────────────────────────────────────────────────────────────────────────────

drop function if exists public.driver_route();

create function public.driver_route(
  p_lang text default 'en',
  p_date date default null
)
returns table(
  internal_id uuid, booking_date date, status text, pax_count integer,
  hotel_name text, pickup_zone text, pickup_time time without time zone,
  phone_number text, customer_note text, session_id text, route_order integer,
  pickup_driver_uid uuid, dropoff_driver_uid uuid, transport_status text,
  dropoff_hotel text, requires_dropoff boolean, guest_name text, avatar_url text,
  visitor_count integer,
  -- Il punto d'incontro. `meeting_point_type` e' il criterio VERO della categoria:
  -- 'pickup' = l'autista ci va, 'walk_in' = no. Mai la zona.
  meeting_point text, meeting_point_name text, meeting_point_type text,
  meeting_point_description text, meeting_point_maps_link text,
  meeting_point_lat numeric, meeting_point_lng numeric,
  -- Il giro: dove si va, in che ordine, con quanti bagagli.
  pickup_lat numeric, pickup_lng numeric,
  dropoff_zone text, dropoff_lat numeric, dropoff_lng numeric,
  pickup_sequence integer, dropoff_sequence integer, has_luggage boolean,
  my_leg text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select b.internal_id,
         b.booking_date,
         b.status,
         b.pax_count,
         b.hotel_name,
         b.pickup_zone,
         b.pickup_time,
         b.phone_number,
         b.customer_note,
         b.session_id,
         b.route_order,
         b.pickup_driver_uid,
         b.dropoff_driver_uid,
         b.transport_status,
         b.dropoff_hotel,
         b.requires_dropoff,
         coalesce(p.full_name, 'Guest'::text) as guest_name,
         p.avatar_url,
         b.visitor_count,
         b.meeting_point,
         -- Merge per campo, come ovunque: la traduzione se c'e' e non e' vuota,
         -- altrimenti la madre inglese. Una lingua sconosciuta non trova righe e
         -- ricade sull'inglese da sola.
         coalesce(nullif(btrim(t.name), ''), mp.name),
         mp.point_type,
         coalesce(nullif(btrim(t.description), ''), mp.description),
         mp.google_maps_link,
         mp.latitude,
         mp.longitude,
         b.pickup_lat,
         b.pickup_lng,
         b.dropoff_zone,
         b.dropoff_lat,
         b.dropoff_lng,
         b.pickup_sequence,
         b.dropoff_sequence,
         b.has_luggage,
         case
           when b.pickup_driver_uid = auth.uid() and b.dropoff_driver_uid = auth.uid() then 'both'
           when b.pickup_driver_uid = auth.uid() then 'pickup'
           when b.dropoff_driver_uid = auth.uid() then 'dropoff'
           else null
         end as my_leg
    from public.bookings b
    left join public.profiles p on p.id = b.user_id
    -- LEFT: quasi nessuna prenotazione ha un punto, e un join stretto le
    -- farebbe sparire tutte dalla rotta.
    left join public.meeting_points mp on mp.id = b.meeting_point
    left join public.meeting_points_translations t
           on t.point_id = mp.id and t.lang = p_lang
   where (p_date is null or b.booking_date = p_date)
     and ((public.get_my_role() = 'driver'::text
           and (b.pickup_driver_uid = auth.uid() or b.dropoff_driver_uid = auth.uid()))
       or public.get_my_role() = any (array['admin'::text, 'manager'::text, 'kitchen'::text]));
$function$;

revoke all on function public.driver_route(text, date) from public, anon;
grant execute on function public.driver_route(text, date) to authenticated, service_role;

comment on function public.driver_route(text, date) is
  'Le fermate dell''autista che chiama (o tutte, per admin/manager/kitchen), col punto d''incontro e la sua descrizione nella lingua chiesta (default en). p_date NULL = nessun filtro, perche'' l''autista puo'' cambiare giorno dalla sua pagina. my_leg dice quale gamba e'' sua, NULL per chi vede tutto. Il punto ha orari e regole proprie: non si deriva dalla zona. La riconsegna NON ha un punto in bookings: e'' testo libero in dropoff_hotel.';
