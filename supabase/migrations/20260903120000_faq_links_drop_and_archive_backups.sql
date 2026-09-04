-- 2026-09-03 (Cowork /faq + /database + /skill-master) - applicato live via MCP lo stesso giorno.
-- Due cose scollegate solo in apparenza: una colonna morta e le tabelle di backup nel posto sbagliato.

-- ── A. faq_questions_translations.links: residuo dello schema pre-unificazione ────────────
-- Fino a luglio 2026 `links` esisteva sulla MADRE (21 righe su 80 la usavano). E' stata
-- unificata dentro `cta.links` e droppata da faq_questions; il sidecar, clonato dallo schema
-- di allora, se l'e' tenuta: 13.915 righe, 100% NULL, in 11 lingue.
-- Consumatori verificati a zero (front, admin, shared, 21 edge function, script): l'unica
-- lettura e' infoPages.service.ts, che legge cta.links.
-- Trappola #148 verificata PRIMA e DOPO: translatable_columns passa da
-- [question, answer, cta, links] a [question, answer, cta] e le righe stale restano 3.729.
-- `links` non era nella madre, quindi non entrava nel source hash: nessun translation_mark_fresh.
ALTER TABLE IF EXISTS public.faq_questions_translations DROP COLUMN IF EXISTS links;

-- ── B. 10 tabelle di backup da public ad archive ──────────────────────────────────────────
-- Regola canonica (agent-memory/database/decisions.md, 10 ago 2026): ogni snapshot tabellare
-- nasce in `archive`, che non ha USAGE per anon/authenticated e non e' esposto da PostgREST.
-- Queste erano nate in `public` perche' la regola d'oro della skill /faq dettava il nome
-- SENZA schema: 10 tabelle senza RLS e leggibili con la anon key. La skill e' stata patchata
-- (master nel brain + installata) perche' la causa non si ripeta.
-- Spostamento, non drop: le campagne sorgente decidono il ciclo di vita, il rollback resta
-- possibile con prefisso `archive.`.
CREATE SCHEMA IF NOT EXISTS archive;

ALTER TABLE IF EXISTS public._temp_bak_20260902_culture_clinical SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_faq_clinical     SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_news_clinical    SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_recipes_clinical SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_sm_clinical      SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_spice_article    SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_spice_faq        SET SCHEMA archive;
ALTER TABLE IF EXISTS public._temp_bak_20260902_spice_media      SET SCHEMA archive;
ALTER TABLE IF EXISTS public.faq_backup_20260903_relative        SET SCHEMA archive;
ALTER TABLE IF EXISTS public.faq_tr_backup_20260903_relative     SET SCHEMA archive;

-- Il SET SCHEMA da solo e' il pattern a meta': i grant restano attaccati alla tabella.
-- I due comandi vanno INSIEME, sempre.
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'archive' AND c.relkind = 'r'
  LOOP
    EXECUTE format('REVOKE ALL ON archive.%I FROM anon, authenticated', t.relname);
  END LOOP;
END $$;
