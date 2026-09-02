-- #144 (residui): akha_news.og_image era il residuo legacy del pattern URL.
-- og:image deriva da cover_asset_id (manuale 06151 §2); nessuna select/vista/funzione la legge.
alter table public.akha_news drop column if exists og_image;
