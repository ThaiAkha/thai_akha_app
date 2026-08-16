-- POS: timestamp di quando la teacher ha "salvato" il gruppo (anche senza bibite) → card arancione.
-- Reset a null su nuovo booking / split child / merge.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pos_saved_at timestamptz;
COMMENT ON COLUMN public.bookings.pos_saved_at IS 'POS: quando la teacher ha salvato il gruppo (anche senza bibite). Stato card = arancione finché non pagato (pos_tender).';
