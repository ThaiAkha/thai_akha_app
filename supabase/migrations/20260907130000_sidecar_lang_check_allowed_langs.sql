-- 20260907130000_sidecar_lang_check_allowed_langs.sql
-- /database · 2026-09-07 · su richiesta /translate-db, dopo la bonifica hi/ms (84 righe di
-- faq_categories_translations dell'8 agosto, nate prima della decisione sulle 12 lingue).
-- STATO: PROPOSTA, non applicata. Si applica su GO con `supabase db query --linked -f <file>`
-- e poi `supabase migration repair --status applied 20260907130000`.
--
-- IL BUCO: nessun vincolo sulla colonna `lang` dei 24 sidecar (`text not null`, nessun CHECK
-- tranne herb_teas, che ha il suo storico `in ('en','th')`). Una tredicesima lingua entra con
-- un insert qualunque e i conteggi la contano come le altre; se ne accorge solo
-- stato-sidecar.mjs (anomalia D), cioe' qualcuno che lancia uno script. E' esattamente cosi'
-- che hi e ms sono entrate: nessuno le aveva dichiarate, il database le contava.
--
-- LO STRUMENTO, e perche' NON un dominio. `create domain lang_code` sul TIPO della colonna
-- sarebbe la forma canonica, ma `alter column lang type lang_code` fallisce su tutte e 24 le
-- tabelle: `v_translation_status` dipende dalla colonna `lang` di OGNI sidecar,
-- `v_translated_slugs` di 6, e su home_cards/site_metadata_admin la colonna `language` e'
-- GENERATED da `lang` (ordine owner 10/08: niente drop). Ricreare due viste e cambiare 24 tipi
-- per un vincolo di VALORE e' sproporzionato. Quindi: UNA funzione immutabile con la lista e un
-- CHECK per tabella che la chiama. La lista vive in un posto solo; aggiungere una lingua e'
-- `create or replace function` dentro una migration, mai un insert.
--
-- LA LISTA: le 12 del pubblico (085_02_Flow §Politica lingue) = le 11 tradotte + `en`, che nei
-- sidecar autonomi e in quello misto vive nella riga lang='en' (76 righe oggi: home_cards 31,
-- site_metadata_admin 45). hi e ms sono IN SOSPESO: entrano qui, con una migration, dopo
-- l'approvazione delle 11+2.
--
-- VERIFICATO PRIMA (2026-09-07): distinct lang su tutte e 24 le tabelle = esattamente le 12
-- (ca de en es fr it ja ko nl pt th zh); nessun dominio, enum o funzione con nome simile;
-- nessuna policy cita lang; `profiles.preferred_language` ha gia' un CHECK letterale con le
-- stesse 12 (resta com'e'). Tabella piu' grande: faq_questions_translations ~13.900 righe, la
-- validazione del CHECK e' immediata.
--
-- COSA NON FA: non tocca `herb_teas_translations_lang_check` storico (piu' stretto, en/th: i
-- due CHECK si sommano e vince il piu' stretto); non tocca `profiles` ne' `app_manuals.lang`;
-- non riscrive la lista cablata dentro `v_translation_status` (seconda copia della lista, da
-- puntare a questa funzione in un follow-up a se'). TOGLIERE una lingua non e' coperto: un
-- CHECK non ricontrolla le righe esistenti, quindi prima si cancellano le righe, poi si
-- accorcia la lista.
--
-- UN SIDECAR NUOVO non eredita il CHECK da solo: il contratto sidecar (decisions.md 05/08) va
-- aggiornato con la riga `lang text not null check (lang = any (public.allowed_langs()))`, e
-- il controllo G qui sotto va in coda ai 6 controlli di salute di /database.

create or replace function public.allowed_langs()
returns text[] language sql immutable parallel safe set search_path = '' as $$
  select array['en','es','fr','de','pt','it','ca','nl','th','zh','ko','ja']::text[];
$$;
comment on function public.allowed_langs() is
  'Le 12 lingue del pubblico (085_02_Flow §Politica lingue): 11 tradotte + en. UNICA lista lato DB, usata dai CHECK {sidecar}_lang_chk sui 24 sidecar. Aggiungere una lingua = create or replace in una migration (hi e ms in sospeso). Toglierne una = prima cancellare le righe, poi accorciare qui. 2026-09-07.';

do $$
declare r record;
begin
  for r in select distinct sidecar from public.v_translation_pairs order by 1 loop
    if not exists (
      select 1 from pg_constraint
      where conrelid = ('public.' || quote_ident(r.sidecar))::regclass
        and conname = r.sidecar || '_lang_chk'
    ) then
      execute format('alter table public.%I add constraint %I check (lang = any (public.allowed_langs()))',
                     r.sidecar, r.sidecar || '_lang_chk');
    end if;
  end loop;
end $$;

-- VERIFICA DOPO L'APPLICAZIONE (attesi):
-- select count(*) from pg_constraint where conname like '%\_lang\_chk';                  -> 24
-- CONTROLLO G (sidecar senza vincolo lingua), da aggiungere ai 6 di salute:
-- select p.sidecar from public.v_translation_pairs p
--  where not exists (select 1 from pg_constraint c
--                     where c.conrelid = ('public.'||quote_ident(p.sidecar))::regclass
--                       and c.conname = p.sidecar||'_lang_chk');                          -> 0 righe
-- select public.allowed_langs();                                                          -> 12 codici
-- update public.faq_categories_translations set lang = 'hi'
--  where id = (select id from public.faq_categories_translations limit 1);
--   -> ERROR 23514 violates check constraint "faq_categories_translations_lang_chk" (nessuna riga cambia)
-- select count(*) from public.v_translations_stale;                                       -> invariato
-- salute A-F -> 0 (E: la funzione ha search_path)
