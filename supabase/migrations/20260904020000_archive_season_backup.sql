-- 20260904020000_archive_season_backup.sql
-- L'undicesimo backup nato in `public` lo stesso giorno in cui una migration ne sposta
-- dieci in `archive` (20260903120000). Creato da 189_season_update.sql come rete di
-- sicurezza dell'UPDATE di 191 righe: 204 righe, va TENUTO finche' la stagionalita' non
-- e' verificata al mercato. Qui si sposta soltanto.
--
-- Perche' comunque: la regola canonica (agent-memory/database/decisions.md, 10/08/2026)
-- e' che ogni snapshot tabellare nasce in `archive`, schema senza USAGE per
-- anon/authenticated e non esposto da PostgREST. Questo aveva RLS attivo ma ZERO policy,
-- quindi oggi non lo legge nessuno; restava pero' il GRANT ad anon, cioe' una tabella che
-- si apre da sola se domani qualcuno aggiunge una policy permissiva o spegne RLS per un
-- debug. Lo sweep della 20260903120000 non l'avrebbe preso: elenca le tabelle per nome,
-- non per pattern.
--
-- SET SCHEMA e REVOKE vanno INSIEME: spostare da solo e' il pattern a meta', perche' i
-- grant restano attaccati alla tabella.

begin;

create schema if not exists archive;

alter table if exists public.ingredients_library_backup_2026_09_03_season set schema archive;

do $$
declare t record;
begin
  for t in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'archive' and c.relkind = 'r'
  loop
    execute format('revoke all on archive.%I from anon, authenticated', t.relname);
  end loop;
end $$;

do $g$
declare n integer; anon_ok boolean;
begin
  select count(*) into n from pg_class c join pg_namespace ns on ns.oid=c.relnamespace
   where ns.nspname='archive' and c.relname='ingredients_library_backup_2026_09_03_season';
  if n <> 1 then raise exception 'il backup non e in archive dopo lo spostamento'; end if;
  select has_table_privilege('anon','archive.ingredients_library_backup_2026_09_03_season','SELECT') into anon_ok;
  if anon_ok then raise exception 'anon ha ancora SELECT sul backup: il revoke non ha funzionato'; end if;
  raise notice 'backup season in archive, grant anon revocati, 204 righe conservate';
end $g$;

commit;
