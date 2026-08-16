-- 20260803120000_bookings_select_drop_driver.sql
-- Captures the live change applied 2026-08-03 (owner GO): remove the `driver` branch
-- from bookings_select_scoped.
--
-- Why it is safe / superfluous:
--   The driver route does NOT read `bookings`. DriverRoute.tsx reads driver_route_v,
--   a SECURITY DEFINER + security_barrier view that self-filters on
--   pickup_driver_uid = auth.uid() (or dropoff_driver_uid) and exposes 18 hand-picked
--   travel columns. It does NOT expose special_requests or agency_note; it DOES keep
--   customer_note (the pick-up note, owner decision).
--   Driver writes use the separate "Driver Update Status" UPDATE policy and do not
--   require SELECT (PostgREST .update() without .select()).
--
-- Effect: closes the leak where a driver could read the full booking row of their
--   passengers (special_requests, agency_note). Unblocks Privacy 2142.
--
-- Verified via simulated RLS (real driver with 20 rides, 2026-08-03):
--   bookings visible = 0, passenger rows = 0, sensitive fields = 0;
--   driver_route_v still returns 20 stops with the pick-up note. Route intact.
--
-- Rollback: re-add the driver branch:
--   OR (get_my_role() = 'driver' AND (pickup_driver_uid = auth.uid()
--                                     OR dropoff_driver_uid = auth.uid()))

alter policy bookings_select_scoped on public.bookings
using (
  user_id = auth.uid()
  OR guest_user_id = auth.uid()
  OR get_my_role() = ANY (ARRAY['admin'::text, 'manager'::text, 'kitchen'::text])
);
