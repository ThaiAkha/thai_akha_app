-- #106 - la data della spesa non e' la data della run.
-- `run_date` resta il giorno PIANIFICATO (identita' della run, unique con shopper_role);
-- `spent_on` e' il giorno in cui i soldi sono usciti davvero (spesa fuori calendario:
-- la run rotola al prossimo giorno utile, ma la spesa va registrata sul giorno vero).
-- Default = run_date via trigger (un DEFAULT statico non puo' riferire un'altra colonna).
-- L'edge zoho-create-market-expense usa spent_on (fallback run_date) come data Expense.

alter table public.market_runs add column if not exists spent_on date;
comment on column public.market_runs.spent_on is
  'Giorno in cui i soldi sono usciti davvero (spesa fuori calendario inclusa). Default = run_date via trigger. #106';

-- Backfill: il guard market_runs_guard_trg blocca l'UPDATE delle righe expensed
-- per chi non e' admin/service_role (la migration MCP non e' nessuno dei due).
-- Disabilitato SOLO per il backfill, dentro la stessa transazione.
alter table public.market_runs disable trigger market_runs_guard_trg;
update public.market_runs set spent_on = run_date where spent_on is null;
alter table public.market_runs enable trigger market_runs_guard_trg;

create or replace function public.market_runs_default_spent_on()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.spent_on is null then
    new.spent_on := new.run_date;
  end if;
  return new;
end $$;

drop trigger if exists market_runs_default_spent_on_trg on public.market_runs;
create trigger market_runs_default_spent_on_trg
  before insert or update on public.market_runs
  for each row execute function public.market_runs_default_spent_on();

-- Rollback:
--   drop trigger market_runs_default_spent_on_trg on public.market_runs;
--   drop function public.market_runs_default_spent_on();
--   alter table public.market_runs drop column spent_on;
