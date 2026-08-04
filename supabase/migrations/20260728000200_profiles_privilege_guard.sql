-- 20260728000200_profiles_privilege_guard.sql
-- Blindatura di public.profiles prima della pubblicazione dei documenti legali.
--
-- PROBLEMA 1 (riprodotto): "Profiles Update" ha USING senza WITH CHECK, e authenticated
--   ha UPDATE sulla colonna role -> un utente qualunque poteva fare
--   `update profiles set role='admin' where id = auth.uid()` e da li' leggere TUTTI i
--   profili via profiles_select_scoped (nomi, email, telefoni, ALLERGIE = dati sanitari).
--   In Supabase ogni utente loggato e' lo stesso ruolo Postgres `authenticated`, quindi
--   revocare il privilegio di colonna romperebbe anche l'app admin: serve un trigger.
--
-- PROBLEMA 2 (riprodotto): il ramo `driver` di profiles_select_scoped da' al driver la
--   RIGA del profilo passeggero, e RLS non filtra per colonna -> il driver leggeva
--   allergies e dietary_profile. La Privacy Policy 2142 promette il contrario.
--
-- VINCOLI RISPETTATI: nessun GRANT/REVOKE, is_admin() e get_my_role() non modificate,
-- nessun DELETE, tutto idempotente.

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 1.1 — Trigger di guardia sui campi privilegiati
-- ─────────────────────────────────────────────────────────────────────────────
-- Bypass backend: con service_role / postgres / cron non esiste un JWT, quindi
-- auth.uid() e' NULL e is_admin() sarebbe false -> senza questo ramo il trigger
-- bloccherebbe le scritture di backend, migration e Edge Function. Oggi nessuna Edge
-- Function fa UPDATE su profiles (verificato), ma senza il bypass una futura funzione
-- fallirebbe in modo oscuro.
--
-- ATTENZIONE: NON usare current_user per riconoscere il chiamante. In una funzione
-- SECURITY DEFINER current_user e' sempre il PROPRIETARIO (postgres), mai chi invoca:
-- un controllo `current_user = 'service_role'` non scatta mai. auth.uid() e' l'unico
-- discriminante affidabile. Sicuro perche' un utente loggato ha sempre un uid, e `anon`
-- e' gia' escluso dalla policy "Profiles Update" (to authenticated).

create or replace function public.guard_profiles_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  offending text := null;
begin
  -- Backend (nessun JWT) e staff admin/manager: nessun vincolo.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- IS DISTINCT FROM: tratta correttamente i NULL (NULL -> valore e viceversa).
  if new.role              is distinct from old.role              then offending := 'role';
  elsif new.managed_by     is distinct from old.managed_by        then offending := 'managed_by';
  elsif new.commission_config is distinct from old.commission_config then offending := 'commission_config';
  elsif new.base_salary    is distinct from old.base_salary       then offending := 'base_salary';
  elsif new.auto_invoice   is distinct from old.auto_invoice      then offending := 'auto_invoice';
  elsif new.is_active      is distinct from old.is_active         then offending := 'is_active';
  end if;

  if offending is not null then
    raise exception
      'Campo privilegiato "%" modificabile solo da admin/manager (profiles.id=%)',
      offending, old.id
      using errcode = '42501';  -- insufficient_privilege
  end if;

  return new;
end;
$$;

comment on function public.guard_profiles_privileged_fields() is
  'Impedisce a un utente non admin/manager di alterare i propri campi privilegiati (role, managed_by, commission_config, base_salary, auto_invoice, is_active). service_role esente.';

drop trigger if exists guard_profiles_privileged_fields on public.profiles;
create trigger guard_profiles_privileged_fields
  before update on public.profiles
  for each row execute function public.guard_profiles_privileged_fields();

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 1.2 — WITH CHECK esplicito su "Profiles Update"
-- Non e' la barriera (lo e' il trigger), ma rende esplicito l'intento: senza
-- WITH CHECK Postgres riusa la USING sulla riga NUOVA in modo implicito.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "Profiles Update" on public.profiles;
create policy "Profiles Update" on public.profiles
  for update to authenticated
  using      ((auth.uid() = id) or (managed_by = auth.uid()) or is_admin())
  with check ((auth.uid() = id) or (managed_by = auth.uid()) or is_admin());

-- NOTA: TASK 1.3 del prompt (restringere la scrittura dei legali a get_my_role()='admin')
-- NON e' stato applicato per decisione dell'owner: con 1 solo utente admin sarebbe un
-- single point of failure. Le policy "admin write" su legal_documents restano su
-- is_admin() (admin + manager, 4 persone).

-- ─────────────────────────────────────────────────────────────────────────────
-- FASE 2 — Il driver non deve leggere allergies / dietary_profile
-- ─────────────────────────────────────────────────────────────────────────────
-- Vista dedicata al foglio di trasporto: espone SOLO i campi di viaggio + il nome e
-- l'avatar del passeggero. Le colonne sanitarie non compaiono affatto.
-- La vista e' security definer per default (PG: security_invoker = false), quindi si
-- auto-scopa nella WHERE rispecchiando ESATTAMENTE bookings_select_scoped: driver sulle
-- proprie corse, staff su tutte (la rotta /driver e' aperta a admin, manager e driver).

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
where b.pickup_driver_uid = auth.uid()
   or b.dropoff_driver_uid = auth.uid()
   or public.get_my_role() = any (array['admin','manager','kitchen']);

comment on view public.driver_route_v is
  'Foglio di trasporto per la rotta driver: campi di viaggio + guest_name/avatar_url. NON espone allergies ne dietary_profile (Privacy 2142). Si auto-scopa come bookings_select_scoped.';

grant select on public.driver_route_v to authenticated;

-- Rimozione del ramo `driver` da profiles_select_scoped: il driver non ha piu' accesso
-- diretto alle righe profilo dei passeggeri (legge i nomi dalla vista qui sopra).
drop policy if exists profiles_select_scoped on public.profiles;
create policy profiles_select_scoped on public.profiles
  for select
  using (
    (auth.uid() = id)
    or (managed_by = auth.uid())
    or (get_my_role() = any (array['admin','manager','kitchen']))
  );
