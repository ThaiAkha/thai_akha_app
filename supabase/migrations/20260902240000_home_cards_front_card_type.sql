-- #5 - variante di resa della card home letta dal DB (front SmartHomeCard).
-- Applicata in produzione via MCP apply_migration "home_cards_front_card_type" (2026-09-02).
ALTER TABLE public.home_cards_front
  ADD COLUMN card_type text NOT NULL DEFAULT 'vertical'
  CONSTRAINT home_cards_front_card_type_chk CHECK (card_type IN ('vertical','horizontal'));

COMMENT ON COLUMN public.home_cards_front.card_type IS 'Variante di resa della card nel front (#5): vertical | horizontal. Lista chiusa via CHECK.';

-- Dati: allinea le card esistenti alla resa storica della home (04-05 orizzontali).
UPDATE public.home_cards_front SET card_type = 'horizontal'
 WHERE card_id IN ('home-card-04','home-card-05');
