-- 20260826001000_fix_hash_source_columns.sql
-- 🚨 HOTFIX di una regressione introdotta da 20260826000000 (stesso giorno).
--
-- COSA ERA ROTTO: `translatable_columns()` e' stata riscritta per derivare dal SIDECAR
-- (giusto, per validare gli upload), ma `translation_hash_sql()` la usava per leggere
-- colonne sulla MADRE (`m.%I`). Dove i nomi divergono l'SQL diventa invalido:
--   ERROR 42703: column m.name does not exist
-- e `translations_stale()` NON degrada: cade INTERA, comprese le 19 coppie sane.
-- 5 coppie affette: herb_teas(12) · home_cards(3) · site_metadata_admin(3) ·
-- ingredients_library(name vs name_en) · faq_questions(links).
--
-- CONSEGUENZA PEGGIORE (lo scenario che ha reso urgente il fix): upload-translations.mjs
-- chiama translation_mark_fresh DOPO l'upsert. Su ingredienti e FAQ - i due batch piu'
-- grossi in programma - l'upsert sarebbe riuscito e mark_fresh avrebbe sollevato
-- l'eccezione, lasciando il batch CARICATO ma con hash non fissato: esattamente il
-- "caricamento a meta'" che i 6 controlli esistono per impedire, aggirato perche' arriva
-- dopo i controlli.
--
-- LA CAUSA VERA: due mestieri diversi in una funzione sola.
--   translatable_columns()        -> cosa si puo' SCRIVERE nel sidecar   (validazione upload)
--   translation_source_columns()  -> cosa puo' CAMBIARE nella madre      (staleness/hash)
-- Coincidono quasi sempre, e per questo la confusione non si era mai vista.
--
-- La sorgente hash torna ESATTAMENTE alla logica storica (join per nome madre↔sidecar):
-- gli `source_hash` gia' salvati erano calcolati cosi'. Verificato dopo l'applicazione:
-- `select count(*) from v_translations_stale` = 0, cioe' NESSUN hash e' cambiato e non
-- c'e' stata la finta "tempesta di stale" che una ridefinizione avrebbe prodotto.
-- mark_fresh riprovato in tx+rollback: ingredients 192 · faq 1259 · home_cards 31 ·
-- recipes 22 · herb_teas 0 (0 righe base). Nessuna eccezione.
--
-- ⚠️ GAP PREESISTENTE, NON introdotto qui e NON chiuso qui: per `ingredients_library`
-- lo hash non copre `name_en` (la madre lo chiama cosi', il sidecar `name`, e il join e'
-- per nome). Una modifica al nome inglese di un ingrediente NON marca stale le traduzioni.
-- Chiuderlo richiede una mappa esplicita sidecar_col->madre_col e la RIGENERAZIONE di
-- tutti gli hash: va fatto deliberatamente, non dentro un hotfix.

create or replace function public.translation_source_columns(p_madre text, p_sidecar text)
returns text[] language sql stable as $function$
  select coalesce(array_agg(ma.attname::text order by ma.attnum), '{}')
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
    );
$function$;

create or replace function public.translation_hash_sql(p_madre text, p_sidecar text)
returns text language sql stable as $function$
  -- Legge colonne della MADRE (m.): usa translation_source_columns, MAI translatable_columns.
  select format('md5(jsonb_build_object(%s)::text)',
    (select string_agg(format('%L, m.%I', c, c), ', ')
       from unnest(public.translation_source_columns(p_madre, p_sidecar)) c));
$function$;
