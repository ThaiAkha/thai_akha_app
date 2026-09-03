-- 20260903220000_ingredients_name_en_to_name.sql
-- GO owner 2026-09-03. Rinomina ingredients_library.name_en -> name e chiude il travaso
-- dei nomi thai nel sidecar. UNA transazione: l'ordine qui sotto non e' cosmetico.
--
-- PERCHE'. `ingredients_library` era l'unica tabella dello schema con `name_en`
-- (16 tabelle verificate usano gia' `name` su entrambi i lati) e il sidecar
-- `ingredients_library_translations` si chiama gia' `name`. Effetto pratico del
-- disallineamento: translate-batch.mjs legge m[c] con c preso dalle colonne del
-- SIDECAR, cercava m['name'] sulla madre, non lo trovava e saltava la cella senza
-- errore. Misurato prima di questa migration: 0 celle `name` tradotte su 2.112.
--
-- ORDINE. translation_hash_sql costruisce md5(jsonb_build_object('name_en', m.name_en, ...)):
--   - se il rename avviene mentre translation_source_columns mappa ancora `name_en`,
--     l'hash punta a una colonna morta e v_translations_stale cade INTERA;
--   - il rename cambia comunque la CHIAVE dentro il jsonb, quindi cambia l'hash di
--     tutte le 2.112 righe: senza riallineo risultano stale righe che stale non sono.
--
-- ⚠️ SCOSTAMENTO DAL PIANO, e perche'. Il piano chiudeva con
-- `select translation_mark_fresh('ingredients_library_translations')`: quella funzione,
-- chiamata senza p_lang e senza p_keys, aggiorna source_hash su TUTTE le righe, comprese
-- le 645 legittimamente stale, che sparirebbero (risultato 0, non 645). Qui il riallineo
-- salta le righe gia' stale al punto 0, cosi' il conteggio resta 645 come da criterio.

begin;

-- 0. Fotografia delle righe GIA' stale prima di toccare qualsiasi cosa (attese 645).
--    Sono lavoro vero da rifare: il riallineo del punto 4 le deve saltare.
create temporary table _stale_before on commit drop as
select madre_key, lang
from public.v_translations_stale
where sidecar = 'ingredients_library_translations';

-- 1. Mappa esplicita svuotata PRIMA che name_en sparisca: dopo il rename il match per
--    nome basta, e una mappa che punta a name_en farebbe cadere la vista.
create or replace function public.translation_source_columns(p_madre text, p_sidecar text)
 returns text[]
 language sql
 stable
 set search_path to 'public'
as $function$
  -- Colonne della MADRE che alimentano lo hash di freschezza.
  -- Due sorgenti, unite:
  --   (a) match per NOME madre<->sidecar (oggi il caso di TUTTE le coppie);
  --   (b) MAPPA ESPLICITA per i casi in cui la stessa informazione ha nomi diversi.
  -- (b) era nata il 2026-08-26 per un motivo preciso: `ingredients_library` chiamava il
  -- campo `name_en` e il sidecar lo chiama `name`. Il solo match per nome non lo trovava,
  -- quindi cambiare il nome inglese di un ingrediente NON marcava stale le sue traduzioni
  -- (192 ingredienti x 7 lingue = 1.344 righe cieche a quel tipo di modifica).
  -- Il 2026-09-03 la colonna e' stata rinominata in `name`: l'anomalia non esiste piu' e
  -- la mappa resta VUOTA. La struttura si tiene perche' il caso puo' ripresentarsi.
  --
  -- ⚠️ NON confondere questo caso con i campi SOLO-SIDECAR (herb_teas, home_cards,
  -- site_metadata_admin.title/subtitle/description, faq_questions.links): li' la
  -- colonna madre NON ESISTE, e' voluto, e giustamente non entra nell'hash.
  -- La mappa serve solo quando la stessa informazione esiste su ENTRAMBI i lati
  -- con nomi diversi. Prima di aggiungere una voce, verificare che sia questo il caso.
  with mappa(sidecar, madre, madre_col) as (
    select null::text, null::text, null::text where false
  ),
  per_nome as (
    select ma.attname::text col, ma.attnum
    from pg_attribute ma
    join pg_class mc on mc.oid = ma.attrelid
    join pg_namespace mn on mn.oid = mc.relnamespace and mn.nspname = 'public'
    join pg_attribute sa on sa.attname = ma.attname and not sa.attisdropped and sa.attnum > 0
    join pg_class sc on sc.oid = sa.attrelid and sc.relname = p_sidecar and sc.relnamespace = mn.oid
    where mc.relname = p_madre
      and ma.attnum > 0 and not ma.attisdropped
      and ma.atttypid <> 'boolean'::regtype
      and ma.attname not in ('id','lang','language','human_reviewed','created_at','updated_at','source_hash','source_version','page_slug','slug','canonical_url')
      and ma.attname not in (
        select madre_key_col from public.v_translation_pairs where sidecar = p_sidecar
        union select sidecar_fk_col from public.v_translation_pairs where sidecar = p_sidecar
      )
  ),
  mappate as (
    select m.madre_col col, 9999 attnum from mappa m
    where m.sidecar = p_sidecar and m.madre = p_madre
  )
  select coalesce(array_agg(col order by attnum, col), '{}')
  from (select col, attnum from per_nome union select col, attnum from mappate) u;
$function$;

-- 2. Il rename. L'unique constraint ingredients_name_unique segue la colonna da solo.
alter table public.ingredients_library rename column name_en to name;

-- 3. I nomi thai esistevano gia', erano solo nel posto sbagliato (retaggio pre-sidecar):
--    name_th pieno 204/204 sulla madre, sidecar th con `name` vuoto su tutte le 192 righe.
update public.ingredients_library_translations t
   set name = m.name_th
  from public.ingredients_library m
 where m.id = t.ingredient_id
   and t.lang = 'th'
   and m.name_th is not null and m.name_th <> ''
   and (t.name is null or t.name = '');

-- 4. Riallineo degli hash SOLO sulle righe che erano fresche: il cambio di chiave nel
--    jsonb non e' una modifica del contenuto, e non deve creare lavoro finto. Le righe
--    del punto 0 restano stale, perche' lo sono davvero.
do $mig$
declare r record; h text; n integer;
begin
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
end $mig$;

-- 5. Guardie: se un numero non torna la transazione si annulla INTERA, invece di
--    lasciare uno schema a meta' e un segnale di staleness che mente.
do $guard$
declare v_cols text[]; v_th integer; v_stale integer; v_stale_pre integer;
begin
  v_cols := public.translation_source_columns('ingredients_library','ingredients_library_translations');
  if not ('name' = any(v_cols)) then
    raise exception 'atteso `name` fra le colonne dello hash, trovato: %', v_cols;
  end if;
  if 'name_en' = any(v_cols) then
    raise exception '`name_en` e'' ancora fra le colonne dello hash: la mappa non e'' stata svuotata';
  end if;

  select count(*) into v_th from public.ingredients_library_translations
   where lang = 'th' and coalesce(name,'') <> '';
  if v_th <> 192 then raise exception 'travaso thai: attese 192 righe piene, trovate %', v_th; end if;

  select count(*) into v_stale_pre from _stale_before;
  select count(*) into v_stale from public.v_translations_stale
   where sidecar = 'ingredients_library_translations';
  if v_stale <> v_stale_pre then
    raise exception 'staleness alterata dal rename: prima %, dopo % (atteso invariato)', v_stale_pre, v_stale;
  end if;

  raise notice 'guardie ok: name nello hash, thai 192, stale % invariate', v_stale;
end $guard$;

-- 6. name_th NON si droppa qui. Il piano lo prevedeva ("se preferisci non perderlo
--    subito, fallo in una migration successiva") e questa e' quella situazione: il
--    censimento del codice mostra 10 file sorgente che leggono ancora `name_th` e 4
--    che lo MOSTRANO all'utente (il nome nativo dell'ingrediente):
--      front  IngredientCard · IngredientModal · RecipeView · IngredientPageSingle
--             useRecipeView · useRecipePageData · ingredient.service · recipe.service
--      admin  ShopItemCard (displayName in thai per il market)
--      edge   generate-embeddings (name_th entra nel testo dell'embedding)
--      shared cherryIngredientContext
--    Droppare prima di adeguarli manda in errore le select e spegne il nome thai in
--    pagina. Il drop torna in una migration successiva, dopo che il codice legge il
--    thai dal sidecar (ingredients_library_translations.name, lang='th'), che e' dove
--    il punto 3 lo ha appena messo.
--    Nota per chi rigioca la storia: in produzione il drop e' stato eseguito e subito
--    ripristinato il 2026-09-03 (192 valori ripresi dal sidecar, 12 voci operative non
--    pubblicate dal dump _TABLES pre-migration). Qui resta fuori: e' lo stato corretto.

commit;
