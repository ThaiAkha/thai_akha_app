-- Staff_Workers_2027 - chiusura fase CODE (2026-08-17)
-- get_salary_run(p_period) leggeva profiles.base_salary e faceva join staff_salaries.employee_id = profiles.id.
-- Dal 2026-08-16 employee_id punta ad authors (la persona) e la base vive in staff_details:
-- la funzione e' rotta per costruzione e non e' piu' chiamata (SalaryRoster legge le tabelle direttamente).
drop function if exists public.get_salary_run(text);
