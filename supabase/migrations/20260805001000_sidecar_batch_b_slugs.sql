-- 20260805001000_sidecar_batch_b_slugs.sql
-- Batch B del progetto multilingua + SLUG TRADOTTI. Applicata live 2026-08-05 su GO owner.
-- Goal owner: app front con tutte le tabelle tradotte, slug tradotti, link interni
-- con slug tradotti (primo consumatore: i link dentro le FAQ, via /faq).
-- Progetto: brain 750_Data_Content/DB_Translation_2027/Sidecar_Architecture_2027.md
--
-- ADDENDUM AL CONTRATTO (slug):
--   le tabelle con URL propria portano `slug` nel sidecar, nullable
--   (traduzione puo' esistere prima dello slug; il router ricade sull'EN),
--   con unique parziale (lang, slug) where slug is not null.
--   Registro unico: vista v_translated_slugs (entity_type, slug_en, lang,
--   slug_translated) - security_invoker, eredita la RLS public-read.
--   Consumatori: router front + riscrittura link /faq.
-- Tabelle SENZA slug (per scelta): quiz_questions, shop_storefront, gallery_items
-- (nessuna URL propria).

-- ALTER Batch A: site_metadata e' l'unica tabella A con URL propria
alter table public.site_metadata_translations add column if not exists page_slug text;
create unique index if not exists site_metadata_tr_lang_slug_uq
  on public.site_metadata_translations (lang, page_slug) where page_slug is not null;

create table if not exists public.recipes_translations (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null references public.recipes(id) on delete cascade,
  lang text not null,
  slug text,
  name text, subtitle text, description text, excerpt text,
  health_benefits text, garnish text, cooks_tip text, notes text, author_note text, servings text,
  seo_title text, seo_description text, og_title text, og_description text,
  directions jsonb, essentials jsonb, dietary_variants jsonb,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (recipe_id, lang)
);
create unique index if not exists recipes_tr_lang_slug_uq on public.recipes_translations (lang, slug) where slug is not null;
alter table public.recipes_translations enable row level security;
create policy rt_read  on public.recipes_translations for select using (true);
create policy rt_write on public.recipes_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.culture_sections_translations (
  id uuid primary key default gen_random_uuid(),
  section_id text not null references public.culture_sections(id) on delete cascade,
  lang text not null,
  slug text,
  title text, subtitle text, content text, quote text,
  seo_title text, seo_description text, og_title text, og_description text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (section_id, lang)
);
create unique index if not exists culture_tr_lang_slug_uq on public.culture_sections_translations (lang, slug) where slug is not null;
alter table public.culture_sections_translations enable row level security;
create policy cut_read  on public.culture_sections_translations for select using (true);
create policy cut_write on public.culture_sections_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.akha_news_translations (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.akha_news(id) on delete cascade,
  lang text not null,
  slug text,
  title text, subtitle text, excerpt text, content text,
  seo_title text, seo_description text, og_title text, og_description text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (news_id, lang)
);
create unique index if not exists news_tr_lang_slug_uq on public.akha_news_translations (lang, slug) where slug is not null;
alter table public.akha_news_translations enable row level security;
create policy ant_read  on public.akha_news_translations for select using (true);
create policy ant_write on public.akha_news_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.ingredients_library_translations (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients_library(id) on delete cascade,
  lang text not null,
  slug text,
  name text, description text, conclusion text, culinary_uses text,
  health_benefits text, kitchen_usage text,
  seo_title text, seo_description text, og_title text, og_description text,
  the_essential jsonb, usage_note jsonb,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (ingredient_id, lang)
);
create unique index if not exists ingredients_tr_lang_slug_uq on public.ingredients_library_translations (lang, slug) where slug is not null;
alter table public.ingredients_library_translations enable row level security;
create policy ilt_read  on public.ingredients_library_translations for select using (true);
create policy ilt_write on public.ingredients_library_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.content_categories_translations (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.content_categories(id) on delete cascade,
  lang text not null,
  slug text,
  title text, subtitle text, description text, content_body text,
  ui_quote text, title_highlight text, tab_label text,
  seo_title text, seo_description text, og_title text, og_description text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (category_id, lang)
);
create unique index if not exists content_cat_tr_lang_slug_uq on public.content_categories_translations (lang, slug) where slug is not null;
alter table public.content_categories_translations enable row level security;
create policy cctr_read  on public.content_categories_translations for select using (true);
create policy cctr_write on public.content_categories_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.quiz_questions_translations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  lang text not null,
  text text, explanation text, explanation_wrong text, hint_response text,
  options jsonb, hint_blocks jsonb,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (question_id, lang)
);
alter table public.quiz_questions_translations enable row level security;
create policy qqt_read  on public.quiz_questions_translations for select using (true);
create policy qqt_write on public.quiz_questions_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.shop_storefront_translations (
  id uuid primary key default gen_random_uuid(),
  storefront_id uuid not null references public.shop_storefront(id) on delete cascade,
  lang text not null,
  display_name text, cultural_story text, badge_label text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (storefront_id, lang)
);
alter table public.shop_storefront_translations enable row level security;
create policy sst_read  on public.shop_storefront_translations for select using (true);
create policy sst_write on public.shop_storefront_translations for all using (is_admin()) with check (is_admin());

create table if not exists public.gallery_items_translations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.gallery_items(id) on delete cascade,
  lang text not null,
  quote text,
  human_reviewed boolean not null default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (item_id, lang)
);
alter table public.gallery_items_translations enable row level security;
create policy git_read  on public.gallery_items_translations for select using (true);
create policy git_write on public.gallery_items_translations for all using (is_admin()) with check (is_admin());

-- Registro slug unico: EN (base) -> tradotto. Router front + riscrittura link /faq.
create or replace view public.v_translated_slugs
with (security_invoker = true) as
  select 'page'::text as entity_type, sm.page_slug as slug_en, t.lang, t.page_slug as slug_translated
  from public.site_metadata_translations t join public.site_metadata sm on sm.id = t.page_id
  where t.page_slug is not null
union all
  select 'recipe', r.slug, t.lang, t.slug
  from public.recipes_translations t join public.recipes r on r.id = t.recipe_id
  where t.slug is not null
union all
  select 'culture', c.slug, t.lang, t.slug
  from public.culture_sections_translations t join public.culture_sections c on c.id = t.section_id
  where t.slug is not null
union all
  select 'news', n.slug, t.lang, t.slug
  from public.akha_news_translations t join public.akha_news n on n.id = t.news_id
  where t.slug is not null
union all
  select 'ingredient', i.slug, t.lang, t.slug
  from public.ingredients_library_translations t join public.ingredients_library i on i.id = t.ingredient_id
  where t.slug is not null
union all
  select 'category', cc.slug, t.lang, t.slug
  from public.content_categories_translations t join public.content_categories cc on cc.id = t.category_id
  where t.slug is not null;

comment on view public.v_translated_slugs is
  'Registro slug multilingua: mappa slug EN (base) -> slug tradotto per entity_type/lang. security_invoker: eredita la RLS public-read dei sidecar. Consumatori: router front (risoluzione /es/{slug}) e /faq (riscrittura link interni nelle traduzioni FAQ).';

grant select on public.v_translated_slugs to anon, authenticated;
