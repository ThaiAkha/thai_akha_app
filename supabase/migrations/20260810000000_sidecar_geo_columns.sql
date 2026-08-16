-- 20260810000000_sidecar_geo_columns.sql
-- GEO/AI-search MULTILINGUA nei sidecar. Applicata live 2026-08-10.
--
-- RATIFICA + ESTENSIONE. Il 2026-08-10, su ordine owner ("tutto deve essere
-- tradotto"), /translate-db ha aggiunto 5 colonne GEO a site_metadata_translations
-- (summary_ai, key_entities, page_essentials, related_queries_geo, seo_keywords)
-- e le ha popolate in ES (25/25 tranne page_essentials). Questa migration:
--   1. RATIFICA quell'ALTER (qui ricostruito idempotente per il replay su ambienti puliti);
--   2. ESTENDE il pattern agli altri sidecar con la regola: il sidecar riceve
--      SOLO i campi GEO presenti sulla sua base (matrice verificata su
--      information_schema il 10/08).
--
-- EMENDAMENTO al contratto (Sidecar_Architecture_2027 regola 7):
--   i campi GEO (summary_ai, key_entities, related_queries_geo, seo_keywords,
--   page_essentials) sono SORGENTE PER LINGUA e SI TRADUCONO nel sidecar.
--   La vecchia regola "i campi AI non si traducono" valeva per una superficie
--   AI solo-inglese, superata dalla strategia GEO multilingua.
--   RESTANO derivati e MAI memorizzati tradotti: json_ld, breadcrumbs,
--   hreflang, sibling_slugs -> generati a render dai campi tradotti +
--   v_translated_slugs (materializzarli = solo via vista o trigger).
--   cherry_prompt/cherry_response restano ESCLUSI dai sidecar (engine EN).

-- Ratifica (idempotente) - gia' applicato live da /translate-db il 10/08:
alter table public.site_metadata_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb,
  add column if not exists page_essentials jsonb,
  add column if not exists related_queries_geo jsonb,
  add column if not exists seo_keywords text[];

-- Set completo (la base ha tutti e 4 i campi):
alter table public.recipes_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb,
  add column if not exists related_queries_geo jsonb,
  add column if not exists seo_keywords text[];
alter table public.culture_sections_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb,
  add column if not exists related_queries_geo jsonb,
  add column if not exists seo_keywords text[];
alter table public.akha_news_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb,
  add column if not exists related_queries_geo jsonb,
  add column if not exists seo_keywords text[];
alter table public.ingredients_library_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb,
  add column if not exists related_queries_geo jsonb,
  add column if not exists seo_keywords text[];
alter table public.content_categories_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb,
  add column if not exists related_queries_geo jsonb,
  add column if not exists seo_keywords text[];

-- Set parziale (la base ha solo summary_ai + key_entities):
alter table public.cooking_classes_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb;
alter table public.page_sections_translations
  add column if not exists summary_ai text,
  add column if not exists key_entities jsonb;

-- NIENTE colonne GEO per: class_sections, spiciness_levels, dietary_profiles,
-- pickup_zones, meeting_points, home_cards_front, quiz_questions,
-- shop_storefront, gallery_items - le basi non le hanno. Non aggiungerle
-- "per simmetria".
