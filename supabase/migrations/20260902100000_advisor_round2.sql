-- Security Advisor round 2 (2026-09-02, Cowork /database)
-- Applicato live via MCP lo stesso giorno; questo file e' il record riproducibile.
-- Registro drop: brain 054_Supabase/backups/_DROPPED/_DROPPED_Index.md

-- A. tabelle backup FAQ dimenticate (ERROR rls_disabled_in_public x3)
DROP TABLE IF EXISTS public.faq_backup_20260810_pickup3km;
DROP TABLE IF EXISTS public.faq_backup_20260821_pickup_hours;
DROP TABLE IF EXISTS public.faq_categories_backup_20260822;

-- B. viste translation: leggono solo pg_catalog, nessun consumatore client (ERROR security_definer_view x3)
ALTER VIEW public.v_translation_pairs      SET (security_invoker = true);
ALTER VIEW public.v_translation_pairs_info SET (security_invoker = true);
ALTER VIEW public.v_translations_stale     SET (security_invoker = true);
REVOKE ALL ON public.v_translation_pairs, public.v_translation_pairs_info, public.v_translations_stale
  FROM anon, authenticated;

-- C. driver_route_v: resta SECURITY DEFINER + security_barrier DI PROPOSITO (task #51:
--    bookings RLS senza ramo driver, la vista espone solo colonne safe filtrate per auth.uid()).
--    Advisor: dismiss. Qui solo igiene grant.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.driver_route_v FROM authenticated;

-- D. search_path (WARN function_search_path_mutable x6)
ALTER FUNCTION public.translation_hash_sql SET search_path = public;
ALTER FUNCTION public.translation_mark_fresh SET search_path = public;
ALTER FUNCTION public.faq_tags_validate() SET search_path = public;
ALTER FUNCTION public.translatable_columns SET search_path = public;
ALTER FUNCTION public.translation_source_columns SET search_path = public;
ALTER FUNCTION public.trg_set_translated_at() SET search_path = public;

-- E. trigger function + tooling interno fuori dall'API (WARN 0028/0029).
--    Verificato: nessuna in pg_policies, nessuna .rpc() in packages/scripts, cron gira come postgres.
--    I trigger scattano senza EXECUTE del chiamante (testato come authenticated).
--    NB: REVOKE FROM PUBLIC necessario, il default Postgres concede EXECUTE a PUBLIC.
REVOKE EXECUTE ON FUNCTION public.guard_profiles_privileged_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_set_translated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.faq_tags_validate() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.translations_stale() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.translation_source_hash(text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_asset_storage_metadata(text,text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_chat_messages() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.guard_profiles_privileged_fields(), public.trg_set_translated_at(), public.faq_tags_validate(),
  public.translations_stale(), public.translation_source_hash(text,text,text),
  public.sync_asset_storage_metadata(text,text), public.cleanup_old_chat_messages()
  TO service_role;

-- NON toccare (lezione #84, outage login 2026-07-09): helper usati nelle policy RLS
-- is_admin, is_staff, get_my_role, manages_profile, can_manage_logistics, is_booking_participant
-- e le RPC chiamate dal client (booking split, payout, hotel, agency, Cherry). Advisor: dismiss.
