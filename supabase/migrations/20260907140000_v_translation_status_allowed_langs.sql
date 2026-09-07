-- 20260907140000_v_translation_status_allowed_langs.sql
-- /database · 2026-09-07 · seguito di 20260907130000, segnalato da /translate-db come il piu' urgente.
-- STATO: PROPOSTA, non applicata. Su GO: `supabase db query --linked -f <file>` e poi
-- `supabase migration repair --status applied 20260907140000`.
--
-- IL DIFETTO: `v_translation_status` teneva una SECONDA copia cablata delle 11 lingue tradotte
-- in un CTE `VALUES`. Dal 07/09 la lista lato DB e' `public.allowed_langs()` (12, `en` compreso)
-- e alimenta i 24 CHECK `{sidecar}_lang_chk`; `stato-sidecar.mjs` la legge da li'. Finche' la
-- vista ne teneva una propria, la fonte unica non era unica: e' lo stesso difetto appena tolto
-- dallo script, nello stesso giorno, in una vista che nessuno guarda.
--
-- COSA FA: ricrea la vista IDENTICA (corpo generato da pg_get_viewdef del live, una sola riga
-- cambiata) con `langs` = `unnest(public.allowed_langs())` meno `en`, perche' la vista conta le
-- traduzioni ATTESE per lingua e l'inglese e' la base. `with (security_invoker = true)` conserva
-- l'opzione (create or replace view azzera le reloptions). Il caso `legal_documents` (th/es/zh,
-- politica agenzie) resta com'e': non e' la lista del pubblico.
--
-- VERIFICATO PRIMA (2026-09-07): insieme del CTE vecchio = allowed_langs() meno en (11 = 11,
-- IDENTICI); nessun'altra vista o funzione con una lista cablata; baseline dell'output della
-- vista fissata prima dell'applicazione: 242 righe, md5 73a13ac8f5c95ee6447c1cbb21982802.
-- Dopo deve essere IDENTICA: cambia la sorgente della lista, non la lista. Nessun dipendente,
-- nessun lettore nel codice o negli script (solo database.types.ts).
--
-- NOTA, non in questa migration: la vista ha ancora SELECT per anon e authenticated, mentre le
-- tre viste sorelle (pairs, pairs_info, stale) l'hanno perso con advisor_round2 del 02/09.
-- Con security_invoker espone solo cio' che la RLS lascia contare; da uniformare su decisione.
--
-- DA OGGI: la lista delle lingue nel DB e' in UN posto. Chi ne scrive un'altra, in una vista o
-- in una funzione, ricrea il buco.

