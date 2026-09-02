-- #133 · Embedding semantic_vector rigenerato on-write (prima: solo backfill una tantum #71).
-- Meccanica in due pezzi, zero modifiche all'edge generate-embeddings:
--   1. trigger per tabella: se cambia un campo sorgente dell'embedding, il vettore
--      viene azzerato (NULL = "stale": e' esattamente cio' che l'edge seleziona).
--   2. cron orario: se esistono righe stale, un net.http_post richiama l'edge
--      generate-embeddings {"table":"all","batchSize":100} (pattern market/agency tick).
-- I campi sorgente per tabella sono la copia 1:1 della config TABLES dell'edge
-- (supabase/functions/generate-embeddings/index.ts): se l'edge cambia, cambiare anche qui.

-- ── 1. Trigger generico ──────────────────────────────────────────────────────
create or replace function public.mark_semantic_stale()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  col text;
begin
  -- Chi scrive esplicitamente il vettore (l'edge) non va mai sovrascritto.
  if new.semantic_vector is distinct from old.semantic_vector then
    return new;
  end if;
  foreach col in array tg_argv loop
    if to_jsonb(new) -> col is distinct from to_jsonb(old) -> col then
      new.semantic_vector := null;
      return new;
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_semantic_stale on public.site_metadata;
create trigger trg_semantic_stale before update on public.site_metadata
  for each row execute function public.mark_semantic_stale('seo_title', 'seo_description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.recipes;
create trigger trg_semantic_stale before update on public.recipes
  for each row execute function public.mark_semantic_stale('name', 'description', 'seo_description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.culture_sections;
create trigger trg_semantic_stale before update on public.culture_sections
  for each row execute function public.mark_semantic_stale('title', 'subtitle', 'seo_description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.akha_news;
create trigger trg_semantic_stale before update on public.akha_news
  for each row execute function public.mark_semantic_stale('title', 'excerpt', 'seo_description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.ingredients_library;
create trigger trg_semantic_stale before update on public.ingredients_library
  for each row execute function public.mark_semantic_stale('name_en', 'name_th', 'description', 'seo_description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.content_categories;
create trigger trg_semantic_stale before update on public.content_categories
  for each row execute function public.mark_semantic_stale('title', 'subtitle', 'description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.cooking_classes;
create trigger trg_semantic_stale before update on public.cooking_classes
  for each row execute function public.mark_semantic_stale('title', 'tagline', 'description', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.media_assets;
create trigger trg_semantic_stale before update on public.media_assets
  for each row execute function public.mark_semantic_stale('title', 'alt_text', 'caption', 'tags', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.audio_assets;
create trigger trg_semantic_stale before update on public.audio_assets
  for each row execute function public.mark_semantic_stale('title', 'caption', 'transcript', 'summary_ai');

drop trigger if exists trg_semantic_stale on public.page_sections;
create trigger trg_semantic_stale before update on public.page_sections
  for each row execute function public.mark_semantic_stale('title', 'subtitle', 'highlight', 'description', 'summary_ai');

-- ── 2. Config + tick + cron ──────────────────────────────────────────────────
-- Stesso pattern di private.market_cron_config: la chiave NON vive nella migration,
-- si inserisce a mano dopo il deploy (vedi runbook). L'anon key basta: l'edge
-- richiede solo un JWT valido e usa la service key internamente.
create table if not exists private.embeddings_cron_config (
  id boolean primary key default true check (id),
  enabled boolean not null default true,
  edge_url text not null default '',
  anon_key text not null default ''
);

create or replace function private.embeddings_refresh_tick()
returns void
language plpgsql
security definer
set search_path = private, public, net
as $$
declare
  cfg private.embeddings_cron_config;
  has_stale boolean;
begin
  select * into cfg from private.embeddings_cron_config where id;
  if not found or not cfg.enabled or cfg.edge_url = '' or cfg.anon_key = '' then
    return;
  end if;

  select exists (select 1 from public.site_metadata where semantic_vector is null)
      or exists (select 1 from public.recipes where semantic_vector is null)
      or exists (select 1 from public.culture_sections where semantic_vector is null)
      or exists (select 1 from public.akha_news where semantic_vector is null)
      or exists (select 1 from public.ingredients_library where semantic_vector is null)
      or exists (select 1 from public.content_categories where semantic_vector is null)
      or exists (select 1 from public.cooking_classes where semantic_vector is null)
      or exists (select 1 from public.media_assets where semantic_vector is null)
      or exists (select 1 from public.audio_assets where semantic_vector is null)
      or exists (select 1 from public.page_sections where semantic_vector is null)
    into has_stale;
  if not has_stale then
    return;
  end if;

  perform net.http_post(
    url := cfg.edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || cfg.anon_key),
    body := jsonb_build_object('table', 'all', 'batchSize', 100));
end;
$$;

revoke all on function private.embeddings_refresh_tick() from public, anon, authenticated;

-- Ogni ora al minuto 7: una riga modificata torna embeddizzata entro l'ora.
-- Un batch da 100 per tick: piu' di 100 righe stale convergono nei tick successivi.
select cron.schedule('embeddings-refresh-hourly', '7 * * * *', 'select private.embeddings_refresh_tick()');
