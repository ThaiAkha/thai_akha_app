-- 20260824000000_staff_salaries_breakdown.sql
-- Pagina Salary: dal singolo importo unico al breakdown per voci.
--
-- PRIMA: total_amount (tutto dentro) + overtime_note (testo, mai sommato).
-- DOPO : base_amount + overtime_amount + ssf_amount - other_deduction = net_amount (generata).
--
-- SSF (ประกันสังคม): per Thai Akha NON e' una trattenuta ma una cifra AGGIUNTA al
-- pagamento, che il lavoratore riceve insieme allo stipendio. Per questo entra con
-- il segno +, e nel payslip sta nella colonna redditi (non in quella delle deduzioni).
--
-- overtime_note eliminata: gli straordinari ora sono una cifra, la nota non serve.
-- Nessuna vista/funzione/trigger dipendeva da staff_salaries (verificato live 2026-08-24).
--
-- ATTENZIONE: e' un cambio BREAKING per il codice che legge la tabella
-- (SalaryRoster.tsx, render-report, zoho-create-salary-expense): vanno aggiornati
-- e le due edge function ri-deployate subito dopo questa migration.

alter table public.staff_salaries rename column total_amount to base_amount;

alter table public.staff_salaries
  add column if not exists overtime_amount numeric not null default 0,
  add column if not exists ssf_amount      numeric not null default 0,
  add column if not exists other_deduction numeric not null default 0;

alter table public.staff_salaries
  add column if not exists net_amount numeric
    generated always as (base_amount + overtime_amount + ssf_amount - other_deduction) stored;

alter table public.staff_salaries drop column if exists overtime_note;

comment on column public.staff_salaries.base_amount     is 'Salario base del mese (prefill da staff_details.salary_thb).';
comment on column public.staff_salaries.overtime_amount is 'Straordinari del mese, in THB. Si somma.';
comment on column public.staff_salaries.ssf_amount      is 'Social security (ประกันสังคม): cifra AGGIUNTA al pagamento, non una trattenuta.';
comment on column public.staff_salaries.other_deduction is 'Altre trattenute, in THB. Si sottrae.';
comment on column public.staff_salaries.net_amount      is 'GENERATA: base + overtime + ssf - other_deduction. Importo autorevole per payslip e spesa Zoho.';