create or replace view public.v_translation_status with (security_invoker = true) as
 WITH langs(lang) AS (
         SELECT l.l FROM unnest(public.allowed_langs()) l(l) WHERE l.l <> 'en'::text
        ), bases(table_name, base_rows) AS (
         SELECT 'site_metadata'::text AS "?column?",
            count(*) AS count
           FROM site_metadata
        UNION ALL
         SELECT 'page_sections'::text,
            count(*) AS count
           FROM page_sections
        UNION ALL
         SELECT 'home_cards_front'::text,
            count(*) AS count
           FROM home_cards_front
        UNION ALL
         SELECT 'cooking_classes'::text,
            count(*) AS count
           FROM cooking_classes
        UNION ALL
         SELECT 'class_sections'::text,
            count(*) AS count
           FROM class_sections
        UNION ALL
         SELECT 'spiciness_levels'::text,
            count(*) AS count
           FROM spiciness_levels
        UNION ALL
         SELECT 'dietary_profiles'::text,
            count(*) AS count
           FROM dietary_profiles
        UNION ALL
         SELECT 'pickup_zones'::text,
            count(*) AS count
           FROM pickup_zones
        UNION ALL
         SELECT 'meeting_points'::text,
            count(*) AS count
           FROM meeting_points
        UNION ALL
         SELECT 'content_categories'::text,
            count(*) AS count
           FROM content_categories
        UNION ALL
         SELECT 'recipes'::text,
            count(*) AS count
           FROM recipes
        UNION ALL
         SELECT 'culture_sections'::text,
            count(*) AS count
           FROM culture_sections
        UNION ALL
         SELECT 'akha_news'::text,
            count(*) AS count
           FROM akha_news
          WHERE akha_news.is_published
        UNION ALL
         SELECT 'ingredients_library'::text,
            count(*) AS count
           FROM ingredients_library
          WHERE ingredients_library.is_published
        UNION ALL
         SELECT 'quiz_questions'::text,
            count(*) AS count
           FROM quiz_questions
        UNION ALL
         SELECT 'shop_storefront'::text,
            count(*) AS count
           FROM shop_storefront
        UNION ALL
         SELECT 'gallery_items'::text,
            count(*) AS count
           FROM gallery_items
          WHERE gallery_items.quote IS NOT NULL
        UNION ALL
         SELECT 'faq_questions'::text,
            count(*) AS count
           FROM faq_questions
        UNION ALL
         SELECT 'faq_categories'::text,
            count(*) AS count
           FROM faq_categories
        UNION ALL
         SELECT 'info_page_sections'::text,
            count(*) AS count
           FROM info_page_sections
        UNION ALL
         SELECT 'legal_documents'::text,
            count(*) AS count
           FROM legal_documents
        UNION ALL
         SELECT 'herb_teas'::text,
            count(*) AS count
           FROM herb_teas
        ), counts(table_name, lang, translated_rows) AS (
         SELECT 'site_metadata'::text AS "?column?",
            site_metadata_translations.lang,
            count(*) AS count
           FROM site_metadata_translations
          GROUP BY site_metadata_translations.lang
        UNION ALL
         SELECT 'page_sections'::text,
            page_sections_translations.lang,
            count(*) AS count
           FROM page_sections_translations
          GROUP BY page_sections_translations.lang
        UNION ALL
         SELECT 'home_cards_front'::text,
            home_cards_front_translations.lang,
            count(*) AS count
           FROM home_cards_front_translations
          GROUP BY home_cards_front_translations.lang
        UNION ALL
         SELECT 'cooking_classes'::text,
            cooking_classes_translations.lang,
            count(*) AS count
           FROM cooking_classes_translations
          GROUP BY cooking_classes_translations.lang
        UNION ALL
         SELECT 'class_sections'::text,
            class_sections_translations.lang,
            count(*) AS count
           FROM class_sections_translations
          GROUP BY class_sections_translations.lang
        UNION ALL
         SELECT 'spiciness_levels'::text,
            spiciness_levels_translations.lang,
            count(*) AS count
           FROM spiciness_levels_translations
          GROUP BY spiciness_levels_translations.lang
        UNION ALL
         SELECT 'dietary_profiles'::text,
            dietary_profiles_translations.lang,
            count(*) AS count
           FROM dietary_profiles_translations
          GROUP BY dietary_profiles_translations.lang
        UNION ALL
         SELECT 'pickup_zones'::text,
            pickup_zones_translations.lang,
            count(*) AS count
           FROM pickup_zones_translations
          GROUP BY pickup_zones_translations.lang
        UNION ALL
         SELECT 'meeting_points'::text,
            meeting_points_translations.lang,
            count(*) AS count
           FROM meeting_points_translations
          GROUP BY meeting_points_translations.lang
        UNION ALL
         SELECT 'content_categories'::text,
            content_categories_translations.lang,
            count(*) AS count
           FROM content_categories_translations
          GROUP BY content_categories_translations.lang
        UNION ALL
         SELECT 'recipes'::text,
            recipes_translations.lang,
            count(*) AS count
           FROM recipes_translations
          GROUP BY recipes_translations.lang
        UNION ALL
         SELECT 'culture_sections'::text,
            culture_sections_translations.lang,
            count(*) AS count
           FROM culture_sections_translations
          GROUP BY culture_sections_translations.lang
        UNION ALL
         SELECT 'akha_news'::text,
            akha_news_translations.lang,
            count(*) AS count
           FROM akha_news_translations
          GROUP BY akha_news_translations.lang
        UNION ALL
         SELECT 'ingredients_library'::text,
            ingredients_library_translations.lang,
            count(*) AS count
           FROM ingredients_library_translations
          GROUP BY ingredients_library_translations.lang
        UNION ALL
         SELECT 'quiz_questions'::text,
            quiz_questions_translations.lang,
            count(*) AS count
           FROM quiz_questions_translations
          GROUP BY quiz_questions_translations.lang
        UNION ALL
         SELECT 'shop_storefront'::text,
            shop_storefront_translations.lang,
            count(*) AS count
           FROM shop_storefront_translations
          GROUP BY shop_storefront_translations.lang
        UNION ALL
         SELECT 'gallery_items'::text,
            gallery_items_translations.lang,
            count(*) AS count
           FROM gallery_items_translations
          GROUP BY gallery_items_translations.lang
        UNION ALL
         SELECT 'faq_questions'::text,
            faq_questions_translations.lang,
            count(*) AS count
           FROM faq_questions_translations
          GROUP BY faq_questions_translations.lang
        UNION ALL
         SELECT 'faq_categories'::text,
            faq_categories_translations.lang,
            count(*) AS count
           FROM faq_categories_translations
          GROUP BY faq_categories_translations.lang
        UNION ALL
         SELECT 'info_page_sections'::text,
            info_page_sections_translations.lang,
            count(*) AS count
           FROM info_page_sections_translations
          GROUP BY info_page_sections_translations.lang
        UNION ALL
         SELECT 'legal_documents'::text,
            legal_documents_translations.lang,
            count(*) AS count
           FROM legal_documents_translations
          GROUP BY legal_documents_translations.lang
        UNION ALL
         SELECT 'herb_teas'::text,
            herb_teas_translations.lang,
            count(*) AS count
           FROM herb_teas_translations
          GROUP BY herb_teas_translations.lang
        ), expected(table_name, lang) AS (
         SELECT b_1.table_name,
            l.lang
           FROM bases b_1
             CROSS JOIN langs l
          WHERE b_1.table_name <> 'legal_documents'::text
        UNION ALL
         SELECT 'legal_documents'::text,
            x.v
           FROM ( VALUES ('th'::text), ('es'::text), ('zh'::text)) x(v)
        ), pairs AS (
         SELECT expected.table_name,
            expected.lang
           FROM expected
        UNION
         SELECT counts.table_name,
            counts.lang
           FROM counts
        )
 SELECT p.table_name,
    p.lang,
    COALESCE(c.translated_rows, 0::bigint) AS translated_rows,
    b.base_rows,
    round(100.0 * COALESCE(c.translated_rows, 0::bigint)::numeric / NULLIF(b.base_rows, 0)::numeric) AS pct,
    COALESCE(c.translated_rows, 0::bigint) >= b.base_rows AS complete,
    (EXISTS ( SELECT 1
           FROM expected e
          WHERE e.table_name = p.table_name AND e.lang = p.lang)) AS in_matrix
   FROM pairs p
     JOIN bases b USING (table_name)
     LEFT JOIN counts c USING (table_name, lang);
;

comment on view public.v_translation_status is
  'Matrice tabella x lingua: righe tradotte vs righe base, completezza, in_matrix. Lingue attese = public.allowed_langs() meno en (dal 2026-09-07: prima una copia cablata). legal_documents: politica agenzie th/es/zh.';

-- VERIFICA DOPO (attesi):
-- select md5(string_agg(t::text, '|' order by table_name, lang)) from public.v_translation_status t;  -> 73a13ac8f5c95ee6447c1cbb21982802
-- select count(*) from public.v_translation_status;                                                   -> 242
-- select reloptions from pg_class where relname = 'v_translation_status';                              -> {security_invoker=true}
-- select pg_get_viewdef('public.v_translation_status'::regclass, true) ~ 'allowed_langs';             -> true
-- select count(*) from pg_views where schemaname='public' and definition ~ '''es''::text.*''fr''::text'; -> 0
-- salute A-F -> 0
