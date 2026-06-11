-- ============================================================
--  BYPASS BOOKING — Iniezione manuale payout driver
--  TEMPORANEA. Da rimuovere quando il sistema booking torna attivo.
--  Vedi README_TEMPORANEO.md per il rollback.
--  Target DB: Supabase produzione (mtqullobcsypkqgdkaob, Tokyo)
-- ============================================================

-- 1) Colonna di tracciamento: distingue i record iniettati a mano
--    da quelli generati dai booking. Default 'auto' = comportamento storico.
ALTER TABLE public.driver_payments
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'auto'
  CHECK (source IN ('auto','manual'));

-- 2) RPC di iniezione manuale (self-service).
--    - driver self-service: scrive solo per se stesso (auth.uid()).
--    - admin: può passare p_driver_id per iniettare per conto di un driver.
--    - tariffe lette da driver_payout_tiers (unica fonte di verità).
--    - non sovrascrive mai un payout già 'paid'.
CREATE OR REPLACE FUNCTION public.inject_driver_payout_manual(
  p_run_date    date,
  p_session_id  text,
  p_total_stops integer,
  p_total_pax   integer,
  p_driver_id   uuid DEFAULT NULL
)
RETURNS TABLE(payout_amount integer, total_stops integer, status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_driver uuid; v_tier_price integer; v_existing text;
BEGIN
  v_driver := COALESCE(p_driver_id, auth.uid());

  IF v_driver <> auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Non autorizzato a iniettare payout per un altro driver';
  END IF;
  IF p_total_stops IS NULL OR p_total_stops < 1 THEN
    RAISE EXCEPTION 'Le fermate devono essere >= 1';
  END IF;
  IF p_total_pax IS NULL OR p_total_pax < 0 THEN
    RAISE EXCEPTION 'I pax devono essere >= 0';
  END IF;
  IF p_session_id NOT IN ('morning_class','evening_class') THEN
    RAISE EXCEPTION 'session_id non valido';
  END IF;

  -- NB: qualificare le colonne (dp./t.) — gli OUT param status/total_stops/payout_amount
  -- vanno altrimenti in ambiguità con le colonne omonime della tabella.
  SELECT dp.status INTO v_existing FROM driver_payments dp
   WHERE dp.driver_id=v_driver AND dp.run_date=p_run_date AND dp.session_id=p_session_id;
  IF v_existing = 'paid' THEN
    RAISE EXCEPTION 'Payout già pagato per questa data/sessione: non modificabile';
  END IF;

  SELECT t.price_thb INTO v_tier_price FROM driver_payout_tiers t
   WHERE t.session_type=p_session_id
     AND p_total_stops>=t.min_stops AND p_total_stops<=t.max_stops
   LIMIT 1;

  INSERT INTO driver_payments AS dp
    (driver_id, run_date, session_id, total_stops, total_pax, payout_amount, status, source)
  VALUES
    (v_driver, p_run_date, p_session_id, p_total_stops, p_total_pax,
     COALESCE(v_tier_price,0), 'pending', 'manual')
  ON CONFLICT (driver_id, run_date, session_id) DO UPDATE SET
    total_stops   = EXCLUDED.total_stops,
    total_pax     = EXCLUDED.total_pax,
    payout_amount = EXCLUDED.payout_amount,
    source        = 'manual',
    updated_at    = NOW();

  RETURN QUERY SELECT COALESCE(v_tier_price,0), p_total_stops, 'pending'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inject_driver_payout_manual TO authenticated;

-- ============================================================
--  Mappatura range form -> p_total_stops (rappresentativo):
--    "1-2"  -> 2     "3-4" -> 4     "5-6" -> 6     "7plus" -> 7
--  La tariffa dipende solo dallo scaglione, non dal valore esatto.
-- ============================================================
