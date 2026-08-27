-- 2026-08-27 · /database · chiude il "buco name_en"
--
-- IL PROBLEMA
-- `translation_source_columns()` accoppia madre e sidecar MATCHANDO I NOMI delle colonne.
-- `ingredients_library` chiama il nome inglese `name_en`; il sidecar lo chiama `name`.
-- Nessun match -> `name_en` non entrava nell'hash di freschezza -> cambiare il nome
-- inglese di un ingrediente NON marcava stale le sue traduzioni.
-- Cieche a quel tipo di modifica: 192 ingredienti x 7 lingue = 1.344 righe.
--
-- LA CURA
-- Una MAPPA ESPLICITA sidecar->madre, unita al match per nome. Una sola voce oggi.
--
-- ⚠️ NON confondere questo caso con i campi SOLO-SIDECAR (herb_teas 12 col, home_cards 3,
-- site_metadata_admin.title, faq_questions.links): li' la colonna madre NON ESISTE, e'
-- voluto, e giustamente non entra nell'hash. Sono 19 casi, tutti verificati il 26/08.
-- La mappa serve SOLO quando la stessa informazione esiste su ENTRAMBI i lati con nomi
-- diversi. Prima di aggiungere una voce, dimostrare che e' questo il caso.
--
-- PORTATA: il fix guarda AVANTI. Le divergenze `name_en` gia' avvenute in passato non
-- sono piu' rilevabili: l'hash vecchio non le conteneva, quindi non ha lasciato traccia.

create or replace function public.translation_source_columns(p_madre text, p_sidecar text)
returns text[] language sql stable as $function$
  with mappa(sidecar, madre, madre_col) as (
    values ('ingredients_library_translations', 'ingredients_library', 'name_en')
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

-- RIBASE DEGLI HASH (eseguito il 2026-08-27, qui per memoria)
-- Cambiare la formula rende stale tutte e 1.344 le righe: e' una tempesta FALSA, il
-- contenuto non e' cambiato. Ribasata solo ingredients, che aveva 0 stale legittime
-- (verificato prima). Backup: archive.source_hash_bak_20260826 (1.344 righe, senza grant).
--   select public.translation_mark_fresh('ingredients_library_translations');  -- 1344
--
-- Le 60 stale legittime degli altri sidecar NON sono state toccate: verificato che la
-- formula resta IDENTICA per 23 coppie su 24 (confronto con la funzione vecchia
-- ricostruita sotto altro nome, poi droppata).
