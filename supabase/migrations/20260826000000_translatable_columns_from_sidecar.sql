-- 20260826000000_translatable_columns_from_sidecar.sql
-- translatable_columns(): deriva le colonne dal SIDECAR, non dalla madre.
-- Applicata live 2026-08-26 su GO owner. Sblocca i batch di traduzione della coda lunga.
--
-- DUE DIFETTI CHIUSI:
-- 1. SIDECAR AUTONOMI (herb_teas_translations, home_cards_translations): l'inglese vive
--    nel sidecar (riga lang=en) e la madre non ha testo -> il join per nome sulla madre
--    restituiva un array VUOTO -> upload-translations.mjs (controllo 3:
--    `p.traducibili.includes(col)`) rifiutava QUALSIASI json. Erano intraducibili.
-- 2. MISMATCH DI NOME: ingredients_library ha `name_en` sulla madre e `name` sul sidecar
--    -> `name` non compariva fra le traducibili. NON era una scelta editoriale: era
--    meccanica. I 192 nomi ingrediente sarebbero rimasti in EN in tutte le lingue.
--    (Quali nomi siano termini protetti - galangal si', lemongrass no - resta una
--    decisione di glossario: 02_base_glossary §3, dominio /translate-db.)
--
-- ESCLUSIONI: servizio (id, lang, language, human_reviewed, timestamps, source_hash),
-- chiavi (sidecar_fk_col da v_translation_pairs), URL/slug (slug, page_slug,
-- canonical_url) e metadati di versione (source_version - e' "1.5", non testo).
--
-- VERIFICATO PRIMA DI APPLICARE, su tutte e 24 le coppie: ZERO colonne perse.
-- 18 invariate; 6 guadagnano: herb_teas 0->12, home_cards 0->3,
-- site_metadata_admin 1->4, ingredients +name, faq_questions +links, legal +0
-- (source_version escluso apposta).
create or replace function public.translatable_columns(p_madre text, p_sidecar text)
returns text[] language sql stable as $function$
  select coalesce(array_agg(sa.attname::text order by sa.attnum), '{}')
  from pg_attribute sa
  join pg_class sc on sc.oid = sa.attrelid and sc.relname = p_sidecar
  join pg_namespace sn on sn.oid = sc.relnamespace and sn.nspname = 'public'
  where sa.attnum > 0 and not sa.attisdropped
    and sa.atttypid <> 'boolean'::regtype
    and sa.attname not in (
      'id','lang','language','human_reviewed','created_at','updated_at',
      'source_hash','source_version','page_slug','slug','canonical_url'
    )
    and sa.attname not in (
      select sidecar_fk_col from public.v_translation_pairs where sidecar = p_sidecar
    );
$function$;
