-- ─────────────────────────────────────────────────────────────────────────────
-- Le quattro righe walk-in senza punto: la cucina, e lo stato giusto del ritorno.
--
-- ── COME SONO NATE ───────────────────────────────────────────────────────────
-- Il pannello del planner sceglie il luogo in DUE TEMPI: prima la posizione
-- (`meeting_point: ''`, il sentinello "modalita' scelta, punto non ancora
-- selezionato"), poi il punto (`meeting_point: <id>`). Queste quattro righe sono
-- quelle dove il secondo tempo non e' mai avvenuto e qualcuno ha salvato lo
-- stesso: al salvataggio il sentinello diventa un NULL vero
-- (`useManagerLogistic.ts:361`), **indistinguibile da "non ha punto"**.
-- Da li' in poi quelle righe sono walk-in solo per `pickup_zone`, cioe' per il
-- criterio che `pickupCategory.ts` dichiara sbagliato - e sono cieche a qualunque
-- regola basata sul tipo del punto, **compresa la mia conversione del 10/09**, che
-- infatti le ha mandate tutte su `same`.
--
-- ── DECISIONE DEL PROPRIETARIO (2026-09-10) ──────────────────────────────────
-- «qualunque punto, hotel meeting e walkin, non possono esistere senza aver
-- definito il punto esatto tra le liste, mai vuoto, se vuoto messaggio errore».
-- E per queste quattro: **la cucina**.
-- Per tre delle quattro non era nemmeno una scelta: sono SERALI, e la sera
-- l'unico punto walk-in disponibile e' la cucina (il tempio non ha orario serale,
-- decisione del 09/09). La quarta e' mattutina, e li' i punti sarebbero due: ha
-- deciso lui.
--
-- ── PERCHE' SI TOCCA ANCHE LO STATO DEL RITORNO ──────────────────────────────
-- Mettendo solo il punto, quelle righe finirebbero nello stato che stiamo per
-- vietare: walk-in con riconsegna `same`. "Riportami dove mi avete preso" non
-- vuol dire niente per chi e' arrivato a piedi. Quindi lo stato si corregge nello
-- stesso momento, e si corregge **dal dato**, non a naso:
--   · chi NON chiede il rientro          -> `none`      (se ne va da se')
--   · chi lo chiede e non ha destinazione -> `to_define` (nessuno ha ancora detto dove)
-- Nessuna delle quattro ha una destinazione, quindi nessuna diventa `hotel`.
--
-- `to_define` su TAK00151 e TAK00148 non e' un ripiego: e' la verita'. Sono le due
-- righe che il pannello segnala gia' come non consegnabili - chiedono di essere
-- riportate e nessuno sa dove - e quello stato lo dice invece di nasconderlo.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists archive.bookings_bak_20260910_walkin_senza_punto as
  select internal_id, booking_ref, booking_date, session_id,
         meeting_point, pickup_zone, requires_dropoff, dropoff_hotel, dropoff_mode
    from public.bookings
   where pickup_zone = 'walk-in' and meeting_point is null;
revoke all on archive.bookings_bak_20260910_walkin_senza_punto from anon, authenticated;

update public.bookings
   set meeting_point = 'mp_school',
       dropoff_mode  = case
         when not requires_dropoff then 'none'
         when coalesce(btrim(dropoff_hotel), '') = '' then 'to_define'
         else dropoff_mode
       end
 where pickup_zone = 'walk-in' and meeting_point is null;

-- Controllo: nessuna riga walk-in senza punto, e nessuna walk-in con 'same'.
do $$
declare n_senza int; n_same int;
begin
  select count(*) into n_senza from public.bookings
   where pickup_zone = 'walk-in' and meeting_point is null;
  select count(*) into n_same from public.bookings b
    join public.meeting_points mp on mp.id = b.meeting_point
   where mp.point_type = 'walk_in' and b.dropoff_mode = 'same';
  if n_senza <> 0 or n_same <> 0 then
    raise exception 'restano % walk-in senza punto e % walk-in con "stesso posto"', n_senza, n_same;
  end if;
end $$;
