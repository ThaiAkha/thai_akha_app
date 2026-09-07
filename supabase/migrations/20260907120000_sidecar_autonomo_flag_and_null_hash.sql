-- 20260907120000_sidecar_autonomo_flag_and_null_hash.sql
-- /database · 2026-09-07 · su richiesta /translate-db (PIANO_Traduzione_Continua_2026-09-06 §3.A e §4.5)
-- STATO: PROPOSTA, non applicata. Si applica su GO con `supabase db query --linked -f <file>`
-- e poi `supabase migration repair --status applied 20260907120000`.
--
-- COSA ERA ROTTO (dal 2026-08-26, in silenzio)
-- `v_translation_pairs_info.sidecar_autonomo` era definito come "translatable_columns() vuota".
-- Il 26/08 (20260826000000) translatable_columns() e' passata a derivare dal SIDECAR: per i
-- sidecar autonomi (herb_teas, home_cards) l'elenco e' passato da 0 a 12/3 colonne e il flag e'
-- caduto a FALSE. L'hotfix dello stesso giorno (20260826001000) ha creato
-- translation_source_columns() per l'hash ma NON ha ripuntato il flag. Da allora:
--   - audit-translations.mjs e dump-tables.mjs trattano home_cards e herb_teas come coppie
--     normali e cercano il sorgente inglese sulla madre, dove non c'e';
--   - la skill /translate-db, 085_03_DB_Rules §7 e Sidecar_Architecture §9 dicono
--     "sidecar_autonomo=true (herb_teas, home_cards)": era vero fino al 26/08.
--
-- SECONDO DIFETTO, piu' vecchio (dal 17/08): translation_hash_sql() non restituiva MAI null.
-- Con zero colonne sorgente, format('...%s...', NULL) produce la stringa
-- 'md5(jsonb_build_object()::text)', cioe' una COSTANTE (99914b932bd37a50b983c5e7c90ae93b),
-- oggi scritta su tutte e 124 le righe di home_cards_translations. translations_stale() non
-- saltava la coppia (h non era null) e non la segnalava mai (costante = costante);
-- mark_fresh "riusciva" fissando l'hash di niente. Il commento della funzione ("NULL se
-- sidecar autonomo") descriveva un comportamento che non e' mai esistito.
--
-- TERZO: translation_source_hash() (per riga, SECURITY DEFINER) usa ancora
-- translatable_columns() per leggere la MADRE: su home_cards solleva
-- `ERROR 42703: column "title" does not exist`. Zero chiamanti oggi (script 054 ed edge
-- function verificati con grep), ma e' una trappola armata.
--
-- CASO MISTO: site_metadata_admin ha `menu_label` sulla madre (inline dal 2026-07,
-- migration admin_menu_label_inline) e title/subtitle/description SOLO nel sidecar, EN
-- compreso. Non e' ne' autonomo ne' standard: l'hash copre 1 colonna su 4 e una modifica
-- al titolo inglese non marca stale nessuna traduzione. La vista ora lo DICE
-- (`sidecar_misto`, `solo_sidecar`) invece di farlo sembrare sano. E' l'UNICO caso misto
-- oggi: `faq_questions.links`, citata come solo-sidecar nelle note del 26-27/08, e' stata
-- droppata il 03/09 (20260903120000).
--
-- COSA FA
-- 1. v_translation_pairs_info: `sidecar_autonomo` = translation_source_columns() vuota (la
--    madre non ha NIENTE da cui tradurre). Nuove colonne IN CODA (create or replace view non
--    riordina e conserva i grant): `sorgente_madre` (colonne della madre nell'hash),
--    `solo_sidecar` (traducibili senza madre: l'EN vive nella riga lang='en' del sidecar),
--    `sidecar_misto` (entrambe non vuote). I nomi esistenti restano: _lib.pairs(),
--    audit-translations.mjs, dump-tables.mjs non cambiano.
-- 2. translation_hash_sql(): NULL vero quando non c'e' sorgente -> translations_stale() salta
--    la coppia, mark_fresh restituisce 0. E' il comportamento che il commento prometteva.
-- 3. translation_source_hash(): legge translation_source_columns() (madre), NULL se vuota.
-- 4. Dati: azzera la costante 99914b… su home_cards_translations (124 righe): per un sidecar
--    autonomo `source_hash` non ha significato e "NULL = mai fissato" e' l'unico valore onesto.
--
-- DIFF VERIFICATO PRIMA DI APPLICARE (select di emulazione sulle 24 coppie, 2026-09-07):
--   cambia flag: herb_teas false->true, home_cards false->true; le altre 22 invariate.
--   sidecar_misto=true: SOLO site_metadata_admin (title,subtitle,description).
--   hash: identico per 22 coppie; NULL (era la costante) per herb_teas e home_cards ->
--   nessuna tempesta di stale: v_translations_stale non le conteneva e non le conterra'.
--
-- NON FA: non sposta l'inglese sulla madre (opzione B, decisione owner: decisions.md
-- 2026-09-07), non tocca `language` GENERATED (mirror del rename 05/08, derivata da `lang`,
-- l'insert che la nomina fallisce per costruzione: e' una protezione, non una trappola),
-- non cambia nessuna RLS.

-- LIMITI NOTI (precisazioni /translate-db del 07/09, accettate prima del GO):
-- - Questa migration NON rende traducibile home_cards: translate-batch.mjs e gli altri script
--   prendono il sorgente da rows(p.madre) e non guardano il flag. Il numero smette di mentire,
--   il lavoro resta impossibile finche' gli script non imparano a leggere la riga lang='en' del
--   sidecar quando solo_sidecar non e' vuoto (owner: /translate-db).
-- - Effetto collaterale: audit-translations.mjs ora SALTA home_cards e herb_teas (flag true).
--   Da "contata male" a invisibile: l'unica rete e' stato-sidecar.mjs, che ricalcola da se'.
-- - Nessun segnale di freschezza per i sidecar autonomi: hash NULL -> mark_fresh 0 -> mai
--   "fresco", mai "stale". Il segnale giusto sarebbe l'hash contro la PROPRIA riga lang='en':
--   non e' in questa migration, e' una lacuna nota da chiudere quando gli script sapranno leggerla.
-- - `with (security_invoker = true)` non e' un irrigidimento aggiunto: create or replace view
--   azzera le reloptions, senza la clausola la vista PERDEREBBE l'opzione messa il 02/09.

-- `with (security_invoker = true)` e' OBBLIGATORIO: create or replace view sostituisce le reloptions
-- con quelle scritte qui (anche nessuna), e l'advisor_round2 del 02/09 l'aveva messa apposta.
-- Senza, la vista torna SECURITY DEFINER e il controllo di salute B torna a 1.
create or replace view public.v_translation_pairs_info with (security_invoker = true) as
select p.sidecar, p.madre, p.sidecar_fk_col, p.madre_key_col,
       public.translatable_columns(p.madre, p.sidecar) as traducibili,
       coalesce(array_length(public.translation_source_columns(p.madre, p.sidecar), 1), 0) = 0
         as sidecar_autonomo,
       public.translation_source_columns(p.madre, p.sidecar) as sorgente_madre,
       (select coalesce(array_agg(c order by o), '{}')
          from unnest(public.translatable_columns(p.madre, p.sidecar)) with ordinality t(c, o)
         where c <> all (public.translation_source_columns(p.madre, p.sidecar)))
         as solo_sidecar,
       coalesce(array_length(public.translation_source_columns(p.madre, p.sidecar), 1), 0) > 0
         and exists (select 1 from unnest(public.translatable_columns(p.madre, p.sidecar)) c
                      where c <> all (public.translation_source_columns(p.madre, p.sidecar)))
         as sidecar_misto
from public.v_translation_pairs p;

comment on view public.v_translation_pairs_info is
  'Coppie madre<->sidecar. traducibili = colonne del SIDECAR (cosa si puo'' scrivere). sorgente_madre = colonne della MADRE che entrano nell''hash di freschezza. solo_sidecar = traducibili senza colonna madre: l''inglese vive nella riga lang=en del sidecar. sidecar_autonomo = sorgente_madre vuota (niente stale, si traduce dalla riga EN del sidecar). sidecar_misto = entrambe non vuote (l''hash copre SOLO sorgente_madre). 2026-09-07.';

create or replace function public.translation_hash_sql(p_madre text, p_sidecar text)
returns text language sql stable set search_path to 'public' as $function$
  -- Legge le colonne della MADRE (m.): translation_source_columns, MAI translatable_columns
  -- (dal 26/08 quella e' del SIDECAR e su nomi assenti genera SQL invalido).
  -- 2026-09-07: NULL VERO se non c'e' sorgente. Prima format('%s', NULL) dava
  -- 'md5(jsonb_build_object()::text)', una costante: i sidecar autonomi risultavano
  -- "freschi" per costruzione e mark_fresh scriveva l'hash di niente.
  select case
    when coalesce(array_length(public.translation_source_columns(p_madre, p_sidecar), 1), 0) = 0
      then null
    else format('md5(jsonb_build_object(%s)::text)',
           (select string_agg(format('%L, m.%I', c, c), ', ')
              from unnest(public.translation_source_columns(p_madre, p_sidecar)) c))
  end;
$function$;
comment on function public.translation_hash_sql is
  'Frammento SQL (alias madre = m) che calcola l''hash di freschezza: per UPDATE/SELECT set-based, mai per riga. NULL VERO se il sidecar e'' autonomo (nessuna colonna sorgente sulla madre). 2026-09-07.';

create or replace function public.translation_source_hash(p_madre text, p_sidecar text, p_key text)
returns text language plpgsql stable security definer set search_path to 'public', 'pg_catalog' as $function$
declare v_cols text[]; v_key text; v_json text;
begin
  select madre_key_col into v_key from public.v_translation_pairs where sidecar = p_sidecar limit 1;
  if v_key is null then return null; end if;
  -- 2026-09-07: colonne della MADRE (translation_source_columns), non del sidecar:
  -- con translatable_columns() su home_cards sollevava `column "title" does not exist`.
  v_cols := public.translation_source_columns(p_madre, p_sidecar);
  if coalesce(array_length(v_cols, 1), 0) = 0 then return null; end if;
  execute format('select md5(jsonb_build_object(%s)::text) from public.%I where %I::text = $1',
    (select string_agg(format('%L, %I', c, c), ', ') from unnest(v_cols) c), p_madre, v_key)
    into v_json using p_key;
  return v_json;
end; $function$;

-- 4. La costante scritta dal difetto n.2. Solo quel valore, solo dove la coppia e' autonoma.
--    Il trigger set_translated_at lascia in pace translated_at (source_hash e' nella sua lista
--    `ignora`) ma bumpa SEMPRE updated_at: lo si spegne per la durata dell'update, cosi' 124
--    righe non dichiarano una modifica di contenuto che non c'e' stata.
alter table public.home_cards_translations disable trigger set_translated_at;
update public.home_cards_translations
   set source_hash = null
 where source_hash = '99914b932bd37a50b983c5e7c90ae93b';
alter table public.home_cards_translations enable trigger set_translated_at;
alter table public.herb_teas_translations disable trigger set_translated_at;
update public.herb_teas_translations
   set source_hash = null
 where source_hash = '99914b932bd37a50b983c5e7c90ae93b';
alter table public.herb_teas_translations enable trigger set_translated_at;

-- VERIFICA DOPO L'APPLICAZIONE (attesi):
-- select sidecar, sidecar_autonomo, sidecar_misto, solo_sidecar
--   from public.v_translation_pairs_info where sidecar_autonomo or sidecar_misto;
--   -> herb_teas_translations (autonomo) · home_cards_translations (autonomo)
--      site_metadata_admin_translations (misto: title,subtitle,description)
-- select count(*) from public.v_translations_stale;                      -> uguale alla baseline
-- select public.translation_hash_sql('home_cards','home_cards_translations');            -> null
-- select public.translation_source_hash('home_cards','home_cards_translations','1');    -> null (era ERROR 42703)
-- select public.translation_mark_fresh('home_cards_translations');                      -> 0
-- select count(*) from public.home_cards_translations where source_hash is not null;     -> 0
-- select reloptions from pg_class where relname = 'v_translation_pairs_info';               -> {security_invoker=true}
-- select max(updated_at) from public.home_cards_translations;                            -> 2026-08-28 16:05:24+00 (baseline 07/09: invariato)
