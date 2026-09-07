-- 20260907160000_herb_teas_drop_legacy_lang_check.sql
-- /database · 2026-09-07 · seguito di 20260907130000, nota di /translate-db.
-- STATO: PROPOSTA, non applicata. Su GO: `supabase db query --linked -f <file>` e poi
-- `supabase migration repair --status applied 20260907160000`.
--
-- IL RESIDUO: `herb_teas_translations` porta DUE vincoli sulla stessa colonna `lang`:
--   herb_teas_translations_lang_chk       (07/09)  lang = any (public.allowed_langs())   12 lingue
--   herb_teas_translations_language_check (storico) lang in ('en','th')                    2 lingue
-- Si sommano e vince il piu' stretto: una lingua legittima delle 12 viene rifiutata SOLO su
-- questa tabella, e fra sei mesi qualcuno si chiedera' perche'.
--
-- PERCHE' E' UN RESIDUO E NON UNA SCELTA: non esiste in nessuna migration del repo (nato in
-- dashboard); il nome dice ancora `language`, la colonna rinominata `lang` il 05/08; nessun
-- documento del brain dichiara herb_teas "solo EN+TH" (Sidecar_Architecture la tratta come
-- sidecar normale, 12 colonne traducibili); madre e sidecar hanno 0 righe e l'owner la tiene
-- congelata. Un vincolo che nessuno ha deciso, con un nome di una colonna che non c'e' piu',
-- su una tabella vuota: il posto giusto per lui e' una riga in decisions.md, non lo schema.
--
-- ALTERNATIVA se l'owner conferma che herb_teas e' davvero EN+TH per politica: NON droppare,
-- ma rinominare e commentare (`rename constraint ... to herb_teas_translations_lang_en_th_chk` +
-- `comment on constraint`), cosi' la scelta e' leggibile dove morde. Da decidere col GO.
--
-- VERIFICATO PRIMA: 0 righe in herb_teas e herb_teas_translations, quindi nessun dato da
-- ricontrollare; il CHECK delle 12 resta e copre il caso.

alter table public.herb_teas_translations
  drop constraint if exists herb_teas_translations_language_check;

-- VERIFICA DOPO (attesi):
-- select conname from pg_constraint where conrelid='public.herb_teas_translations'::regclass and contype='c' order by 1;
--   -> herb_teas_translations_lang_chk, herb_teas_translations_verified_by_chk   (2, non 3)
-- salute A-F -> 0
