-- media_usage: da tabella riempita a mano a rinfresco ripetibile.
--
-- PERCHE'. media_usage alimenta la edge function `sitemap-images` (un <image:loc>
-- per ogni immagine di ogni pagina). Fino al 2026-09-04 era stata popolata UNA
-- VOLTA, con un backfill manuale dell'08/06, e nessuno script sapeva rifarla:
-- copriva 67 pagine su 267, ignorava del tutto le 192 pagine ingrediente nate
-- dopo, e su 19 righe dichiarava una foto SBAGLIATA (la home diceva ancora
-- `news-00-photo03`, le 4 ricette-pasta le foto pre-rifacimento).
--
-- Da qui in avanti: `select refresh_media_usage();` e la tabella torna vera.
-- Chiamarla dopo ogni cambio di cover, gallery o pubblicazione.
--
-- COSA INCLUDE (una riga per coppia immagine+pagina, deduplicata):
--   culture   cover · foto nel contenuto · gallery
--   recipes   cover · gallery (chiavi `recipe_<slug>` e `recipe_<slug>_culture`)
--   news      cover · foto nel contenuto        [solo is_published]
--   pagine    cover da site_metadata            [escluse le noindex]
--   ingredienti  foto della scheda              [solo is_visible_public + is_published]
--   categorie ingrediente  cover
--   pagine classe  gallery `class_morning_*` e `class_evening_*`
--
-- COSA ESCLUDE, di proposito: contenuti non pubblicati (oggi 9 bozze news),
-- pagine noindex (auth, user*, menu*, privacy, terms), asset senza image_url.
-- Un'immagine dichiarata su una pagina che Google non deve indicizzare e' un
-- invito a indicizzarla.

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

    -- ingredienti: foto della scheda
    UNION ALL
    SELECT i.image_asset_id, 'https://www.thaiakha.com/thai-cooking-ingredients/'||i.slug,
           'cover', 'ingredients', 1
    FROM ingredients_library i
    WHERE i.is_visible_public AND i.is_published AND i.image_asset_id IS NOT NULL

    -- categorie ingrediente: cover
    UNION ALL
    SELECT cc.cover_asset_id, 'https://www.thaiakha.com/thai-cooking-ingredients/'||cc.id,
           'cover', 'ingredients:category', 1
    FROM content_categories cc
    WHERE cc.domain = 'ingredient' AND cc.cover_asset_id IS NOT NULL

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
  'Ricostruisce media_usage da tutte le sorgenti pubblicate. Alimenta la edge function sitemap-images. Eseguire dopo cambi di cover, gallery o pubblicazioni.';
