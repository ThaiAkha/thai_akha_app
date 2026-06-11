-- ============================================================
--  ROLLBACK — Rimozione completa del bypass iniezione manuale.
--  Riporta il DB al punto attuale (pre-bypass).
--  Esegui in quest'ordine. Vedi README_TEMPORANEO.md.
-- ============================================================

-- 1) (Opzionale ma consigliato) Elimina i payout iniettati a mano.
--    Salta questo step se vuoi conservarli nello storico.
DELETE FROM public.driver_payments WHERE source = 'manual';

-- 2) Rimuovi le funzioni del bypass (inject + fase 2: delete self + mark-paid admin).
DROP FUNCTION IF EXISTS public.inject_driver_payout_manual(date, text, integer, integer, uuid);
DROP FUNCTION IF EXISTS public.delete_my_payout(date, text);
DROP FUNCTION IF EXISTS public.mark_driver_week_paid(uuid, date);

-- 3) Rimuovi la colonna di tracciamento.
ALTER TABLE public.driver_payments DROP COLUMN IF EXISTS source;

-- 3b) Disabilita il Realtime aggiunto per il popup pagamento (ignora errore se non presente).
ALTER PUBLICATION supabase_realtime DROP TABLE public.driver_payments;

-- Lato app: rimuovere la cartella _temp_driver_payout/ e le viste aggiunte in
-- DriverHome.tsx + i componenti DriverPayoutForm.tsx / DriverPayoutDashboard.tsx
-- (cercare il commento marcatore BYPASS-PAYOUT).
-- Eliminare l'edge function send-driver-payout-confirmation e lo scheduled task.
