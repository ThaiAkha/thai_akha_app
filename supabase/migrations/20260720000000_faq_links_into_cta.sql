-- FAQ central: unificazione links -> cta.links + drop colonna links.
-- Deploy #1 migrazione render centrale FAQ (2026-07-20).
-- NB: gia' applicata sul DB live via MCP (backup: faq_questions_bak_20260720).
-- Idempotente: se la colonna links non esiste piu', non fa nulla.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'faq_questions' AND column_name = 'links'
  ) THEN
    -- 1. Backup (skip se esiste gia')
    EXECUTE 'CREATE TABLE IF NOT EXISTS faq_questions_bak_20260720 AS TABLE faq_questions';

    -- 2. Merge: incorpora links dentro cta.links (solo righe con links reali)
    EXECUTE $q$
      UPDATE faq_questions
      SET cta = jsonb_set(coalesce(cta, '{}'::jsonb), '{links}', links)
      WHERE links IS NOT NULL AND links::text NOT IN ('null', '[]', '{}')
    $q$;

    -- 3. Drop della colonna (i lettori leggono cta.links)
    EXECUTE 'ALTER TABLE faq_questions DROP COLUMN links';
  END IF;
END $$;
