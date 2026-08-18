-- Task #64 (audit is_staff perimeter, 2026-08-18) - policy ARANCIONI.
-- Usate solo da route admin/manager (agency-reports, manager-reports, admin-inventory,
-- useAdminBooking, contenuti class_sections, certificati): is_staff() dava accesso anche
-- a driver/kitchen/logistics. Ora is_admin() = role IN ('admin','manager').
-- Test per ruolo (impersonazione JWT, 2026-08-18): shop_akha driver/kitchen/logistics 97 → 0,
-- class_sections UPDATE solo admin/manager, agency invariata (vede solo le proprie fatture).
-- Fuori da questa migration: "Bookings Edit" (DriverRoute.tsx fa UPDATE diretti su bookings)
-- e le policy verdi (shop_contacts per logistics, market_runs, booking_participants, ingredients).
-- Audit: brain 750_Data_Content/DB_Audit_Fix_2027/Is_Staff_Perimeter_Audit_2026-08.md
-- Rollback: stessi ALTER POLICY con is_staff().

alter policy ai_select on public.agency_invoices
  using (agency_id = auth.uid() or public.is_admin());

alter policy pp_staff_all on storage.objects
  using (bucket_id = 'payment-proofs' and public.is_admin())
  with check (bucket_id = 'payment-proofs' and public.is_admin());

alter policy pp_agency_read on storage.objects
  using (bucket_id = 'payment-proofs'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

alter policy "Staff can insert any booking" on public.bookings
  with check (public.is_admin());

alter policy "Staff insert class sections" on public.class_sections
  with check (public.is_admin());

alter policy "Staff update class sections" on public.class_sections
  using (public.is_admin()) with check (public.is_admin());

alter policy "Staff delete class sections" on public.class_sections
  using (public.is_admin());

alter policy "Staff Manage Inventory" on public.shop_akha
  using (public.is_admin());

alter policy cert_read on public.certificates
  using (((profile_id = auth.uid() or public.manages_profile(profile_id)) and download_until > now())
         or public.is_admin());
