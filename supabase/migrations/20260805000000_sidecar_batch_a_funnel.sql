-- 20260805000000_sidecar_batch_a_funnel.sql
-- Batch A del progetto multilingua: 9 sidecar {tabella}_translations per il
-- FUNNEL DI PRENOTAZIONE front. Applicata live il 2026-08-05 su GO owner.
-- Progetto completo: brain 750_Data_Content/DB_Translation_2027/Sidecar_Architecture_2027.md
--
-- Contratto (uguale per tutte):
--   {entity}_id col TIPO ESATTO della PK base (text/uuid/integer - MISTI, mai copia-incolla)
--   lang text (convenzione unica; le 3 tabelle storiche a `language` restano
--   in attesa di GO separato per il rename)
--   unique({entity}_id, lang) - on delete cascade - human_reviewed (flusso
--   macchina-traduce/umano-rivede, pattern legal_documents_translations)
--   EN SEMPRE sulla base: nel sidecar solo le altre lingue, fallback = riga base.
--   RLS: front pubblico -> read `using(true)` (le pagine le legge anon),
--   write is_admin(). NON usare per tabelle staff (quelle vanno authenticated).
--   NIENTE campi AI (summary_ai, cherry_*, key_entities) ne' json_ld: EN/generati.
--   jsonb con testo utente (bullets, cards, highlights, schedule_items,
--   inclusions): tradotti A BLOCCO INTERO, fallback tutto-o-niente.

create table if not exists public.site_metadata_translations (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_metadata(id) on delete cascade,
  lang text not null,
  header_title_main text, header_title_highlight text, header_badge text,
  page_description text, menu_label text,
  seo_title text, seo_description text, og_title text, og_description text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (page_id, lang)
);
alter table public.site_metadata_translations enable row level security;
create policy smt_read  on public.site_metadata_translations for select using (true);
create policy smt_write on public.site_metadata_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.page_sections_translations (
  id uuid primary key default gen_random_uuid(),
  section_id text not null references public.page_sections(section_id) on delete cascade,
  lang text not null,
  tag_badge text, title text, highlight text, subtitle text, description text,
  button_text text, bullets jsonb, cards jsonb,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (section_id, lang)
);
alter table public.page_sections_translations enable row level security;
create policy pst_read  on public.page_sections_translations for select using (true);
create policy pst_write on public.page_sections_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.home_cards_front_translations (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.home_cards_front(id) on delete cascade,
  lang text not null,
  title text, description text, link_label text,
  suffix_extra_1 text, extra_1 text, suffix_extra_2 text, extra_2 text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (card_id, lang)
);
alter table public.home_cards_front_translations enable row level security;
create policy hcft_read  on public.home_cards_front_translations for select using (true);
create policy hcft_write on public.home_cards_front_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.cooking_classes_translations (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.cooking_classes(id) on delete cascade,
  lang text not null,
  title text, badge text, tagline text, capacity_text text, duration_text text,
  description text, highlights jsonb, schedule_items jsonb, inclusions jsonb,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (class_id, lang)
);
alter table public.cooking_classes_translations enable row level security;
create policy cct_read  on public.cooking_classes_translations for select using (true);
create policy cct_write on public.cooking_classes_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.class_sections_translations (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.class_sections(id) on delete cascade,
  lang text not null,
  title text, subtitle text, description text, tag_badge text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (section_id, lang)
);
alter table public.class_sections_translations enable row level security;
create policy cst_read  on public.class_sections_translations for select using (true);
create policy cst_write on public.class_sections_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.spiciness_levels_translations (
  id uuid primary key default gen_random_uuid(),
  level_id integer not null references public.spiciness_levels(id) on delete cascade,
  lang text not null,
  title text, subtitle text, description text, label text,
  photo_description text, philosophy_quote text, chef_note text, akha_connection text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (level_id, lang)
);
alter table public.spiciness_levels_translations enable row level security;
create policy slt_read  on public.spiciness_levels_translations for select using (true);
create policy slt_write on public.spiciness_levels_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.dietary_profiles_translations (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.dietary_profiles(id) on delete cascade,
  lang text not null,
  name text, introduction text, experience text, description_long text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (profile_id, lang)
);
alter table public.dietary_profiles_translations enable row level security;
create policy dpt_read  on public.dietary_profiles_translations for select using (true);
create policy dpt_write on public.dietary_profiles_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.pickup_zones_translations (
  id uuid primary key default gen_random_uuid(),
  zone_id text not null references public.pickup_zones(id) on delete cascade,
  lang text not null,
  name text, description text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (zone_id, lang)
);
alter table public.pickup_zones_translations enable row level security;
create policy pzt_read  on public.pickup_zones_translations for select using (true);
create policy pzt_write on public.pickup_zones_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.meeting_points_translations (
  id uuid primary key default gen_random_uuid(),
  point_id text not null references public.meeting_points(id) on delete cascade,
  lang text not null,
  name text, description text, dropoff_description text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (point_id, lang)
);
alter table public.meeting_points_translations enable row level security;
create policy mpt_read  on public.meeting_points_translations for select using (true);
create policy mpt_write on public.meeting_points_translations for all using (is_admin()) with check (is_admin());
