-- 20260817000100_v_translation_status_matrix.sql
-- v_translation_status v2: il tabellone mostra anche le combinazioni A ZERO.
-- Matrice attesa (085_02_Flow, politica lingue owner 2026-08-11): 11 lingue target
-- (12 del pubblico meno EN, che vive sulla base) per tutto il mondo B, TRANNE
-- legal_documents = docs agency → th/es/zh. `in_matrix=false` = lingua fuori
-- politica (hi/ms legacy), visibile ma non conteggiata.
-- Operativa: select * from v_translation_status where in_matrix and not complete;
-- Misura al 2026-08-17: 234 attese · 67 complete · 167 incomplete · ~19.639 righe mancanti.
create or replace view public.v_translation_status
with (security_invoker = true) as
with langs(lang) as (
  values ('es'),('fr'),('de'),('pt'),('it'),('nl'),('ca'),('th'),('zh'),('ja'),('ko')
),
bases(table_name, base_rows) as (
  select 'site_metadata', count(*) from site_metadata
  union all select 'page_sections', count(*) from page_sections
  union all select 'home_cards_front', count(*) from home_cards_front
  union all select 'cooking_classes', count(*) from cooking_classes
  union all select 'class_sections', count(*) from class_sections
  union all select 'spiciness_levels', count(*) from spiciness_levels
  union all select 'dietary_profiles', count(*) from dietary_profiles
  union all select 'pickup_zones', count(*) from pickup_zones
  union all select 'meeting_points', count(*) from meeting_points
  union all select 'content_categories', count(*) from content_categories
  union all select 'recipes', count(*) from recipes
  union all select 'culture_sections', count(*) from culture_sections
  union all select 'akha_news', count(*) from akha_news where is_published
  union all select 'ingredients_library', count(*) from ingredients_library where is_published
  union all select 'quiz_questions', count(*) from quiz_questions
  union all select 'shop_storefront', count(*) from shop_storefront
  union all select 'gallery_items', count(*) from gallery_items where quote is not null
  union all select 'faq_questions', count(*) from faq_questions
  union all select 'faq_categories', count(*) from faq_categories
  union all select 'info_page_sections', count(*) from info_page_sections
  union all select 'legal_documents', count(*) from legal_documents
  union all select 'herb_teas', count(*) from herb_teas
),
counts(table_name, lang, translated_rows) as (
  select 'site_metadata', lang, count(*) from site_metadata_translations group by lang
  union all select 'page_sections', lang, count(*) from page_sections_translations group by lang
  union all select 'home_cards_front', lang, count(*) from home_cards_front_translations group by lang
  union all select 'cooking_classes', lang, count(*) from cooking_classes_translations group by lang
  union all select 'class_sections', lang, count(*) from class_sections_translations group by lang
  union all select 'spiciness_levels', lang, count(*) from spiciness_levels_translations group by lang
  union all select 'dietary_profiles', lang, count(*) from dietary_profiles_translations group by lang
  union all select 'pickup_zones', lang, count(*) from pickup_zones_translations group by lang
  union all select 'meeting_points', lang, count(*) from meeting_points_translations group by lang
  union all select 'content_categories', lang, count(*) from content_categories_translations group by lang
  union all select 'recipes', lang, count(*) from recipes_translations group by lang
  union all select 'culture_sections', lang, count(*) from culture_sections_translations group by lang
  union all select 'akha_news', lang, count(*) from akha_news_translations group by lang
  union all select 'ingredients_library', lang, count(*) from ingredients_library_translations group by lang
  union all select 'quiz_questions', lang, count(*) from quiz_questions_translations group by lang
  union all select 'shop_storefront', lang, count(*) from shop_storefront_translations group by lang
  union all select 'gallery_items', lang, count(*) from gallery_items_translations group by lang
  union all select 'faq_questions', lang, count(*) from faq_questions_translations group by lang
  union all select 'faq_categories', lang, count(*) from faq_categories_translations group by lang
  union all select 'info_page_sections', lang, count(*) from info_page_sections_translations group by lang
  union all select 'legal_documents', lang, count(*) from legal_documents_translations group by lang
  union all select 'herb_teas', lang, count(*) from herb_teas_translations group by lang
),
expected(table_name, lang) as (
  select b.table_name, l.lang from bases b cross join langs l where b.table_name <> 'legal_documents'
  union all
  select 'legal_documents', v from (values ('th'),('es'),('zh')) x(v)
),
pairs as (
  select table_name, lang from expected
  union
  select table_name, lang from counts
)
select p.table_name, p.lang,
  coalesce(c.translated_rows, 0) as translated_rows,
  b.base_rows,
  round(100.0 * coalesce(c.translated_rows,0) / nullif(b.base_rows,0)) as pct,
  (coalesce(c.translated_rows,0) >= b.base_rows) as complete,
  exists (select 1 from expected e where e.table_name=p.table_name and e.lang=p.lang) as in_matrix
from pairs p
join bases b using (table_name)
left join counts c using (table_name, lang);
grant select on public.v_translation_status to anon, authenticated;
