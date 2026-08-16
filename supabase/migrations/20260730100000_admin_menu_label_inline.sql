-- 20260730100000_admin_menu_label_inline.sql
-- Unifica il modello delle etichette di menu tra front e admin.
--
-- PRIMA: il front teneva `menu_label` inline su site_metadata, l'admin lo teneva SOLO nel
-- sidecar site_metadata_admin_translations (anche per l'inglese). Due schemi diversi per
-- la stessa cosa, e getMenuItems con due rami.
-- Effetto collaterale reale: creando una pagina admin senza la riga di traduzione, la voce
-- compariva NEL MENU SENZA NOME. E' successo con agency-privacy.
--
-- DOPO (uguale per le due tabelle):
--   base EN  -> colonna `menu_label` sulla riga: sempre presente, fonte di verita'
--   th/es/zh -> sidecar *_translations
-- getMenuItems legge l'inline e ci sovrascrive la traduzione solo se lang != en.
--
-- Il front non si tocca: ha gia' questa forma. Quando servira' il multilingua sul front
-- si aggiungera' site_metadata_translations con lo stesso identico pattern.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Colonna base
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.site_metadata_admin
  add column if not exists menu_label text;

comment on column public.site_metadata_admin.menu_label is
  'Etichetta di menu in inglese (base). Le altre lingue stanno in site_metadata_admin_translations.menu_label. Stesso modello di site_metadata.menu_label nel front.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Backfill dalle righe EN del sidecar (44 pagine su 45)
-- ─────────────────────────────────────────────────────────────────────────────

update public.site_metadata_admin m
set menu_label = t.menu_label
from public.site_metadata_admin_translations t
where t.page_id = m.id
  and t.language = 'en'
  and coalesce(t.menu_label, '') <> ''
  and m.menu_label is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Le due etichette legali: ora sono pagine distinte, non piu' una voce sola.
--    "Terms and Policies" copriva entrambi i documenti quando la pagina era una.
-- ─────────────────────────────────────────────────────────────────────────────

update public.site_metadata_admin set menu_label = 'Terms & Conditions' where page_slug = 'agency-terms';
update public.site_metadata_admin set menu_label = 'Privacy - Policy'   where page_slug = 'agency-privacy';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. L'inglese deve avere UNA sola sorgente: si azzera menu_label nelle righe EN
--    del sidecar. Le righe restano (portano title/subtitle/description, usati dagli
--    header di pagina): perdono solo il campo ormai duplicato.
-- ─────────────────────────────────────────────────────────────────────────────

update public.site_metadata_admin_translations
set menu_label = null
where language = 'en' and menu_label is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Anti-regressione: una pagina non puo' entrare nel menu senza nome.
--    E' esattamente il difetto che ha prodotto la voce muta.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.site_metadata_admin
  drop constraint if exists site_metadata_admin_menu_label_required;
alter table public.site_metadata_admin
  add constraint site_metadata_admin_menu_label_required
  check (show_in_menu = false or coalesce(menu_label, '') <> '');
