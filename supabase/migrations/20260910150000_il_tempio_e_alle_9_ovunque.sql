-- ─────────────────────────────────────────────────────────────────────────────
-- Wat Pan Whaen: l'incontro e' alle 09:00, e adesso lo dicono tutti.
--
-- Decisione del proprietario, 2026-09-10: «dobbiamo mettere 9:00 ovunque per il
-- meeting al tempio». La fonte sbagliata era la TABELLA, non la copia.
--
-- ── LO STATO PRIMA, che e' il motivo per cui serve una migration e non una nota ─
-- Lo stesso posto aveva due orari in due tabelle, e ENTRAMBI finivano dentro la
-- conoscenza di Cherry, in dodici lingue, nello stesso file:
--   • `class_sessions.meeting_points` (copia JSON) diceva 09:00 -> campo `walkIn`
--   • `meeting_points` (tabella) diceva 08:50-09:00       -> scheda del punto
-- Cherry poteva quindi rispondere 08:50 o 09:00 alla stessa domanda a seconda del
-- blocco da cui pescava. Il 10/09 la copia era stata allineata alla tabella
-- (migration 20260910140000): direzione sbagliata, corretta qui.
--
-- ── PERCHE' 09:00 E NON 08:50 ────────────────────────────────────────────────
-- Il tempio non e' un walk-in come la cucina: e' il punto da cui PARTE il market
-- tour, e il market tour parte alle 09:00 (`schedule_config.market_tour.start`).
-- La sua stessa nota lo dice: «dove parcheggiamo il taxi prima di partire per il
-- market tour». 08:50 e' l'orario della CUCINA, applicato al tempio per somiglianza.
--
-- ── LA FINE DELLA FINESTRA ───────────────────────────────────────────────────
-- Prima: inizio 08:50, fine 09:00 - cioe' "arriva fra le 08:50 e le 09:00".
-- Ora l'incontro E' alle 09:00, quindi la fine non ha piu' un significato proprio e
-- va a NULL, come gia' fa la cucina (08:50, nessuna fine). Il front in quel caso
-- scrive "arriva entro <ora>", che e' esattamente cio' che serve dire.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists archive.meeting_points_bak_20260910_tempio as
  select id, name, morning_pickup_time, morning_pickup_end, evening_pickup_time, evening_pickup_end
    from public.meeting_points where id = 'mp_wat_pan_whaen';
revoke all on archive.meeting_points_bak_20260910_tempio from anon, authenticated;

update public.meeting_points
   set morning_pickup_time = time '09:00',
       morning_pickup_end  = null
 where id = 'mp_wat_pan_whaen';

update public.class_sessions cs
   set meeting_points = (
     select jsonb_agg(
       case when j->>'name' ilike '%Wat Pan%'
            then j || jsonb_build_object('time', '09:00', 'type', 'walk_in')
            else j
       end order by ord)
       from jsonb_array_elements(cs.meeting_points::jsonb) with ordinality t(j, ord)
   )
 where cs.meeting_points is not null
   and cs.meeting_points::text ilike '%Wat Pan%';

-- Controllo: le due fonti devono dire 09:00, entrambe.
do $$
declare v_tab text; v_json text;
begin
  select to_char(morning_pickup_time,'HH24:MI') into v_tab
    from public.meeting_points where id='mp_wat_pan_whaen';
  select j->>'time' into v_json
    from public.class_sessions cs, jsonb_array_elements(cs.meeting_points::jsonb) j
   where j->>'name' ilike '%Wat Pan%';
  if v_tab is distinct from '09:00' or v_json is distinct from '09:00' then
    raise exception 'il tempio non dice 09:00 ovunque: tabella=%, copia=%', v_tab, v_json;
  end if;
end $$;
