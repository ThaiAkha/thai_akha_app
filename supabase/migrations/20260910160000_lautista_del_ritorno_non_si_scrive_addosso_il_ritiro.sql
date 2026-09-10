-- ─────────────────────────────────────────────────────────────────────────────
-- L'autista che aggiorna una fermata smette di assegnarsi il ritiro da solo.
--
-- `driver_update_pickup` accetta chi e' assegnato al ritiro OPPURE al ritorno
-- (`where ... pickup_driver_uid = auth.uid() or dropoff_driver_uid = auth.uid()`),
-- e poi scrive:
--
--     pickup_driver_uid = coalesce(pickup_driver_uid, auth.uid())
--
-- Su una prenotazione dove il ritiro non ha autista - cioe' **ogni walk-in**, per
-- costruzione - basta che l'autista del RITORNO tocchi lo stato della fermata
-- perche' quella persona risulti **ritirata da lui**: esce dalla colonna walk-in
-- del planner ed entra nella sua colonna di andata. Nessuno ha deciso niente, e
-- nessuna schermata lo segnala.
--
-- Misurato il 2026-09-10: le prenotazioni con autista di solo ritorno sono 4, e
-- sono **tutte e quattro walk-in**. Cioe' l'unico caso in cui quel ripiego si
-- attiva e' anche l'unico in cui e' sbagliato.
--
-- ── PERCHE' SI TOGLIE E BASTA ────────────────────────────────────────────────
-- Il ripiego serviva a coprire "l'autista prende in carico una fermata non
-- assegnata". Ma quel caso il `where` lo esclude gia': se non sei ne' l'uno ne'
-- l'altro autista, la riga non ti appartiene e l'update non ti tocca. Quindi il
-- coalesce non copre nessuno scenario legittimo, e ne rompe uno reale.
-- E soprattutto: **assegnare gli autisti e' del manager**, per decisione del
-- proprietario del 2026-09-10 («chi decide ordine pickup, assegnazioni ecc, solo
-- admin e manager»). Una funzione dell'autista non deve poter assegnare.
--
-- Il resto della funzione non cambia: stato, orario di salita e orario di
-- riconsegna restano identici, e restano scrivibili da chi guida.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.driver_update_pickup(p_internal_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if public.get_my_role() is distinct from 'driver' then
    raise exception 'driver_update_pickup: only drivers can call this';
  end if;

  if p_status not in ('driver_en_route', 'driver_arrived', 'on_board', 'dropped_off') then
    raise exception 'driver_update_pickup: invalid status %', p_status;
  end if;

  -- `pickup_driver_uid` NON si tocca: l'assegnazione e' del manager. Prima qui
  -- c'era `coalesce(pickup_driver_uid, auth.uid())`, che su un walk-in faceva
  -- risultare ritirato da chi lo stava solo riportando a casa.
  update public.bookings
     set transport_status    = p_status,
         actual_pickup_time  = case when p_status = 'on_board'    then now() else actual_pickup_time end,
         actual_dropoff_time = case when p_status = 'dropped_off' then now() else actual_dropoff_time end
   where internal_id = p_internal_id
     and (pickup_driver_uid = auth.uid() or dropoff_driver_uid = auth.uid());

  if not found then
    raise exception 'driver_update_pickup: booking not found or not assigned to you';
  end if;
end;
$function$;

comment on function public.driver_update_pickup(uuid, text) is
  'L''autista assegnato (al ritiro o al ritorno) aggiorna lo stato della propria fermata e gli orari reali. NON assegna: dal 2026-09-10 non scrive piu'' pickup_driver_uid, perche'' su un walk-in faceva risultare ritirato da chi lo stava solo riportando a casa. Le assegnazioni sono del manager.';
