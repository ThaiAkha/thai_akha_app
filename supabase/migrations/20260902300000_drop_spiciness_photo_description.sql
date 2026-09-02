-- #148 · spiciness_levels: drop photo_description (madre + sidecar)
-- Duplicava media_assets.alt_text dei 5 asset news-15-photo01..05 (5/5 identici,
-- verificato live 2026-09-02); nessun service/componente la legge (solo tipi generati).
-- L'alt della foto vive in media_assets e arriva alla UI via l'embed photo:media_assets.

alter table public.spiciness_levels drop column if exists photo_description;
alter table public.spiciness_levels_translations drop column if exists photo_description;

-- Il set di colonne traducibili e' schema-derived (translatable_columns): il drop
-- cambia l'insieme e invaliderebbe tutti i source_hash. Il contenuto madre restante
-- e' invariato, quindi le traduzioni sono ancora buone: ri-fissa gli hash.
select public.translation_mark_fresh('spiciness_levels_translations');
