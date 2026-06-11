-- ============================================================
--  ROLLBACK — Rimozione completa del bypass iniezione manuale.
--  Riporta il DB al punto attuale (pre-bypass).
--  Esegui in quest'ordine. Vedi README_TEMPORANEO.md.
-- ============================================================

-- 1) (Opzionale ma consigliato) Elimina i payout iniettati a mano.
--    Salta questo step se vuoi conservarli nello storico.
DELETE FROM public.driver_payments WHERE source = 'manual';

-- 2) Rimuovi la funzione di iniezione.
DROP FUNCTION IF EXISTS public.inject_driver_payout_manual(date, text, integer, integer, uuid);

-- 3) Rimuovi la colonna di tracciamento.
ALTER TABLE public.driver_payments DROP COLUMN IF EXISTS source;

-- Lato app: rimuovere la cartella _temp_driver_payout/ e la vista form
-- aggiunta in DriverHome.tsx (cercare il commento marcatore BYPASS-PAYOUT).
-- Eliminare l'edge function send-driver-payout-confirmation e lo scheduled task.
