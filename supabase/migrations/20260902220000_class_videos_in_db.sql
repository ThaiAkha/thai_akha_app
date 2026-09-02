-- #117 - Video delle classi in DB.
-- ClassOverview aveva 3 id YouTube cablati nel .tsx (sezione "Kitchen Spirit", class-03).
-- Realta' dei contenuti (verificata via oEmbed): 2 video di classe + 1 video di pagina:
--   m3Sag54Scv0 = Local Market Tour            -> morning_class (il market tour e' della morning)
--   j7kN7fw5OfY = Live The Experience           -> evening_class
--   xrkjHUSCAN0 = Meet Cherry, how to book      -> NON e' di una classe: e' della sezione class-03
-- Modello:
--   cooking_classes.youtube_video_id  -> video della singola classe (dispatch #117),
--     letto da ClassOverview e disponibile alle pagine classe (fallback = nessun video).
--   page_sections.youtube_video_id    -> video proprio di una sezione CMS, gemello degli
--     esistenti image_asset_id / audio_asset_id sulla stessa tabella.
-- Sempre solo id YouTube (mai URL). NULL = nessun video.

alter table public.cooking_classes add column if not exists youtube_video_id text;
comment on column public.cooking_classes.youtube_video_id is
  'Id YouTube del video della classe (solo id, non URL). NULL = nessun video. #117';

alter table public.page_sections add column if not exists youtube_video_id text;
comment on column public.page_sections.youtube_video_id is
  'Id YouTube del video della sezione (gemello di image_asset_id/audio_asset_id). NULL = nessun video. #117';

update public.cooking_classes set youtube_video_id = 'm3Sag54Scv0' where id = 'morning_class';
update public.cooking_classes set youtube_video_id = 'j7kN7fw5OfY' where id = 'evening_class';
update public.page_sections set youtube_video_id = 'xrkjHUSCAN0'
  where section_id = 'class-03' and page_slug = 'thai-cooking-classes-chiang-mai';

-- Rollback:
--   alter table public.cooking_classes drop column youtube_video_id;
--   alter table public.page_sections  drop column youtube_video_id;
