-- #142: lingua delle email automatiche all'agenzia (1421_30 conferma, 1421_31 reminder 24h).
-- Applicata in prod il 2026-09-03 via MCP (apply_migration profiles_preferred_language_142);
-- questo file e' la copia versionata. Valori: le 4 lingue agenzia di 085_02_Flow §Politica lingue.
-- Si imposta a mano dall'ufficio (nessuna UI ancora); default 'en' per tutti i profili esistenti.

alter table public.profiles
  add column if not exists preferred_language text not null default 'en';

alter table public.profiles
  drop constraint if exists profiles_preferred_language_check;
alter table public.profiles
  add constraint profiles_preferred_language_check
  check (preferred_language in ('en', 'th', 'es', 'zh'));

comment on column public.profiles.preferred_language is
  '#142: lingua delle email automatiche all''agenzia (en|th|es|zh, default en). Letta dalle edge send-agency-booking-confirmation e send-agency-reminder.';
