-- media_usage: seconda iterazione di refresh_media_usage() (gate #184, 2026-09-04).
--
-- La prima versione (20260904204332) censiva cover, gallery e foto nel contenuto
-- di culture/ricette/news/pagine/ingredienti. Il gate ha misurato ~350 coppie
-- immagine+pagina che il front RENDERIZZA su pagine indicizzabili e che la funzione
-- non vedeva. Si aggiungono qui, con la stessa regola di prima: solo pagine
-- indicizzabili, solo asset con image_url, una riga per (immagine, pagina).
--
-- NUOVE SORGENTI
--   recipes:ingredients  la griglia ingredienti dentro ogni ricetta
--                        (recipe_key_ingredients -> ingredients_library.image_asset_id,
--                        IngredientsGrid.tsx; ~295 coppie su 22 ricette)
--   home:cards           le card della home (home_cards_front.is_active, 8 foto)
--   page_sections        le sezioni con foto delle pagine home/classi/quiz
--                        (13 foto; `shared` escluso: non e' una pagina)
--   categories:cover     le cover delle categorie ricette (hub ricette) e quiz (hub quiz)
--   faq:gallery          le 42 foto delle categorie FAQ, montate su /cooking-class-faq-chiang-mai
--
-- ESCLUSI, di proposito: avatar autori e avatar FAQ (decorativi, generici), foto
-- spiciness_levels e dietary_profiles (mostrate solo dopo un'interazione).

CREATE OR REPLACE FUNCTION public.refresh_media_usage()
RETURNS TABLE (righe bigint, pagine bigint, immagini bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM media_usage;

  INSERT INTO media_usage (asset_id, page_url, role, source)
  WITH base AS (
    -- culture: cover
    SELECT c.cover_asset_id AS asset_id,
           'https://www.thaiakha.com/akha-culture-highland-heritage/'||c.slug AS page_url,
           'cover' AS role, 'culture' AS source, 1 AS pri
    FROM culture_sections c
    WHERE c.is_published AND c.cover_asset_id IS NOT NULL

    -- culture: blocchi {"type":"photo","assetId":"..."} dentro content (text)
    UNION ALL
    SELECT m[1], 'https://www.thaiakha.com/akha-culture-highland-heritage/'||c.slug,
           'in_content', 'culture:content', 3
    FROM culture_sections c
    CROSS JOIN LATERAL regexp_matches(c.content, '"assetId"\s*:\s*"([^"]+)"', 'g') AS m
    WHERE c.is_published

    -- culture: gallery (gallery_id = slug della sezione)
    UNION ALL
    SELECT g.asset_id, 'https://www.thaiakha.com/akha-culture-highland-heritage/'||c.slug,
           'gallery', 'culture:gallery', 2
    FROM gallery_items g
    JOIN culture_sections c ON c.slug = g.gallery_id
    WHERE c.is_published

    -- ricette: cover
    UNION ALL
    SELECT r.cover_asset_id, 'https://www.thaiakha.com/authentic-thai-akha-recipes/'||r.slug,
           'cover', 'recipes', 1
    FROM recipes r
    WHERE r.is_published AND r.cover_asset_id IS NOT NULL

    -- ricette: gallery (due chiavi per ricetta)
    UNION ALL
    SELECT g.asset_id, 'https://www.thaiakha.com/authentic-thai-akha-recipes/'||r.slug,
           'gallery', 'recipes:gallery', 2
    FROM gallery_items g
    JOIN recipes r ON g.gallery_id IN ('recipe_'||r.slug, 'recipe_'||r.slug||'_culture')
    WHERE r.is_published

    -- NUOVO ricette: griglia ingredienti (foto della scheda ingrediente dentro la ricetta)
    UNION ALL
    SELECT i.image_asset_id, 'https://www.thaiakha.com/authentic-thai-akha-recipes/'||r.slug,
           'in_content', 'recipes:ingredients', 3
    FROM recipe_key_ingredients k
    JOIN recipes r ON r.id = k.recipe_id
    JOIN ingredients_library i ON i.id = k.ingredient_id
    WHERE r.is_published AND i.image_asset_id IS NOT NULL

    -- news: cover
    UNION ALL
    SELECT n.cover_asset_id, 'https://www.thaiakha.com/thai-cooking-tips-news/'||n.slug,
           'cover', 'news', 1
    FROM akha_news n
    WHERE n.is_published AND n.cover_asset_id IS NOT NULL

    -- news: foto nel contenuto
    UNION ALL
    SELECT m[1], 'https://www.thaiakha.com/thai-cooking-tips-news/'||n.slug,
           'in_content', 'news:content', 3
    FROM akha_news n
    CROSS JOIN LATERAL regexp_matches(n.content, '"assetId"\s*:\s*"([^"]+)"', 'g') AS m
    WHERE n.is_published

    -- pagine: cover, escluse le noindex
    UNION ALL
    SELECT sm.cover_asset_id,
           CASE WHEN sm.page_slug = 'home'
                THEN 'https://www.thaiakha.com/'
                ELSE 'https://www.thaiakha.com/'||sm.page_slug END,
           'cover', 'site_metadata', 1
    FROM site_metadata sm
    WHERE sm.cover_asset_id IS NOT NULL
      AND coalesce(sm.seo_robots, '') NOT ILIKE '%noindex%'

    -- NUOVO pagine: sezioni con foto (home/classi/quiz); `shared` non e' una pagina
    UNION ALL
    SELECT ps.image_asset_id,
           CASE WHEN ps.page_slug = 'home'
                THEN 'https://www.thaiakha.com/'
                ELSE 'https://www.thaiakha.com/'||ps.page_slug END,
           'in_content', 'page_sections', 3
    FROM page_sections ps
    JOIN site_metadata sm ON sm.page_slug = ps.page_slug
    WHERE ps.image_asset_id IS NOT NULL
      AND ps.page_slug <> 'shared'
      AND coalesce(sm.seo_robots, '') NOT ILIKE '%noindex%'

    -- NUOVO home: card
    UNION ALL
    SELECT h.image_asset_id, 'https://www.thaiakha.com/', 'in_content', 'home:cards', 3
    FROM home_cards_front h
    WHERE h.is_active AND h.image_asset_id IS NOT NULL

    -- ingredienti: foto della scheda
    UNION ALL
    SELECT i.image_asset_id, 'https://www.thaiakha.com/thai-cooking-ingredients/'||i.slug,
           'cover', 'ingredients', 1
    FROM ingredients_library i
    WHERE i.is_visible_public AND i.is_published AND i.image_asset_id IS NOT NULL

    -- categorie ingrediente: cover (hanno una pagina propria)
    UNION ALL
    SELECT cc.cover_asset_id, 'https://www.thaiakha.com/thai-cooking-ingredients/'||cc.id,
           'cover', 'ingredients:category', 1
    FROM content_categories cc
    WHERE cc.domain = 'ingredient' AND cc.cover_asset_id IS NOT NULL

    -- NUOVO categorie ricette e quiz: cover, rese sull'hub (non hanno pagina propria)
    UNION ALL
    SELECT cc.cover_asset_id,
           CASE WHEN cc.domain = 'recipe'
                THEN 'https://www.thaiakha.com/authentic-thai-akha-recipes'
                ELSE 'https://www.thaiakha.com/akha-wisdom-path-quiz' END,
           'in_content', 'categories:cover', 3
    FROM content_categories cc
    WHERE cc.domain IN ('recipe', 'quiz') AND cc.cover_asset_id IS NOT NULL

    -- NUOVO FAQ: gallery delle categorie sulla pagina FAQ
    UNION ALL
    SELECT fc.image_asset_id, 'https://www.thaiakha.com/cooking-class-faq-chiang-mai',
           'gallery', 'faq:gallery', 2
    FROM faq_categories fc
    WHERE fc.is_active AND fc.image_asset_id IS NOT NULL

    -- pagine classe: gallery
    UNION ALL
    SELECT g.asset_id,
           CASE WHEN g.gallery_id LIKE 'class_morning%'
                THEN 'https://www.thaiakha.com/morning-cooking-class-market-tour'
                ELSE 'https://www.thaiakha.com/evening-cooking-class-dinner' END,
           'gallery', 'classes:gallery', 2
    FROM gallery_items g
    WHERE g.gallery_id LIKE 'class_%'
  )
  -- una sola riga per (immagine, pagina): vince cover, poi gallery, poi in_content
  SELECT DISTINCT ON (b.asset_id, b.page_url) b.asset_id, b.page_url, b.role, b.source
  FROM base b
  JOIN media_assets m ON m.asset_id = b.asset_id AND m.image_url IS NOT NULL
  ORDER BY b.asset_id, b.page_url, b.pri;

  RETURN QUERY
  SELECT count(*), count(DISTINCT page_url), count(DISTINCT asset_id) FROM media_usage;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_media_usage() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.refresh_media_usage() IS
  'Ricostruisce media_usage da tutte le sorgenti pubblicate (v2: + ingredienti nelle ricette, card home, page_sections, cover categorie ricette/quiz, gallery FAQ). Alimenta la edge function sitemap-images. Cron notturno media-usage-refresh-nightly.';
