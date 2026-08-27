-- ============================================================================
-- SEGNALE DI STALE per i sidecar *_translations  (2026-08-17)
-- ============================================================================
-- Applicata sul live in 3 step (translation_staleness_ddl, _fix_columns,
-- _pg_catalog); questo file è la versione CONSOLIDATA e idempotente.
--
-- PROBLEMA: 24 coppie madre↔sidecar e NESSUN modo di sapere se una traduzione
-- è invecchiata. Modificando la riga inglese la traduzione restava com'era,
-- in silenzio. 10 madri non hanno nemmeno updated_at.
--
-- SOLUZIONE: un hash CALCOLATO, non un flag memorizzato.
--   · translatable_columns(madre, sidecar) → colonne che il sidecar traduce:
--     madre ∩ sidecar, meno meta/booleani/chiavi. DERIVATO dallo schema.
--   · source_hash sul sidecar = md5 dei campi traducibili al momento della
--     traduzione (translation_mark_fresh, set-based).
--   · v_translations_stale = righe dove hash attuale ≠ hash salvato.
--   · v_translation_pairs(_info) = registro coppie dalle FK, con flag
--     sidecar_autonomo (herb_teas, home_cards: la madre non ha testo, anche
--     l'EN vive nel sidecar → staleness non applicabile, dichiarato).
-- Nessun trigger sulle madri, nessuna traduzione automatica: il DB SEGNALA,
-- /translate-db ritraduce in batch e chiama translation_mark_fresh.
--
-- PERF: tutto su pg_catalog (information_schema.constraint_column_usage
-- impiegava 2s e veniva chiamata per riga → timeout). Ora: ms.
-- ============================================================================

drop view if exists public.v_translations_stale;
drop view if exists public.v_translation_pairs_info;
drop view if exists public.v_translation_pairs;

create view public.v_translation_pairs as
select s.relname::text as sidecar, m.relname::text as madre,
       sa.attname::text as sidecar_fk_col, ma.attname::text as madre_key_col
from pg_constraint c
join pg_class s      on s.oid = c.conrelid
join pg_class m      on m.oid = c.confrelid
join pg_namespace n  on n.oid = s.relnamespace and n.nspname = 'public'
join pg_attribute sa on sa.attrelid = s.oid and sa.attnum = c.conkey[1]
join pg_attribute ma on ma.attrelid = m.oid and ma.attnum = c.confkey[1]
where c.contype = 'f' and array_length(c.conkey,1) = 1
  and s.relname like '%\_translations' escape '\'
  and m.relname = regexp_replace(s.relname, '_translations$', '');
comment on view public.v_translation_pairs is 'Coppie madre↔sidecar derivate dalle FK (pg_catalog). Aggiungere un sidecar = compare da solo.';

create or replace function public.translatable_columns(p_madre text, p_sidecar text)
returns text[] language sql stable as $$
  select coalesce(array_agg(ma.attname::text order by ma.attnum), '{}')
  from pg_attribute ma
  join pg_class mc on mc.oid = ma.attrelid
  join pg_namespace mn on mn.oid = mc.relnamespace and mn.nspname = 'public'
  join pg_attribute sa on sa.attname = ma.attname and not sa.attisdropped and sa.attnum > 0
  join pg_class sc on sc.oid = sa.attrelid and sc.relname = p_sidecar and sc.relnamespace = mn.oid
  where mc.relname = p_madre and ma.attnum > 0 and not ma.attisdropped
    and ma.atttypid <> 'boolean'::regtype
    and ma.attname not in ('id','lang','language','human_reviewed','created_at','updated_at','source_hash','page_slug','slug')
    and ma.attname not in (
      select madre_key_col from public.v_translation_pairs where sidecar = p_sidecar
      union select sidecar_fk_col from public.v_translation_pairs where sidecar = p_sidecar);
$$;
comment on function public.translatable_columns is 'Colonne di p_madre che il sidecar traduce: derivate dallo schema, mai a mano. Slug esclusi (registro v_translated_slugs).';

do $$ declare r record; begin
  for r in select distinct sidecar from public.v_translation_pairs loop
    execute format('alter table public.%I add column if not exists source_hash text', r.sidecar);
    execute format('comment on column public.%I.source_hash is %L', r.sidecar,
      'md5 dei campi traducibili della madre AL MOMENTO della traduzione. NULL = mai fissato. Confronto: v_translations_stale.');
  end loop; end $$;

create or replace function public.translation_hash_sql(p_madre text, p_sidecar text)
returns text language sql stable as $$
  select format('md5(jsonb_build_object(%s)::text)',
    (select string_agg(format('%L, m.%I', c, c), ', ')
       from unnest(public.translatable_columns(p_madre, p_sidecar)) c));
$$;
comment on function public.translation_hash_sql is 'Frammento SQL (alias madre = m) che calcola l''hash: per UPDATE/SELECT set-based, mai per riga. NULL se sidecar autonomo.';

create or replace function public.translation_source_hash(p_madre text, p_sidecar text, p_key text)
returns text language plpgsql stable as $$
declare v_cols text[]; v_key text; v_json text;
begin
  select madre_key_col into v_key from public.v_translation_pairs where sidecar = p_sidecar limit 1;
  if v_key is null then return null; end if;
  v_cols := public.translatable_columns(p_madre, p_sidecar);
  if coalesce(array_length(v_cols,1),0) = 0 then return null; end if;
  execute format('select md5(jsonb_build_object(%s)::text) from public.%I where %I::text = $1',
    (select string_agg(format('%L, %I', c, c), ', ') from unnest(v_cols) c), p_madre, v_key) into v_json using p_key;
  return v_json;
end; $$;
comment on function public.translation_source_hash is 'Hash di UNA riga madre (uso puntuale). Per i batch usare translation_hash_sql.';

-- p_keys (2026-08-23, live come migration translation_mark_fresh_by_keys):
-- un batch fissa l'hash SOLO sulle righe che ha caricato. Senza, caricando
-- 2 righe se ne dichiaravano fresche 1259 - e una stale non ritradotta
-- sarebbe sparita in silenzio. Senza p_keys = tutta la lingua (backfill).
drop function if exists public.translation_mark_fresh(text, text);
create or replace function public.translation_mark_fresh(p_sidecar text, p_lang text default null, p_keys text[] default null)
returns integer language plpgsql as $$
declare r record; n integer; h text; begin
  select * into r from public.v_translation_pairs where sidecar = p_sidecar limit 1;
  if r is null then raise exception 'sidecar % sconosciuto', p_sidecar; end if;
  h := public.translation_hash_sql(r.madre, r.sidecar);
  if h is null then return 0; end if;
  execute format('update public.%I s set source_hash = %s from public.%I m where m.%I::text = s.%I::text and ($1 is null or s.lang = $1) and ($2 is null or s.%I::text = any($2))',
    r.sidecar, h, r.madre, r.madre_key_col, r.sidecar_fk_col, r.sidecar_fk_col) using p_lang, p_keys;
  get diagnostics n = row_count; return n;
end; $$;
comment on function public.translation_mark_fresh(text, text, text[]) is 'Fissa source_hash = hash attuale. p_keys = solo le chiavi appena caricate (un batch non dichiara allineato cio'' che non ha toccato); senza = tutta la lingua/sidecar (backfill).';

create or replace function public.translations_stale()
returns table (sidecar text, madre text, lang text, madre_key text, motivo text)
language plpgsql stable as $$
declare r record; h text; begin
  for r in select * from public.v_translation_pairs loop
    h := public.translation_hash_sql(r.madre, r.sidecar);
    if h is null then continue; end if;
    return query execute format(
      $q$ select %L::text, %L::text, s.lang::text, s.%I::text,
             case when s.source_hash is null then 'mai_fissato'
                  when m.%I is null then 'madre_cancellata'
                  else 'madre_modificata' end
          from public.%I s left join public.%I m on m.%I::text = s.%I::text
          where s.source_hash is distinct from (case when m.%I is null then null else %s end) $q$,
      r.sidecar, r.madre, r.sidecar_fk_col, r.madre_key_col,
      r.sidecar, r.madre, r.madre_key_col, r.sidecar_fk_col, r.madre_key_col, h);
  end loop; end; $$;

create view public.v_translations_stale as select * from public.translations_stale();
comment on view public.v_translations_stale is 'Traduzioni invecchiate: la madre è cambiata dopo la traduzione (o mai fissata). Lista di lavoro di /translate-db.';

create view public.v_translation_pairs_info as
select p.*, public.translatable_columns(p.madre, p.sidecar) as traducibili,
       coalesce(array_length(public.translatable_columns(p.madre, p.sidecar),1),0) = 0 as sidecar_autonomo
from public.v_translation_pairs p;
comment on view public.v_translation_pairs_info is 'Coppie + colonne traducibili derivate + flag sidecar_autonomo (madre senza testo: EN vive nel sidecar, staleness non applicabile).';

grant select on public.v_translation_pairs, public.v_translation_pairs_info, public.v_translations_stale to authenticated;
revoke all on function public.translation_mark_fresh(text, text, text[]) from public, anon, authenticated;

-- Baseline: al primo deploy fissa TUTTO come allineato ("da oggi si misura").
-- Idempotente: mark_fresh su un hash già uguale non cambia nulla.
select public.translation_mark_fresh(sidecar) from public.v_translation_pairs;
