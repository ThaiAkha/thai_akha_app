-- Task #64 (audit is_staff perimeter, 2026-08-18) - solo le due policy ROSSE.
-- is_staff() include driver e logistics: con queste due policy un driver poteva
-- cancellare qualsiasi file di qualsiasi bucket e scrivere fatture agenzia.
-- Le route che le usano (/admin-storage, /manager-reports) sono admin/manager:
-- is_admin() = role IN ('admin','manager') le copre. Le policy arancioni/gialle restano
-- a /database (brain 750_Data_Content/DB_Audit_Fix_2027/Is_Staff_Perimeter_Audit_2026-08.md).
-- Rollback: stessi ALTER POLICY con is_staff().

alter policy "Admin Full Access" on storage.objects
  using (public.is_admin()) with check (public.is_admin());

alter policy ai_write on public.agency_invoices
  using (public.is_admin()) with check (public.is_admin());
