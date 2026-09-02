-- 20260902200000_driver_route_rpc.sql
--
-- driver_route_v (vista SECURITY DEFINER) → RPC driver_route(): stessa difesa #51,
-- forma diversa. Il Security Advisor marca le viste definer ERROR 0010 senza Dismiss;
-- le funzioni definer esposte sono WARN 0029, famiglia gia' accettata. Il perimetro
-- dati del driver resta IDENTICO: 19 colonne safe (niente special_requests, agency_note,
-- prezzi, allergie), filtro get_my_role() + auth.uid() come la vista (Privacy 2142).
--
-- ADDITIVA: la vista resta viva finche' il codice admin non e' deployato sulla RPC.
-- Il DROP e' nella migration successiva (20260902210000), applicata a codice live.
-- Decisione owner 2026-09-02 (PROMPT_driver_route_view_to_rpc nel brain Driver_Ops_2027).

create or replace function public.driver_route()
returns table (
  internal_id uuid,
  booking_date date,
  status text,
  pax_count integer,
  hotel_name text,
  pickup_zone text,
  pickup_time time without time zone,
  phone_number text,
  customer_note text,
  session_id text,
  route_order integer,
  pickup_driver_uid uuid,
  dropoff_driver_uid uuid,
  transport_status text,
  dropoff_hotel text,
  requires_dropoff boolean,
  guest_name text,
  avatar_url text,
  visitor_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  select b.internal_id,
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
         coalesce(p.full_name, 'Guest'::text) as guest_name,
         p.avatar_url,
         b.visitor_count
    from public.bookings b
    left join public.profiles p on p.id = b.user_id
   where (public.get_my_role() = 'driver'::text
          and (b.pickup_driver_uid = auth.uid() or b.dropoff_driver_uid = auth.uid()))
      or public.get_my_role() = any (array['admin'::text, 'manager'::text, 'kitchen'::text]);
$$;

comment on function public.driver_route() is
  'Foglio di trasporto per la rotta driver: campi di viaggio + guest_name/avatar_url. NON espone allergies ne dietary_profile (Privacy 2142). Si auto-scopa come bookings_select_scoped. Sostituisce la vista driver_route_v (ERROR advisor 0010).';

-- anon non deve poterla chiamare: il filtro get_my_role() la renderebbe vuota,
-- ma non la si espone comunque.
revoke execute on function public.driver_route() from public, anon;
grant execute on function public.driver_route() to authenticated, service_role;
