-- 20260810001000_v_translation_status.sql
-- Tabellone avanzamento traduzioni: una riga per (tabella, lingua) con
-- translated_rows / base_rows / pct / complete. Serve la strategia owner
-- "tabella per tabella, tutte le lingue, passo passo" (lancio 2027, router spento).
-- Basi filtrate dove serve: akha_news/ingredients solo is_published,
-- gallery_items solo quote not null. security_invoker: eredita RLS public-read.
-- Query tipo: select * from v_translation_status where not complete order by table_name, lang;
create or replace view public.v_translation_status
with (security_invoker = true) as
with s as (
  select 'site_metadata' t, lang, count(*) n, (select count(*) from site_metadata) base from site_metadata_translations group by lang
  union all select 'page_sections', lang, count(*), (select count(*) from page_sections) from page_sections_translations group by lang
  union all select 'home_cards_front', lang, count(*), (select count(*) from home_cards_front) from home_cards_front_translations group by lang
  union all select 'cooking_classes', lang, count(*), (select count(*) from cooking_classes) from cooking_classes_translations group by lang
  union all select 'class_sections', lang, count(*), (select count(*) from class_sections) from class_sections_translations group by lang
  union all select 'spiciness_levels', lang, count(*), (select count(*) from spiciness_levels) from spiciness_levels_translations group by lang
  union all select 'dietary_profiles', lang, count(*), (select count(*) from dietary_profiles) from dietary_profiles_translations group by lang
  union all select 'pickup_zones', lang, count(*), (select count(*) from pickup_zones) from pickup_zones_translations group by lang
  union all select 'meeting_points', lang, count(*), (select count(*) from meeting_points) from meeting_points_translations group by lang
  union all select 'content_categories', lang, count(*), (select count(*) from content_categories) from content_categories_translations group by lang
  union all select 'recipes', lang, count(*), (select count(*) from recipes) from recipes_translations group by lang
  union all select 'culture_sections', lang, count(*), (select count(*) from culture_sections) from culture_sections_translations group by lang
  union all select 'akha_news', lang, count(*), (select count(*) from akha_news where is_published) from akha_news_translations group by lang
  union all select 'ingredients_library', lang, count(*), (select count(*) from ingredients_library where is_published) from ingredients_library_translations group by lang
  union all select 'quiz_questions', lang, count(*), (select count(*) from quiz_questions) from quiz_questions_translations group by lang
  union all select 'shop_storefront', lang, count(*), (select count(*) from shop_storefront) from shop_storefront_translations group by lang
  union all select 'gallery_items', lang, count(*), (select count(*) from gallery_items where quote is not null) from gallery_items_translations group by lang
  union all select 'faq_questions', lang, count(*), (select count(*) from faq_questions) from faq_questions_translations group by lang
  union all select 'faq_categories', lang, count(*), (select count(*) from faq_categories) from faq_categories_translations group by lang
  union all select 'info_page_sections', lang, count(*), (select count(*) from info_page_sections) from info_page_sections_translations group by lang
  union all select 'legal_documents', lang, count(*), (select count(*) from legal_documents) from legal_documents_translations group by lang
  union all select 'herb_teas', lang, count(*), (select count(*) from herb_teas) from herb_teas_translations group by lang
)
select t as table_name, lang, n as translated_rows, base as base_rows,
  round(100.0*n/nullif(base,0)) as pct,
  (n >= base) as complete
from s;
grant select on public.v_translation_status to anon, authenticated;
