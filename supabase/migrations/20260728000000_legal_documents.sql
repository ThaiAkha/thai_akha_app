-- 20260728000000_legal_documents.sql
-- Centralizza i 4 documenti legali (front/agency x terms/policy) in una tabella unica.
--
-- Contesto: oggi i legali sono sparsi tra info_page_sections (front terms + privacy),
-- site_metadata (versione/date front) e site_metadata_admin (slug agency, senza contenuti).
-- Questa migration crea il contenitore unico + le traduzioni sidecar, NON smonta nulla:
-- info_page_sections resta is_active = true come rollback finche' il front non e' migrato.
--
-- Nota RLS: usiamo public.is_admin() (SECURITY DEFINER, gia' esistente) nelle policy.
-- I suoi GRANT non vengono toccati: revocarli in passato ha rotto login e driver.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Tabelle
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.legal_documents (
  id             uuid primary key default gen_random_uuid(),
  doc_key        text not null unique,
  audience       text not null check (audience in ('front','agency')),
  doc_type       text not null check (doc_type in ('terms','policy')),
  page_slug      text not null unique,
  brain_ref      text not null,
  title          text not null,
  legal_version  text not null,
  date_modified  date not null,
  date_published date,
  body           jsonb not null default '[]'::jsonb,
  changelog      jsonb not null default '[]'::jsonb,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (audience, doc_type)
);

comment on table public.legal_documents is
  'Fonte unica dei 4 documenti legali (front/agency x terms/policy). body = array di sezioni {section_order, heading, anchor, body[]}.';
comment on column public.legal_documents.brain_ref is
  'Riferimento al master nel brain (es. 2141 = Terms consumer).';
comment on column public.legal_documents.body is
  'Array di sezioni: [{section_order, heading, anchor, body:[{type,text}]}]. Markdown e bullet conservati verbatim.';

create table if not exists public.legal_documents_translations (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid not null references public.legal_documents(id) on delete cascade,
  lang           text not null,
  title          text,
  body           jsonb not null default '[]'::jsonb,
  source_version text not null,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (document_id, lang)
);

comment on column public.legal_documents_translations.source_version is
  'legal_version del documento sorgente al momento della traduzione: se diverge, la traduzione e stale.';

-- Consenso legale per utente (quale doc/versione ha accettato e quando).
alter table public.profiles
  add column if not exists legal_accepted jsonb not null default '{}'::jsonb;

comment on column public.profiles.legal_accepted is
  'Accettazioni legali: { "<doc_key>": { "version": "1.4", "accepted_at": "<iso8601>" } }.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Indici (le unique creano gia' l indice su doc_key, page_slug, audience+doc_type)
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists idx_legal_documents_audience_published
  on public.legal_documents (audience, is_published);

create index if not exists idx_legal_documents_translations_document
  on public.legal_documents_translations (document_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Trigger updated_at — RIUSA la funzione standard del progetto
--    (public.update_updated_at_column, gia' usata da bookings, profiles, recipes,
--     shop_akha, site_metadata_admin, site_metadata_admin_translations)
-- ─────────────────────────────────────────────────────────────────────────────

drop trigger if exists update_legal_documents_updated_at on public.legal_documents;
create trigger update_legal_documents_updated_at
  before update on public.legal_documents
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_legal_documents_translations_updated_at on public.legal_documents_translations;
create trigger update_legal_documents_translations_updated_at
  before update on public.legal_documents_translations
  for each row execute function public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.legal_documents enable row level security;
alter table public.legal_documents_translations enable row level security;

-- legal_documents
drop policy if exists "front public read" on public.legal_documents;
create policy "front public read" on public.legal_documents
  for select to public
  using (audience = 'front' and is_published = true);

drop policy if exists "agency auth read" on public.legal_documents;
create policy "agency auth read" on public.legal_documents
  for select to authenticated
  using (audience = 'agency' and is_published = true);

drop policy if exists "admin write" on public.legal_documents;
create policy "admin write" on public.legal_documents
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- legal_documents_translations — audience risolta via join sul documento padre.
-- NB: la RLS di legal_documents si applica anche a questa subquery, quindi il
-- vincolo "padre pubblicato" e' doppiamente garantito (esplicito + implicito).
-- La traduzione deve essere pubblicata a sua volta (is_published sulla riga stessa).
drop policy if exists "front public read" on public.legal_documents_translations;
create policy "front public read" on public.legal_documents_translations
  for select to public
  using (
    is_published = true
    and exists (
      select 1 from public.legal_documents d
      where d.id = legal_documents_translations.document_id
        and d.audience = 'front'
        and d.is_published = true
    )
  );

drop policy if exists "agency auth read" on public.legal_documents_translations;
create policy "agency auth read" on public.legal_documents_translations
  for select to authenticated
  using (
    is_published = true
    and exists (
      select 1 from public.legal_documents d
      where d.id = legal_documents_translations.document_id
        and d.audience = 'agency'
        and d.is_published = true
    )
  );

drop policy if exists "admin write" on public.legal_documents_translations;
create policy "admin write" on public.legal_documents_translations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Seed dei 4 documenti — tutti is_published = false.
--    Solo front_terms viene popolato (sezione 6); gli altri attendono i master dal brain.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.legal_documents
  (doc_key, audience, doc_type, page_slug, brain_ref, title, legal_version, date_modified, date_published, is_published)
values
  ('front_terms',   'front',  'terms',  'booking-terms-conditions', '2141', 'Terms of Service - Thai Akha Kitchen', '1.4', date '2026-07-27', date '2026-01-01', false),
  ('front_policy',  'front',  'policy', 'privacy-policy',           '2142', 'Privacy Policy - Thai Akha Kitchen',   '1.1', date '2026-06-03', date '2026-01-15', false),
  ('agency_terms',  'agency', 'terms',  'agency-terms',             '6141', 'Agency Terms of Service',              '1.0', date '2026-07-28', null,            false),
  ('agency_policy', 'agency', 'policy', 'agency-privacy',           '6142', 'Agency Privacy Policy',                '1.2', date '2026-07-28', null,            false)
on conflict (doc_key) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Backfill di front_terms dalle 14 sezioni di info_page_sections.
--    Copia VERBATIM: heading, anchor e i blocchi {type,text} restano identici
--    (markdown e bullet "• " inclusi). Nessuna normalizzazione.
--
--    BACKFILL VERO, NON SINCRONIZZAZIONE. Le due guardie sotto sono deliberate:
--      - `jsonb_array_length(src.b) > 0` → se la sorgente e' vuota o disattivata
--        (info_page_sections verra' dismessa dopo la migrazione del front) il replay
--        NON scrive '[]' sopra un documento legale valido;
--      - `ld.body = '[]'::jsonb` → scrive solo se il documento e' ancora vuoto, cosi'
--        un replay non sovrascrive le modifiche fatte nel frattempo dall'admin.
-- ─────────────────────────────────────────────────────────────────────────────

update public.legal_documents ld
set body = src.b
from (
  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'section_order', s.section_order,
               'heading',       s.heading,
               'anchor',        s.anchor,
               'body',          s.body
             )
             order by s.section_order
           ),
           '[]'::jsonb
         ) as b
  from public.info_page_sections s
  where s.page_slug = 'booking-terms-conditions'
    and s.is_active = true
) src
where ld.doc_key = 'front_terms'
  and jsonb_array_length(src.b) > 0
  and ld.body = '[]'::jsonb;
