-- 20260728000300_profiles_guard_hardening.sql
-- Chiude i difetti emersi dalla code-review di 20260728000200_profiles_privilege_guard.
--
-- 1. La guardia era solo BEFORE UPDATE: la policy "Profiles Insert" non vincola alcuna
--    colonna, quindi un utente qualunque poteva INSERIRE un profilo gestito
--    (managed_by = auth.uid()) con role='admin', commission_config, base_salary...
--    Non e' escalation diretta (is_admin() guarda id = auth.uid()), ma forgia righe
--    staff che admin/manager VEDONO e che alimentano i picker driver/kitchen/agency
--    (ManagerDriverPayouts, ManagerReports, useManagerReservation, set_booking_kitchen).
-- 2. REGRESSIONE introdotta dalla migration precedente: la disattivazione account
--    (UserSecurityCard -> is_active=false) e' aperta a kitchen/agency/driver/logistics
--    e veniva bloccata con errore solo loggato in console -> il bottone sembrava morto.
-- 3. driver_route_v non replicava davvero bookings_select_scoped: mancava il gate
--    get_my_role()='driver', quindi un ex-driver retrocesso continuava a leggere le
--    sue corse storiche (nomi, telefoni, note) dove la RLS di bookings ora nega.
-- 4. La vista bypassa RLS by design ma era selezionabile da anon (default Supabase):
--    oggi torna 0 righe, ma l'unica barriera era la WHERE. Revoca + security_barrier.
--    NB: la revoca riguarda SOLO questa vista; i grant di is_admin()/get_my_role() e i
--    privilegi di colonna su profiles restano intoccati.

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 1 + 2 — guardia estesa a INSERT, con eccezione per l'auto-disattivazione
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.guard_profiles_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  offending text := null;
begin
  -- Backend (service_role / postgres / cron: nessun JWT) e staff admin/manager: liberi.
  -- NON usare current_user: in SECURITY DEFINER vale il proprietario, mai il chiamante.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Un utente puo' creare solo profili non privilegiati (es. partecipanti gestiti,
    -- createManagedProfile inserisce role='guest'; il default della colonna e' 'user').
    if new.role is not null and new.role not in ('guest','user') then
      offending := 'role';
    elsif new.commission_config is not null then
      offending := 'commission_config';
    elsif new.base_salary is not null then
      offending := 'base_salary';
    elsif new.auto_invoice is true then
      offending := 'auto_invoice';
    end if;

  else  -- UPDATE
    if new.role                 is distinct from old.role                 then offending := 'role';
    elsif new.managed_by        is distinct from old.managed_by           then offending := 'managed_by';
    elsif new.commission_config is distinct from old.commission_config    then offending := 'commission_config';
    elsif new.base_salary       is distinct from old.base_salary          then offending := 'base_salary';
    elsif new.auto_invoice      is distinct from old.auto_invoice         then offending := 'auto_invoice';
    elsif new.is_active         is distinct from old.is_active
          -- Eccezione: chiunque puo' DISATTIVARE il proprio account (one-way).
          -- Riattivarsi da soli, o toccare l'is_active altrui, resta vietato.
          and not (new.id = auth.uid() and old.is_active is true and new.is_active is false)
      then offending := 'is_active';
    end if;
  end if;

  if offending is not null then
    raise exception
      'Campo privilegiato "%" non modificabile da questo utente (profiles.id=%)',
      offending, coalesce(old.id, new.id)
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profiles_privileged_fields_insert on public.profiles;
create trigger guard_profiles_privileged_fields_insert
  before insert on public.profiles
  for each row execute function public.guard_profiles_privileged_fields();

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 3 — la vista rispecchia ESATTAMENTE bookings_select_scoped
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view public.driver_route_v as
select
  b.internal_id,
  b.booking_date,
  b.status,
  b.pax_count,
  b.hotel_name,
  b.pickup_zone,
  b.pickup_time,
  b.phone_number,
  b.customer_note,
  b.session_id,
  b.route_order,
  b.pickup_driver_uid,
  b.dropoff_driver_uid,
  b.transport_status,
  b.dropoff_hotel,
  b.requires_dropoff,
  coalesce(p.full_name, 'Guest') as guest_name,
  p.avatar_url
from public.bookings b
left join public.profiles p on p.id = b.user_id
where (
        public.get_my_role() = 'driver'
        and (b.pickup_driver_uid = auth.uid() or b.dropoff_driver_uid = auth.uid())
      )
   or public.get_my_role() = any (array['admin','manager','kitchen']);

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 4 — la vista bypassa RLS: non deve essere raggiungibile da anon
-- ─────────────────────────────────────────────────────────────────────────────

alter view public.driver_route_v set (security_barrier = true);
revoke all on public.driver_route_v from anon;
