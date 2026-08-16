-- Market Ops — auto-generazione spese (helper gruppi pronti)
-- Individua i gruppi market_runs pronti per l'Expense Zoho automatica:
--   logistics → ogni run 'approved' non ancora expensed (1 Expense per run)
--   teacher   → mese 'approved' al completo, non ancora expensed (1 Expense per mese)
-- Usato dal tick cron `market_autoexpense_tick()` (vedi 20260621000100_*).

create or replace function public.get_market_pending_expenses()
returns table(stream text, run_ids uuid[], runs int, total numeric, period_label text)
language sql stable
set search_path to 'public'
as $$
  -- LOGISTICS: ogni run 'approved' non ancora expensed = 1 gruppo (1 Expense per run)
  select 'logistics'::text as stream, array[id] as run_ids, 1 as runs,
         total_cost as total, to_char(run_date,'YYYY-MM-DD') as period_label
  from market_runs
  where shopper_role='logistics' and status='approved'
    and zoho_expense_id is null and coalesce(total_cost,0) > 0
  union all
  -- TEACHER: mese eleggibile solo se TUTTI i run del mese sono 'approved' e nessuno expensed
  select 'teacher', array_agg(id order by run_date), count(*)::int,
         sum(total_cost), to_char(date_trunc('month',run_date),'YYYY-MM')
  from market_runs
  where shopper_role='teacher' and run_date is not null
  group by date_trunc('month',run_date)
  having bool_and(status='approved') and bool_and(zoho_expense_id is null)
     and coalesce(sum(total_cost),0) > 0;
$$;

comment on function public.get_market_pending_expenses() is
  'Market Ops: gruppi pronti per Expense Zoho auto-generata. logistics=per run, teacher=per mese. Solo run approved+non-expensed con totale>0.';
