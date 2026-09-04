-- 20260903250000_ingredients_translations_season_note.sql
-- APPLICATA IN PRODUZIONE il 2026-09-03, subito dopo 20260903240000 (#189).
--
-- `season_note` entra nel sidecar delle traduzioni.
--
-- ORDINE, e perche' non e' cosmetico. Questa migration viene DOPO il popolamento della
-- madre, non prima. `translation_source_columns` accoppia madre e sidecar per NOME: nel
-- momento in cui `season_note` esiste su entrambi i lati entra nello hash di freschezza.
--   - farlo PRIMA dell'UPDATE = lo hash si muove due volte (una sull'alter, una sull'UPDATE
--     delle 191 note) e il secondo movimento marca stale 2.101 traduzioni che stale non
--     sono: non sono invecchiate, c'e' un campo nuovo da riempire.
--   - farlo DOPO = un solo movimento, con le note gia' scritte.
--
-- Un `alter table` nudo porterebbe le stale da 645 a 2.112 e affogherebbe il segnale delle
-- 645 legittime, che sono lavoro vero. Quindi si riallinea lo hash SOLO sulle righe che
-- erano fresche al punto 0. Le celle `season_note` vuote non sono "stale": sono ASSENTI,
-- e come tali le conta il postedit `empty`.
--
-- Esito misurato dopo l'applicazione: stale 645 (invariate), colonna nello hash,
-- 2.112 celle da riempire, 191 note scritte sulla madre.

do $mig$
declare
  r record; h text; n integer; v_cols text[]; v_stale_pre integer; v_stale integer;
begin
  -- 0. Fotografia delle righe gia' stale, prima di toccare lo schema.
  create temporary table _stale_before as
  select madre_key, lang from public.v_translations_stale
   where sidecar = 'ingredients_library_translations';
  select count(*) into v_stale_pre from _stale_before;
  if v_stale_pre <> 645 then
    raise exception 'attese 645 righe stale prima dell''alter, trovate %: fermarsi e capire perche', v_stale_pre;
  end if;

  -- 1. La colonna.
  alter table public.ingredients_library_translations add column if not exists season_note text;
  comment on column public.ingredients_library_translations.season_note is
    '#189 - traduzione di ingredients_library.season_note. Vuota al 2026-09-03: la riempie /translate-db dopo che la FAQ .8 e'' stabile.';

  -- 2. Riallineo dello hash sulle sole righe che erano fresche.
  select * into r from public.v_translation_pairs
   where sidecar = 'ingredients_library_translations' limit 1;
  h := public.translation_hash_sql(r.madre, r.sidecar);
  if h is null then raise exception 'hash nullo: translation_source_columns non torna colonne'; end if;
  execute format(
    'update public.%I s set source_hash = %s from public.%I m
      where m.%I::text = s.%I::text
        and not exists (select 1 from _stale_before b
                         where b.madre_key = s.%I::text and b.lang = s.lang)',
    r.sidecar, h, r.madre, r.madre_key_col, r.sidecar_fk_col, r.sidecar_fk_col);
  get diagnostics n = row_count;
  raise notice 'hash riallineati su % righe (le stale legittime non sono state toccate)', n;

  -- 3. Guardie: se un numero non torna, si annulla tutto.
  v_cols := public.translation_source_columns('ingredients_library','ingredients_library_translations');
  if not ('season_note' = any(v_cols)) then
    raise exception 'season_note non e'' entrata fra le colonne dello hash: %', v_cols;
  end if;

  select count(*) into v_stale from public.v_translations_stale
   where sidecar = 'ingredients_library_translations';
  if v_stale <> v_stale_pre then
    raise exception 'staleness alterata dall''alter: prima %, dopo % (atteso invariato)', v_stale_pre, v_stale;
  end if;

  drop table _stale_before;
  raise notice 'ok: season_note nel sidecar, stale % invariate, hash riallineati su %', v_stale, n;
end $mig$;
