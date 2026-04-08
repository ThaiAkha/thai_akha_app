-- RPC: check_chat_rate_limit
-- Sostituisce le due query separate in chatSession.service.ts
-- Restituisce: allowed, reason, remaining
--
-- STATO ATTUALE: limiti temporaneamente disabilitati (le prime 2 righe del body).
-- Per riattivare: rimuovere le righe "RETURN QUERY SELECT TRUE..." e "RETURN;" qui sotto.

CREATE OR REPLACE FUNCTION check_chat_rate_limit(
  p_user_id UUID,
  p_session_token TEXT
)
RETURNS TABLE(
  allowed   BOOLEAN,
  reason    TEXT,
  remaining INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_vip        BOOLEAN := FALSE;
  v_message_count INT     := 0;
  v_max_messages  INT     := 30;
  v_is_guest      BOOLEAN;
BEGIN
  -- ═══════════════════════════════════════════════════════
  -- BYPASS TEMPORANEO — rimuovere queste 2 righe per riattivare i limiti
  RETURN QUERY SELECT TRUE::BOOLEAN, 'limits disabled'::TEXT, 999999::INT;
  RETURN;
  -- ═══════════════════════════════════════════════════════

  v_is_guest := (p_user_id IS NULL);

  -- Controllo VIP (solo per loggati): prenotazione confermata presente o futura
  IF NOT v_is_guest THEN
    SELECT EXISTS (
      SELECT 1 FROM bookings
      WHERE user_id    = p_user_id
        AND status     = 'confirmed'
        AND booking_date >= CURRENT_DATE
      LIMIT 1
    ) INTO v_is_vip;

    IF v_is_vip THEN
      RETURN QUERY SELECT TRUE::BOOLEAN, 'VIP - unlimited'::TEXT, 999999::INT;
      RETURN;
    END IF;
  END IF;

  -- Conteggio messaggi
  IF v_is_guest THEN
    -- TODO: p_session_token attualmente sempre NULL (callers non lo passano).
    -- Quando si riattivano i limiti, aggiornare useCherryChat e useGeminiLive per passare
    -- sessionRef.current?.session_token al posto di undefined.
    SELECT COALESCE(message_count, 0) INTO v_message_count
    FROM chat_sessions
    WHERE session_token = p_session_token
    LIMIT 1;
    v_max_messages := 10;
  ELSE
    SELECT COUNT(*)::INT INTO v_message_count
    FROM chat_messages cm
    JOIN chat_sessions cs ON cs.id = cm.session_id
    WHERE cs.user_id     = p_user_id
      AND cm.sender_role = 'user'
      AND cm.created_at  > NOW() - INTERVAL '1 day';
  END IF;

  IF v_message_count < v_max_messages THEN
    RETURN QUERY SELECT TRUE::BOOLEAN, 'OK'::TEXT, (v_max_messages - v_message_count)::INT;
  ELSE
    RETURN QUERY SELECT FALSE::BOOLEAN,
      CASE
        WHEN v_is_guest THEN 'Guest limit reached. Create a free account to continue chatting!'
        ELSE 'Daily limit reached. Come back tomorrow or book a class!'
      END::TEXT,
      0::INT;
  END IF;
END;
$$;
