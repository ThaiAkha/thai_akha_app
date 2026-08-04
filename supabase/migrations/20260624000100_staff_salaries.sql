-- Salari staff → Expense Zoho "pay salary" (bank/cash).
-- profiles.base_salary: importo base di default (pre-compila la pagina).
-- staff_salaries: 1 riga per dipendente/mese (period 'YYYY-MM'), draft -> paid.

alter table public.profiles add column if not exists base_salary numeric;

create table if not exists public.staff_salaries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  period text not null,                              -- 'YYYY-MM'
  total_amount numeric not null default 0,           -- base + straordinari
  overtime_note text,                                -- gli straordinari, in nota
  pay_method text not null default 'bank' check (pay_method in ('bank','cash')),
  status text not null default 'draft' check (status in ('draft','paid')),
  zoho_expense_id text,
  zoho_synced_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (employee_id, period)
);
comment on table public.staff_salaries is 'Pay-run stipendi: 1 riga per dipendente/mese. status draft->paid quando creata l Expense Zoho.';

alter table public.staff_salaries enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='staff_salaries' and policyname='staff_salaries_staff_all') then
    create policy staff_salaries_staff_all on public.staff_salaries for all
      using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Roster per la pagina: dipendenti + base_salary + eventuale riga del periodo.
create or replace function public.get_salary_run(p_period text)
returns table(
  employee_id uuid, full_name text, role text, zoho_contact_id text, base_salary numeric,
  salary_id uuid, total_amount numeric, overtime_note text, pay_method text, status text, zoho_expense_id text
)
language sql stable
set search_path to 'public'
as $$
  select p.id, p.full_name, p.role, p.zoho_contact_id, p.base_salary,
         s.id, s.total_amount, s.overtime_note,
         coalesce(s.pay_method,'bank'), coalesce(s.status,'draft'), s.zoho_expense_id
  from profiles p
  left join staff_salaries s on s.employee_id = p.id and s.period = p_period
  where p.role in ('manager','kitchen','logistics','driver')   -- payroll: esclude admin/owner e agency
  order by p.role, p.full_name;
$$;
comment on function public.get_salary_run(text) is 'Roster stipendi per la pagina: dipendenti + base_salary + eventuale riga staff_salaries del periodo.';
