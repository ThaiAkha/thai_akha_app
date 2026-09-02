-- #132 · Bookings Edit per il driver: chiude l'ultimo 🟡 dell'audit is_staff (#64).
-- Prima: il driver scriveva bookings in diretta grazie al gate largo is_staff() di
-- "Bookings Edit" (qualsiasi colonna di qualsiasi booking) + una "Driver Update
-- Status" senza guardia colonne. Ora: RPC SECURITY DEFINER sul modello di
-- driver_route() (02/09), che permette SOLO i campi pickup delle SUE fermate,
-- e le due policy larghe vengono strette/rimosse.

-- ── 1. RPC ───────────────────────────────────────────────────────────────────
create or replace function public.driver_update_pickup(
  p_internal_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_my_role() is distinct from 'driver' then
    raise exception 'driver_update_pickup: only drivers can call this';
  end if;

  -- Stati raggiungibili dall'app (STATUS_STATIC in driverRouteConfig.ts).
  -- 'waiting' escluso: nessun reset all'indietro via RPC.
  if p_status not in ('driver_en_route', 'driver_arrived', 'on_board', 'dropped_off') then
    raise exception 'driver_update_pickup: invalid status %', p_status;
  end if;

  update public.bookings
     set transport_status    = p_status,
         -- coalesce: il claim vale solo se la fermata non ha gia' un pickup driver
         -- (il vecchio update sovrascriveva sempre, anche l'assegnazione altrui).
         pickup_driver_uid   = coalesce(pickup_driver_uid, auth.uid()),
         actual_pickup_time  = case when p_status = 'on_board'    then now() else actual_pickup_time end,
         actual_dropoff_time = case when p_status = 'dropped_off' then now() else actual_dropoff_time end
   where internal_id = p_internal_id
     and (pickup_driver_uid = auth.uid() or dropoff_driver_uid = auth.uid());

  if not found then
    raise exception 'driver_update_pickup: booking not found or not assigned to you';
  end if;
end;
$$;

revoke all on function public.driver_update_pickup(uuid, text) from public, anon;
grant execute on function public.driver_update_pickup(uuid, text) to authenticated;

-- ── 2. Chiusura policy ───────────────────────────────────────────────────────
-- La riga preparata dall'audit #64 (rimasta commentata finche' il driver scriveva in diretta).
alter policy "Bookings Edit" on public.bookings
  using (user_id = auth.uid() or is_admin());

-- Senza guardia colonne permetteva al driver qualsiasi UPDATE sulle proprie
-- fermate (anche prezzi). Il percorso driver ora e' solo la RPC.
drop policy if exists "Driver Update Status" on public.bookings;
