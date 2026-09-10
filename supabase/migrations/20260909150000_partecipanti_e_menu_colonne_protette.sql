-- 20260909150000_partecipanti_e_menu_colonne_protette.sql
-- /database · 2026-09-09 · A2 dell'audit, su GO owner. Stesso difetto di `bookings`, altre due tabelle.
--
-- IL DIFETTO, nella sua forma generale. Una policy UPDATE la cui USING dice "questa riga e' TUA"
-- e che non ha WITH CHECK viene riusata da Postgres per giudicare anche la riga NUOVA: il
-- risultato e' che il POSSESSO diventa il permesso di scrivere QUALUNQUE colonna di quella riga.
-- Sul database vivo le policy UPDATE senza WITH CHECK sono 35 su 76, ma quasi tutte sono sane
-- perche' la loro USING e' un controllo di RUOLO (is_admin, is_staff): riusarla e' corretto,
-- lo staff puo' scrivere tutto. Le pericolose sono quelle basate sul possesso, e sono TRE:
--   bookings            -> chiusa da 20260909140000 (denaro e stato)
--   booking_participants -> qui
--   menu_selections      -> qui
--
-- COSA SI POTEVA FARE, verificato:
-- `booking_participants` (USING `user_id = auth.uid() OR is_admin()`, comando ALL) ha le colonne
-- booking_id, user_id, is_leader. Un partecipante poteva **promuoversi capogruppo** (`is_leader`
-- lo leggono PosClassSidebar e useKitchenGroups per dire chi guida il gruppo) o spostare la
-- propria riga sotto un'altra prenotazione.
-- `menu_selections` (USING `user_id = auth.uid() OR manages_profile(user_id) OR is_admin()`) ha
-- `booking_id`: si poteva agganciare la propria scelta di menu, allergie comprese, alla
-- prenotazione di un altro.
--
-- PERCHE' UN TRIGGER E NON UN WITH CHECK: una policy giudica solo la riga nuova, non puo' dire
-- "non cambiare questa colonna". E' lo stesso motivo, e lo stesso rimedio, della 20260909140000.
--
-- PERCHE' NON ROMPE NIENTE, verificato nel codice prima di scrivere:
-- - `booking_participants`: **nessun UPDATE dal client**. Le scritture passano dalle RPC
--   `join_booking_by_ref` e `add_managed_participant` (SECURITY DEFINER: la RLS non le riguarda),
--   e `useKitchenGroups.ts:169` costruisce un partecipante in memoria per la UI, non scrive.
-- - `menu_selections`: `UserMenu.tsx:195` fa `.update(payload)` e il payload CONTIENE `user_id` e
--   `booking_id`, ma sono gli STESSI valori con cui ha appena cercato la riga (`.eq(booking_id)
--   .eq(user_id)`). Il guardiano vieta i CAMBI, non le riscritture: `is distinct from` e' falso e
--   la scrittura passa.

create or replace function public.protect_owner_columns()
returns trigger language plpgsql set search_path to 'public' as $function$
declare v_col text;
begin
  -- auth.uid() nullo = chiamata di servizio (edge function, cron, migration): non ci si intromette.
  if auth.uid() is not null and not public.is_admin() and not public.is_staff() then
    foreach v_col in array tg_argv loop
      if to_jsonb(new) -> v_col is distinct from to_jsonb(old) -> v_col then
        raise exception 'La colonna "%" di %.% la puo'' cambiare solo lo staff.',
          v_col, tg_table_schema, tg_table_name using errcode = '42501';
      end if;
    end loop;
  end if;
  return new;
end $function$;

comment on function public.protect_owner_columns is
  'Guardiano generico BEFORE UPDATE: vieta a chi non e'' staff di CAMBIARE le colonne elencate negli argomenti del trigger. Serve dove la policy UPDATE si basa sul possesso della riga e non ha WITH CHECK, cioe'' dove Postgres riusa "la riga e'' tua" come "puoi scriverci qualunque cosa". Riscrivere lo stesso valore e'' permesso. 2026-09-09.';

drop trigger if exists protect_participant_columns on public.booking_participants;
create trigger protect_participant_columns
  before update on public.booking_participants
  for each row execute function public.protect_owner_columns('booking_id', 'user_id', 'is_leader');

drop trigger if exists protect_menu_columns on public.menu_selections;
create trigger protect_menu_columns
  before update on public.menu_selections
  for each row execute function public.protect_owner_columns('user_id', 'booking_id');

-- VERIFICA DOPO (in transazione annullata, come per la 140000):
-- cliente che si promuove capogruppo            -> ERROR 42501
-- cliente che sposta il menu su un'altra prenotazione -> ERROR 42501
-- cliente che cambia le proprie scelte di piatti      -> RIUSCITA
-- admin che sistema un partecipante                   -> RIUSCITA
-- servizio (auth.uid nullo)                           -> RIUSCITA
