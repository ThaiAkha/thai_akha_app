-- #102-bis (2026-09-02, GO owner): updated_at VERA anche sulle 18 tabelle madri.
--
-- Prima di questa migration, su queste tabelle updated_at valeva now() alla
-- nascita e nessun trigger la toccava: raccontava la creazione, non la modifica.
-- Consumatori censiti prima di accendere (regola della PROPOSTA_102):
--   - edge `sitemap`: usa updated_at come <lastmod> su recipes/culture/news/
--     categorie/ingredienti -> da oggi lastmod dice il vero (prima: data di nascita).
--   - booking.service getUserMenuSelection: order by updated_at desc limit 1 su
--     menu_selections -> passa da "ultima scelta creata" a "ultima scelta toccata";
--     cambio voluto e piu' corretto ("la scelta corrente dell'utente").
--   - Nessuna vista/funzione DB ordina o filtra per updated_at su queste tabelle.
-- Funzione riusata: update_updated_at_column() (gia' su bookings, recipes, profiles,
-- legal_documents, shop_akha, site_metadata_admin +translations).
-- Nome trigger UNIFORME trg_updated_at: il censimento futuro e' una query sola.
-- Esclusa faq_categories_backup_20260822: backup congelato, non si tocca.
-- I valori STORICI restano date di nascita: la colonna dice il vero solo dal
-- 2026-09-02 (nota in _TABLES_Index; stessa scelta no-backfill della #102).

do $$
declare t text;
begin
  foreach t in array array[
    'akha_news','app_manuals','audio_assets','business_profile','chat_sessions',
    'class_calendar_overrides','class_sections','culture_sections','driver_payments',
    'faq_categories','herb_teas','home_cards_front','info_page_sections',
    'ingredients_library','media_assets','menu_selections','page_sections','staff_details'
  ] loop
    execute format('drop trigger if exists trg_updated_at on public.%I', t);
    execute format('create trigger trg_updated_at before update on public.%I
      for each row execute function public.update_updated_at_column()', t);
  end loop;
end $$;
