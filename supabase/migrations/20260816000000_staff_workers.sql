-- 20260816000000_staff_workers.sql
-- Campagna Staff_Workers_2027 (chiude la base DB di #10 e #29). Applicata live 2026-08-16.
-- Piano: brain 700_To_Do_2027/730_Operations/Staff_Workers_2027/Staff_Workers_Plan_2027.md
--
-- PRINCIPIO: profiles = CHI PUO' (login condiviso, permessi) · authors = CHI E' (persona).
-- authors era gia' l'anagrafe staff; qui diventa ufficiale, con:
--   staff_details  = satellite PRIVATO (chiude il leak: authors e' public-read e
--                    portava salary_thb leggibile da anon; ora la colonna e' svuotata
--                    e la verita' vive qui, RLS admin/manager-only)
--   worker_roles   = cappelli multipli (persona × funzione, is_primary per
--                    preselezione e raggruppamento salary senza doppi conteggi)
--   staff_salaries.employee_id ripuntata: profiles → authors (lo stipendio e'
--                    della persona, non del login; 2 righe draft rimappate: At→at,
--                    Teacher01→aon)
--   market_runs.worker_id = CHI ha fatto la spesa (created_by resta il login)
--   authors.profile_id = ponte per login personali (at, kasem, svevo: selettore auto-bypass)
-- LEGACY senza drop (ordine owner): authors.app_role/staff_group/salary_thb(svuotata),
-- profiles.base_salary. Il codice nuovo usa SOLO worker_roles + staff_details.
-- Verificato per ruolo (RLS simulata): kitchen/driver → staff_details 0 righe;
-- manager/admin → 7. worker_roles leggibile da tutto lo staff. Anon: 0 e TUTTI NULL.

create table if not exists public.staff_details (
  worker_id  uuid primary key references public.authors(id) on delete cascade,
  salary_thb numeric,
  pay_notes  text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.staff_details enable row level security;
create policy sd_read  on public.staff_details for select to authenticated using (is_admin());
create policy sd_write on public.staff_details for all to authenticated using (is_admin()) with check (is_admin());

create table if not exists public.worker_roles (
  worker_id  uuid not null references public.authors(id) on delete cascade,
  role       text not null,  -- teacher · helper · extra · setup · logistics · driver · manager · admin
  is_primary boolean not null default false,
  created_at timestamptz default now(),
  primary key (worker_id, role)
);
alter table public.worker_roles enable row level security;
create policy wr_read  on public.worker_roles for select to authenticated using (true);
create policy wr_write on public.worker_roles for all using (is_admin()) with check (is_admin());

-- dati: travaso stipendi + svuotamento colonna pubblica + cappelli + igiene
insert into staff_details (worker_id, salary_thb)
select id, salary_thb from authors
where not is_organization and not is_ai_agent and salary_thb is not null
on conflict (worker_id) do nothing;
update authors set salary_thb = null where salary_thb is not null;
update authors set app_role = 'admin' where app_role = 'admins';
-- worker_roles: popolazione iniziale 16 righe (9 persone), vedi piano per la mappa cappelli

-- repoint staff_salaries: persona, non login
alter table public.staff_salaries drop constraint if exists staff_salaries_employee_id_fkey;
alter table public.staff_salaries
  add constraint staff_salaries_employee_id_fkey
  foreign key (employee_id) references public.authors(id);

-- eventi + ponte
alter table public.market_runs add column if not exists worker_id uuid references public.authors(id);
alter table public.authors add column if not exists profile_id uuid references public.profiles(id);
