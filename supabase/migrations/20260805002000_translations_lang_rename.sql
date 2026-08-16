-- 20260805002000_translations_lang_rename.sql
-- Convenzione UNICA per la colonna lingua dei sidecar: `lang` ovunque (24/24).
-- Applicata live 2026-08-05. Chiude il doppio binario lang/language.
--
-- Zero-downtime: le 2 tabelle lette in produzione ricevono una colonna COMPAT
-- `language` GENERATED (mirror di lang, read-only): il codice deployato che
-- seleziona `language` continua a funzionare fino al deploy del codice nuovo
-- (contentMetadata.service.ts e useAdminDatabase.tsx aggiornati a `lang` in
-- questa stessa sessione).
--
-- ⚠️ FOLLOW-UP dopo il primo deploy del front/admin aggiornato:
--   alter table public.site_metadata_admin_translations drop column language;
--   alter table public.home_cards_translations drop column language;
-- (le compat sono STORED: occupano spazio e compaiono nei types generati.
--  Non scrivibili: un INSERT che specifica `language` fallisce - i writer
--  devono usare `lang`.)

alter table public.site_metadata_admin_translations rename column language to lang;
alter table public.site_metadata_admin_translations add column language text generated always as (lang) stored;

alter table public.home_cards_translations rename column language to lang;
alter table public.home_cards_translations add column language text generated always as (lang) stored;

alter table public.herb_teas_translations rename column language to lang;
