-- 20260904000000_fix_semantic_stale_trigger_name.sql
-- Ripara un danno collaterale del rename `name_en` -> `name` del 2026-09-03
-- (migration 20260903220000), sfuggito al censimento di quella sessione.
--
-- IL DIFETTO, e perche' non si vedeva. Il trigger `trg_semantic_stale` su
-- `ingredients_library` riceve i nomi delle colonne da sorvegliare come argomenti, e
-- continuava a ricevere 'name_en'. La funzione `mark_semantic_stale` li usa cosi':
--
--     if to_jsonb(new) -> col is distinct from to_jsonb(old) -> col then ...
--
-- Su una colonna che non esiste piu', `to_jsonb(...) -> 'name_en'` vale NULL da entrambi
-- i lati: `NULL is distinct from NULL` e' falso, quindi nessun errore, nessun log, e
-- semplicemente l'embedding NON veniva piu' invalidato quando cambiava il nome inglese
-- di un ingrediente. Le altre quattro colonne sorvegliate continuavano a funzionare, il
-- che rendeva il guasto ancora meno visibile: il trigger sembrava vivo perche' per meta'
-- lo era.
--
-- Ambito verificato prima di scrivere: 42 coppie trigger/colonna su 10 tabelle,
-- `ingredients_library.name_en` era l'UNICA a puntare a una colonna inesistente.
-- (`photo_description` e `og_image`, droppate negli stessi giorni, non erano sorvegliate.)
--
-- 📏 La lezione, per il prossimo rename: una colonna non vive solo nelle query. Vive
-- anche negli ARGOMENTI dei trigger, dove un nome sbagliato non e' un errore di sintassi
-- ma una stringa che non corrisponde a niente. Un `grep` del vecchio nome sul DUMP dello
-- schema (non solo sul codice) l'avrebbe trovata subito.

begin;

-- 1. Il trigger torna a sorvegliare il nome inglese, che ora si chiama `name`.
create or replace trigger trg_semantic_stale
  before update on public.ingredients_library
  for each row
  execute function public.mark_semantic_stale('name', 'name_th', 'description', 'seo_description', 'summary_ai');

-- 2. Commento stantio: descriveva il mismatch name_en/name come se esistesse ancora.
--    Corpo della funzione IDENTICO, cambiano solo i commenti.
create or replace function public.translatable_columns(p_madre text, p_sidecar text)
 returns text[]
 language sql
 stable
 set search_path to 'public'
as $function$
  -- Deriva le colonne traducibili dal SIDECAR (il vero bersaglio delle scritture),
  -- non dalla madre. Riscritta il 2026-08-26 (GO owner) per due difetti:
  --   1. sidecar AUTONOMI (herb_teas, home_cards): la madre non ha testo → array vuoto
  --      → upload-translations.mjs rifiutava QUALSIASI json. Ora funzionano.
  --   2. mismatch di nome: `ingredients_library` aveva `name_en` sulla madre e `name`
  --      sul sidecar, e il join per nome non lo trovava. RISOLTO ALLA RADICE il
  --      2026-09-03 (migration 20260903220000): la colonna madre e' stata rinominata in
  --      `name` e la mappa esplicita in translation_source_columns e' ora vuota. Oggi
  --      TUTTE le coppie combaciano per nome. Il ramo resta per il caso che si ripresenti.
  -- Il sidecar contiene per costruzione solo colonne traducibili + servizio: si
  -- escludono servizio, chiavi, slug/URL e metadati di versione.
  -- Verificato prima di applicare: zero colonne PERSE su tutte e 24 le coppie.
  --
  -- 2026-09-03 (GO owner): esclusi anche translated_at, verified_at, verified_by.
  -- Erano metadati di lavorazione ma comparivano fra le "traducibili" in TUTTE e 24
  -- le coppie, gonfiando di tre celle per riga qualunque conteggio che si fidasse di
  -- questo elenco. Verificato prima di applicare: sulle 24 coppie l'unica differenza
  -- e' la sparizione di quei tre nomi, nessuna colonna di contenuto si muove.
  select coalesce(array_agg(sa.attname::text order by sa.attnum), '{}')
  from pg_attribute sa
  join pg_class sc on sc.oid = sa.attrelid and sc.relname = p_sidecar
  join pg_namespace sn on sn.oid = sc.relnamespace and sn.nspname = 'public'
  where sa.attnum > 0 and not sa.attisdropped
    and sa.atttypid <> 'boolean'::regtype
    and sa.attname not in (
      'id','lang','language','human_reviewed','created_at','updated_at',
      'source_hash','source_version','page_slug','slug','canonical_url',
      'translated_at','verified_at','verified_by'
    )
    and sa.attname not in (
      select sidecar_fk_col from public.v_translation_pairs where sidecar = p_sidecar
    );
$function$;

-- 2-bis. Stesso commento stantio dentro translation_hash_sql: citava name_en come
--        esempio vivo del mismatch. Corpo IDENTICO, cambia solo il commento.
create or replace function public.translation_hash_sql(p_madre text, p_sidecar text)
 returns text
 language sql
 stable
 set search_path to 'public'
as $function$
  -- Legge le colonne della MADRE (m.), quindi usa translation_source_columns.
  -- ⚠️ NON usare translatable_columns qui: dal 26/08 restituisce colonne del SIDECAR
  -- e su nomi divergenti genera SQL invalido -> `column m.<nome> does not exist` ->
  -- v_translations_stale cade INTERA. Il caso storico era ingredients name/name_en,
  -- chiuso il 2026-09-03 col rename della colonna madre in `name` (20260903220000);
  -- restano possibili i sidecar autonomi, quindi la regola vale ancora.
  select format('md5(jsonb_build_object(%s)::text)',
    (select string_agg(format('%L, m.%I', c, c), ', ')
       from unnest(public.translation_source_columns(p_madre, p_sidecar)) c));
$function$;

-- 3. Guardie: nessun trigger deve sorvegliare colonne inesistenti, e translatable_columns
--    deve continuare a rispondere come prima (il commento cambia, il comportamento no).
do $g$
declare n integer; c text[];
begin
  with trg as (
    select cl.relname::text as tabella,
           regexp_replace(pg_get_triggerdef(t.oid), '^.*mark_semantic_stale\(|\)$', '', 'g') as args
    from pg_trigger t
    join pg_class cl on cl.oid = t.tgrelid
    join pg_namespace ns on ns.oid = cl.relnamespace and ns.nspname = 'public'
    where not t.tgisinternal and pg_get_triggerdef(t.oid) like '%mark_semantic_stale%'
  ), cols as (
    select tabella, trim(both '''' from trim(unnest(string_to_array(args, ', ')))) as col from trg
  )
  select count(*) into n
    from cols x
    left join information_schema.columns ic
      on ic.table_schema = 'public' and ic.table_name = x.tabella and ic.column_name = x.col
   where ic.column_name is null;
  if n <> 0 then raise exception '% colonne sorvegliate da un trigger non esistono', n; end if;

  c := public.translatable_columns('ingredients_library','ingredients_library_translations');
  if not ('name' = any(c)) then raise exception 'translatable_columns non torna piu name'; end if;
  if 'translated_at' = any(c) then raise exception 'translatable_columns e tornata a includere i metadati'; end if;

  raise notice 'trigger e commenti allineati: 0 colonne fantasma';
end $g$;

commit;
