-- ─────────────────────────────────────────────────────────────────────────────
-- La copia dei punti dentro `class_sessions` smette di contraddire la tabella.
--
-- `class_sessions.meeting_points` e' un JSONB con i walk-in per sessione, letto da
-- `scripts/gen-cherry-facts.ts:115` per il campo `walkIn` dei fatti di Cherry.
-- Su tre voci, DUE coincidevano gia' con `meeting_points` (la scuola, 08:50 la
-- mattina e 16:50 la sera). La terza no:
--
--   Wat Pan Whaen, mattina    copia 09:00 / market_meeting   tabella 08:50 / walk_in
--
-- Ordine del proprietario del 2026-09-10: **i dati della tabella sono definitivi**.
-- Quindi si allineano ORA e TIPO a quelli di `meeting_points`.
--
-- ── COSA NON SI ALLINEA, E PERCHE' ───────────────────────────────────────────
-- `note` e `link` restano quelli della copia. Non sono una contraddizione: sono
-- testo da mostrare, e portano un'informazione che la tabella NON ha - la nota del
-- tempio dice «dove parcheggiamo il taxi prima di partire per il market tour»,
-- che e' il motivo per cui quel punto esiste la mattina. Sovrascriverla con la
-- descrizione della tabella la perderebbe senza guadagnare niente.
-- Il `name` resta «Thai Akha Kitchen (School)» invece di «Thai Akha Kitchen -
-- Chiang Mai»: sono due etichette dello stesso posto, non due verita' diverse.
--
-- ── LA CURA VERA, CHE NON E' QUESTA ──────────────────────────────────────────
-- Questo allineamento riporta d'accordo due copie, ma due copie restano. La cura
-- e' far leggere a `gen-cherry-facts` la tabella `meeting_points`, come gia' fa per
-- le ZONE: tre righe sopra, nello stesso file, c'e' il commento che spiega perche'
-- le zone si prendono dalla tabella e non dal blob («non conosce la zona Azure»).
-- I punti sono l'ultimo pezzo rimasto indietro. Finche' non si fa, questa riga
-- andra' riallineata a mano ogni volta che la tabella cambia.
-- ─────────────────────────────────────────────────────────────────────────────

update public.class_sessions cs
   set meeting_points = (
     select jsonb_agg(
       case when j->>'name' ilike '%Wat Pan%'
            then j || jsonb_build_object('time', '08:50', 'type', 'walk_in')
            else j
       end order by ord)
       from jsonb_array_elements(cs.meeting_points::jsonb) with ordinality t(j, ord)
   )
 where cs.meeting_points is not null
   and cs.meeting_points::text ilike '%Wat Pan%';

-- Controllo: nessuna voce della copia puo' piu' contraddire la tabella su ora e tipo.
do $$
declare n int;
begin
  select count(*) into n
    from public.class_sessions cs, jsonb_array_elements(cs.meeting_points::jsonb) j
    join public.meeting_points mp
      on mp.id = case when j->>'name' ilike '%Wat Pan%' then 'mp_wat_pan_whaen' else 'mp_school' end
   where (j->>'time') is distinct from
         to_char(case when cs.id = 'morning_class' then mp.morning_pickup_time else mp.evening_pickup_time end, 'HH24:MI')
      or (j->>'type') is distinct from mp.point_type;
  if n <> 0 then
    raise exception 'restano % voci che contraddicono la tabella', n;
  end if;
end $$;
