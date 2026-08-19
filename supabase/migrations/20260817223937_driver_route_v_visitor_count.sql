-- 20260817223937_driver_route_v_visitor_count.sql
-- Task #75 - "Cherry Driver e' cieca". Applicata live 2026-08-18.
--
-- Regressione: dal 2026-08-03 il ramo driver e' stato rimosso da `bookings_select_scoped` (#51),
-- quindi il driver ha 0 righe su `bookings`. Ma `packages/admin/src/prompts/adminScopedFetch.ts`
-- (scope 'driver') interrogava ancora `.from('bookings')` col client anon+JWT: la RLS non da'
-- errore, FILTRA - `bookingSnapshot` tornava vuoto e la Cherry del driver non sapeva i suoi pickup.
-- Nessuno se n'era accorto perche' non c'era nessun errore da leggere.
--
-- La via giusta e' `driver_route_v`, che copriva tutte le colonne di BOOKING_COLS_DRIVER tranne
-- `visitor_count`: dato di TRASPORTO legittimo (i visitor salgono sul mezzo come gli altri).
-- Qui la colonna viene aggiunta IN CODA (create or replace view non permette di riordinare).
-- `security_barrier = true` ribadito esplicitamente: questa vista e' l'unica via del driver ai pickup.
create or replace view public.driver_route_v
with (security_barrier = true) as
 SELECT b.internal_id,
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
    COALESCE(p.full_name, 'Guest'::text) AS guest_name,
    p.avatar_url,
    b.visitor_count
   FROM bookings b
     LEFT JOIN profiles p ON p.id = b.user_id
  WHERE get_my_role() = 'driver'::text AND (b.pickup_driver_uid = auth.uid() OR b.dropoff_driver_uid = auth.uid()) OR (get_my_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'kitchen'::text]));
