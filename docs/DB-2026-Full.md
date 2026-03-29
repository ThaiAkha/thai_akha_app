# Database Schema — Thai Akha Kitchen 2026

> **Single Source of Truth** — Aggiornato il 29 Mar 2026 dallo schema reale Supabase (interrogato via MCP).
> Progetto: `mtqullobcsypkqgdkaob` · Regione: `ap-northeast-1` (Tokyo) · Postgres 17.6

**Totale tabelle pubbliche: 51**

---

## Indice per Dominio

| Dominio | Tabelle |
|---|---|
| [Users & Auth](#1-users--auth) | `profiles` |
| [Bookings](#2-bookings) | `bookings`, `booking_participants` |
| [Classi & Sessioni](#3-classi--sessioni) | `cooking_classes`, `class_sessions`, `class_calendar_overrides`, `class_sections` |
| [Pickup & Trasporti](#4-pickup--trasporti) | `pickup_zones`, `meeting_points`, `hotel_locations`, `hotel_pickup_rules`, `driver_payout_tiers`, `driver_payments` |
| [Menu & Ricette](#5-menu--ricette) | `menu_selections`, `recipes`, `recipe_categories`, `recipe_key_ingredients`, `recipe_selection_categories`, `recipe_selections`, `spiciness_levels` |
| [Ingredienti & Logistica](#6-ingredienti--logistica) | `ingredients_library`, `ingredient_categories`, `recipe_composition`, `market_runs` |
| [Shop](#7-shop) | `shop_akha`, `shop_orders`, `shop_storefront`, `shop_categories`, `shop_contacts` |
| [Quiz](#8-quiz) | `quiz_levels`, `quiz_modules`, `quiz_questions`, `quiz_rewards` |
| [Content & CMS](#9-content--cms) | `site_metadata`, `site_metadata_admin`, `site_metadata_admin_translations`, `culture_sections`, `ethnic_groups`, `home_cards`, `home_cards_translations`, `home_cards_front`, `gallery_items`, `page_sections`, `akha_news`, `audio_assets`, `media_assets` |
| [Cherry AI](#10-cherry-ai) | `chat_sessions`, `chat_messages` |
| [Diete & Allergie](#11-diete--allergie) | `dietary_profiles`, `dietary_substitutions`, `allergy_knowledge` |

---

## 1. Users & Auth

### `profiles`
RLS: ✅ | Rows: ~14

Estende `auth.users` di Supabase. Creata automaticamente via trigger on-signup.

| Colonna | Tipo | Vincoli | Note |
|---|---|---|---|
| `id` | uuid | PK, NOT NULL | FK → `auth.users.id` |
| `full_name` | text | nullable | |
| `email` | text | nullable | |
| `role` | text | DEFAULT `'user'`, CHECK | `admin`, `manager`, `agency`, `kitchen`, `driver`, `alumni`, `guest` |
| `dietary_profile` | text | DEFAULT `'diet_regular'` | FK → `dietary_profiles.id` |
| `allergies` | jsonb | DEFAULT `[]` | Array di allergy_key |
| `preferred_spiciness_id` | integer | DEFAULT `2` | FK → `spiciness_levels.id` |
| `avatar_url` | text | nullable | Se null: generato automaticamente da age/gender |
| `gender` | text | CHECK | `male`, `female`, `other` |
| `age` | integer | nullable | |
| `nationality` | text | nullable | |
| `is_active` | boolean | DEFAULT `true` | |
| `whatsapp` | boolean | DEFAULT `false` | |
| `line_id` | text | nullable | |
| `managed_by` | uuid | nullable | FK → `profiles.id` (agenzie con sub-account) |
| `agency_commission_rate` | integer | nullable | % commissione |
| `agency_company_name` | text | nullable | |
| `agency_tax_id` | text | nullable | |
| `agency_phone` | text | nullable | |
| `agency_address` | text | nullable | |
| `agency_city` | text | nullable | |
| `agency_province` | text | nullable | |
| `agency_country` | text | nullable | |
| `agency_postal_code` | text | nullable | |
| `commission_config` | jsonb | nullable | Config commissioni avanzata |
| `zoho_contact_id` | text | nullable | |
| `updated_at` | timestamptz | DEFAULT `now()` | |

**RLS Policies** (effettive):
- `Profiles View` SELECT: `auth.uid() = id OR is_staff() OR managed_by = auth.uid()`
- `Profiles Insert` INSERT: `auth.uid() = id`
- `Profiles Update` UPDATE: `auth.uid() = id OR is_admin()`

---

## 2. Bookings

### `bookings`
RLS: ✅ | Rows: ~76

Tabella centrale del sistema. Gestisce prenotazioni B2C e B2B (agency).

| Colonna | Tipo | Vincoli | Note |
|---|---|---|---|
| `internal_id` | uuid | PK, NOT NULL, DEFAULT `gen_random_uuid()` | |
| `booking_ref` | text | nullable | Codice leggibile opzionale |
| `user_id` | uuid | nullable | FK → `profiles.id` (null per guest) |
| `guest_user_id` | uuid | nullable | FK → `profiles.id` per prenotazioni ospite |
| `guest_name` | text | nullable | |
| `guest_email` | text | nullable | |
| `booking_date` | date | NOT NULL, DEFAULT `now()` | Data della classe |
| `session_type` | text | nullable | FK → `class_sessions.id` |
| `session_id` | text | nullable | |
| `status` | text | DEFAULT `'confirmed'`, CHECK | `pending`, `confirmed`, `cancelled`, `completed`, `amended` |
| `booking_source` | text | nullable | `website`, `agency`, `walk-in`, ecc. |
| `pax_count` | integer | DEFAULT `1` | Numero partecipanti |
| `visitor_count` | integer | DEFAULT `0` | Visitatori non partecipanti |
| `total_price` | integer | DEFAULT `0` | In THB |
| `applied_commission_rate` | integer | DEFAULT `0` | % commissione applicata |
| `commission_amount` | integer | DEFAULT `0` | Importo commissione THB |
| `payment_method` | text | DEFAULT `'pay_on_arrival'` | |
| `payment_status` | text | DEFAULT `'pending'` | |
| `hotel_name` | text | nullable | |
| `pickup_zone` | text | CHECK | `green`, `yellow`, `pink`, `azure`, `outside`, `walk-in` |
| `pickup_time` | time | nullable | |
| `pickup_lat` | numeric | nullable | |
| `pickup_lng` | numeric | nullable | |
| `pickup_driver_uid` | uuid | nullable | FK → `profiles.id` |
| `pickup_sequence` | integer | DEFAULT `99` | |
| `dropoff_hotel` | text | nullable | |
| `dropoff_zone` | text | CHECK | Stessi valori di `pickup_zone` |
| `dropoff_lat` | numeric | nullable | |
| `dropoff_lng` | numeric | nullable | |
| `dropoff_driver_uid` | uuid | nullable | FK → `profiles.id` |
| `dropoff_sequence` | integer | DEFAULT `99` | |
| `requires_dropoff` | boolean | DEFAULT `true` | |
| `transport_status` | text | DEFAULT `'waiting'`, CHECK | `waiting`, `driver_en_route`, `driver_arrived`, `on_board`, `dropped_off` |
| `actual_pickup_time` | timestamptz | nullable | |
| `actual_dropoff_time` | timestamptz | nullable | |
| `meeting_point` | text | nullable | |
| `has_luggage` | boolean | DEFAULT `false` | |
| `route_order` | integer | DEFAULT `0` | |
| `phone_number` | text | nullable | |
| `phone_prefix` | text | nullable | |
| `special_requests` | text | nullable | |
| `customer_note` | text | nullable | |
| `agency_note` | text | nullable | |
| `reservation_id_agency` | text | nullable | ID prenotazione lato agenzia |
| `email_reference` | text | nullable | |
| `parent_booking_id` | uuid | nullable | FK → `bookings.internal_id` (split booking) |
| `is_split_child` | boolean | DEFAULT `false` | |
| `zoho_invoice_id` | text | nullable | |
| `created_at` | timestamptz | DEFAULT `now()` | |
| `updated_at` | timestamptz | DEFAULT `now()` | |

**RLS Policies**:
- `Bookings View` SELECT: `user_id = auth.uid() OR guest_user_id = auth.uid() OR is_staff()`
- `Bookings Create` INSERT: `true` (aperto)
- `Bookings Edit` UPDATE: `user_id = auth.uid() OR is_staff()`
- `Admin Update` UPDATE: role IN (`admin`, `manager`)
- `Driver Update Status` UPDATE: `auth.uid() IN (pickup_driver_uid, dropoff_driver_uid)` con check role=driver

---

### `booking_participants`
RLS: ✅ | Rows: 0

Collega più utenti registrati a una singola prenotazione (gruppi).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK, DEFAULT `gen_random_uuid()` |
| `booking_id` | uuid | NOT NULL, FK → `bookings.internal_id` |
| `user_id` | uuid | NOT NULL, FK → `profiles.id` |
| `is_leader` | boolean | DEFAULT `false` |
| `joined_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**:
- `Manage Participants` ALL: `user_id = auth.uid() OR is_admin()`
- `View Participants` SELECT: owner, co-participants, or is_staff()

---

## 3. Classi & Sessioni

### `cooking_classes`
RLS: ✅ | Rows: 2

Catalogo classi (Morning / Evening).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `title` | text | NOT NULL |
| `badge` | text | nullable |
| `tags` | text[] | nullable |
| `price` | integer | NOT NULL |
| `currency` | text | DEFAULT `'THB'` |
| `unit` | text | DEFAULT `'per person'` |
| `theme_color` | text | nullable |
| `duration_text` | text | nullable |
| `tagline` | text | nullable |
| `capacity_text` | text | nullable |
| `image_url` | text | nullable |
| `description` | text | nullable |
| `highlights` | text[] | nullable |
| `schedule_items` | jsonb | nullable |
| `inclusions` | text[] | nullable |
| `is_active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `class_sessions`
RLS: ✅ | Rows: 2

Configurazione sessioni (`morning`, `evening`).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `display_name` | text | NOT NULL |
| `price_thb` | integer | NOT NULL |
| `duration_hours` | numeric | nullable |
| `has_market_tour` | boolean | DEFAULT `false` |
| `start_time` | time | NOT NULL |
| `end_time` | time | NOT NULL |
| `max_capacity` | integer | NOT NULL |
| `schedule_config` | jsonb | NOT NULL |
| `meeting_points` | jsonb | nullable |
| `active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `class_calendar_overrides`
RLS: ✅ | Rows: ~90

Override capacità o chiusure per data specifica.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `date` | date | NOT NULL |
| `session_id` | text | NOT NULL, FK → `class_sessions.id` |
| `is_closed` | boolean | DEFAULT `false` |
| `custom_capacity` | integer | nullable |
| `closure_reason` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `class_sections`
RLS: ✅ | Rows: 5

Sezioni di contenuto per le pagine classe (accordion, timeline, grid, alert).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `section_key` | text | NOT NULL |
| `title` | text | NOT NULL |
| `subtitle` | text | nullable |
| `description` | text | NOT NULL |
| `tag_badge` | text | nullable |
| `ui_style` | text | DEFAULT `'accordion'`, CHECK | `accordion`, `timeline`, `grid_card`, `alert_box` |
| `assigned_classes` | text[] | DEFAULT `{}` |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

---

## 4. Pickup & Trasporti

### `pickup_zones`
RLS: ✅ | Rows: 6

Zone colorate per il sistema pickup (green, yellow, pink, azure, outside, walk-in).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `name` | text | NOT NULL |
| `color_code` | text | nullable |
| `morning_pickup_time` | time | nullable |
| `morning_pickup_end` | time | nullable |
| `evening_pickup_time` | time | nullable |
| `evening_pickup_end` | time | nullable |
| `description` | text | nullable |
| `display_order` | integer | DEFAULT `100` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `meeting_points`
RLS: ✅ | Rows: 10

Punti di raccolta fisici con coordinate GPS.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `name` | text | NOT NULL |
| `description` | text | nullable |
| `latitude` | numeric | nullable |
| `longitude` | numeric | nullable |
| `google_maps_link` | text | nullable |
| `image_url` | text | nullable |
| `icon_url` | text | nullable |
| `morning_pickup_time` | time | nullable |
| `morning_pickup_end` | time | nullable |
| `evening_pickup_time` | time | nullable |
| `evening_pickup_end` | time | nullable |
| `active` | boolean | DEFAULT `true` |

**RLS Policies**: Admin Write / Public Read

---

### `hotel_locations`
RLS: ✅ | Rows: ~1395

Database hotel/strutture con coordinate per calcolo zona pickup.

| Colonna | Tipo | Vincoli | Note |
|---|---|---|---|
| `id` | uuid | PK |
| `name` | text | NOT NULL |
| `zone_id` | text | nullable | FK → `pickup_zones.id` |
| `latitude` | numeric | nullable |
| `longitude` | numeric | nullable |
| `address` | text | nullable |
| `phone_number` | text | nullable |
| `website` | text | nullable |
| `map_link` | text | nullable | Link diretto per driver |
| `google_place_id` | text | nullable |
| `source` | text | DEFAULT `'admin'`, CHECK | `admin`, `google`, `user_pin` |
| `review_status` | text | DEFAULT `'approved'`, CHECK | `pending`, `approved`, `rejected` |
| `rejection_reason` | text | nullable |
| `submitted_by` | uuid | nullable | FK → `profiles.id` |
| `is_active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**:
- `Public Read Active` SELECT: `is_active = true`
- `Admin Full Access` ALL: `is_admin()`
- `Users Suggest Hotel` INSERT: authenticated + `review_status = 'pending'`

---

### `hotel_pickup_rules`
RLS: ✅ | Rows: 0

Override punto di incontro per hotel specifici (es. traffico, costruzione).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `hotel_id` | uuid | NOT NULL, FK → `hotel_locations.id` |
| `day_of_week` | integer | CHECK `0-6` (nullable = tutti i giorni) |
| `start_time` | time | NOT NULL, DEFAULT `00:00:00` |
| `end_time` | time | NOT NULL, DEFAULT `23:59:59` |
| `alt_meeting_point` | text | NOT NULL |
| `alt_latitude` | numeric | NOT NULL |
| `alt_longitude` | numeric | NOT NULL |
| `alt_map_link` | text | nullable |
| `guest_message` | text | nullable |
| `is_active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin/Manager/Logistics Write / Public Read

---

### `driver_payout_tiers`
RLS: ✅ | Rows: 8

Fasce di pagamento driver basate su numero di fermate.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `session_type` | text | NOT NULL, CHECK | `morning_class`, `evening_class` |
| `min_stops` | integer | NOT NULL |
| `max_stops` | integer | NOT NULL |
| `price_thb` | integer | NOT NULL |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Manage / Staff Read

---

### `driver_payments`
RLS: ✅ | Rows: ~4

Pagamenti effettivi driver per giornata.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `driver_id` | uuid | NOT NULL, FK → `profiles.id` |
| `run_date` | date | NOT NULL |
| `session_id` | text | NOT NULL |
| `total_stops` | integer | NOT NULL |
| `total_pax` | integer | NOT NULL |
| `payout_amount` | integer | NOT NULL |
| `status` | text | DEFAULT `'pending'`, CHECK | `pending`, `paid` |
| `paid_at` | timestamptz | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin All / Driver Read Own

---

## 5. Menu & Ricette

### `menu_selections`
RLS: ✅ | Rows: ~31

Selezioni menu dell'utente per la sua prenotazione.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | nullable, FK → `profiles.id` |
| `booking_id` | uuid | nullable, FK → `bookings.internal_id` |
| `curry_id` | text | nullable |
| `soup_id` | text | nullable |
| `stirfry_id` | text | nullable |
| `selected_allergies` | text[] | DEFAULT `{}` |
| `selected_profile` | text | DEFAULT `'regular'` |
| `spiciness_id` | integer | nullable, FK → `spiciness_levels.id` |
| `updated_at` | timestamptz | DEFAULT `now()` |

---

### `recipes`
RLS: ✅ | Rows: 18

| Colonna | Tipo | Vincoli | Note |
|---|---|---|---|
| `id` | text | PK |
| `name` | text | NOT NULL |
| `thai_name` | text | nullable |
| `description` | text | NOT NULL |
| `category` | text | nullable | FK → `recipe_categories.id` |
| `spiciness` | integer | CHECK `1-5` |
| `is_vegan` | boolean | DEFAULT `false` |
| `is_vegetarian` | boolean | DEFAULT `false` |
| `is_signature` | boolean | DEFAULT `false` |
| `is_fixed_dish` | boolean | DEFAULT `false` |
| `has_peanuts` | boolean | DEFAULT `false` |
| `has_shellfish` | boolean | DEFAULT `false` |
| `has_gluten` | boolean | DEFAULT `false` |
| `has_soy` | boolean | DEFAULT `false` |
| `image` | text | nullable |
| `gallery_images` | text[] | DEFAULT `{}` |
| `color_theme` | text | nullable |
| `health_benefits` | text | nullable |
| `dietary_variants` | jsonb | DEFAULT `{}` | Override testi per diete (es. `{"diet_vegan": {"title": "..."}}`) |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `recipe_categories`
RLS: ✅ | Rows: 6

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `image` | text | nullable |
| `icon_name` | text | DEFAULT `'utensils'` |
| `display_order` | integer | DEFAULT `0` |
| `ui_quote` | text | nullable |
| `content_body` | text | nullable |
| `audio_story_url` | text | nullable |
| `cherry_context` | text | nullable |
| `chef_secrets` | text[] | nullable |
| `keywords` | text[] | nullable |

---

### `recipe_key_ingredients`
RLS: ✅ | Rows: ~76

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `recipe_id` | text | FK → `recipes.id` |
| `ingredient` | text | NOT NULL |
| `display_order` | integer | DEFAULT `0` |

---

### `recipe_selection_categories`
RLS: ✅ | Rows: 3

Categorie di selezione menu (curry, soup, stirfry).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `name` | text | NOT NULL |
| `max_selections` | integer | DEFAULT `1` |

---

### `recipe_selections`
RLS: ✅ | Rows: 11

Associazione ricetta → categoria selezione.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `selection_category_id` | text | FK → `recipe_selection_categories.id` |
| `recipe_id` | text | FK → `recipes.id` |
| `display_order` | integer | DEFAULT `0` |

---

### `spiciness_levels`
RLS: ✅ | Rows: 5

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK |
| `title` | text | NOT NULL |
| `label` | text | nullable |
| `subtitle` | text | nullable |
| `description` | text | NOT NULL |
| `icon` | text | NOT NULL |
| `photo_url` | text | nullable |
| `photo_description` | text | nullable |
| `color_code` | text | DEFAULT `'#9CA3AF'` |
| `philosophy_quote` | text | nullable |
| `chef_note` | text | nullable |
| `akha_connection` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

## 6. Ingredienti & Logistica

### `ingredients_library`
RLS: ✅ | Rows: ~51

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `name_en` | text | NOT NULL |
| `name_th` | text | nullable |
| `phonetic` | text | nullable |
| `description` | text | nullable |
| `image_url` | text | nullable |
| `category` | text | DEFAULT `'fresh'` |
| `category_id` | text | nullable | FK → `ingredient_categories.id` |
| `default_unit` | text | DEFAULT `'g'` |
| `storage_area` | text | nullable |
| `purchase_group` | text | DEFAULT `'none'`, CHECK | `teacher_daily`, `logistics_weekly`, `none` |
| `logistics_shop` | text | DEFAULT `'general'` |
| `teacher_shop` | text | DEFAULT `'General'` |
| `is_logistics_item` | boolean | DEFAULT `true` |
| `is_teacher_item` | boolean | DEFAULT `false` |
| `is_visible_public` | boolean | DEFAULT `false` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `ingredient_categories`
RLS: ✅ | Rows: 7

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `title` | text | NOT NULL |
| `name_th` | text | nullable |
| `description` | text | nullable |
| `icon_name` | text | nullable |
| `image_url` | text | nullable |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |

---

### `recipe_composition`
RLS: ✅ | Rows: 0

Join ricette ↔ ingredienti con quantità.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `recipe_id` | text | NOT NULL, FK → `recipes.id` |
| `ingredient_id` | uuid | NOT NULL, FK → `ingredients_library.id` |
| `quantity` | numeric | nullable |
| `unit` | text | nullable |
| `prep_note` | text | nullable |
| `is_key_ingredient` | boolean | DEFAULT `false` |
| `display_order` | integer | DEFAULT `0` |

---

### `market_runs`
RLS: ✅ | Rows: ~10

Gestione acquisti al mercato (teacher o logistica).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `run_date` | date | NOT NULL, DEFAULT `CURRENT_DATE` |
| `shopper_role` | text | NOT NULL, CHECK | `teacher`, `logistics` |
| `status` | text | DEFAULT `'planned'` |
| `total_cost` | numeric | DEFAULT `0` |
| `items_snapshot` | jsonb | DEFAULT `[]` |
| `notes` | text | nullable |
| `created_by` | uuid | nullable | FK → `profiles.id` |
| `zoho_expense_id` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Staff Full Access

---

## 7. Shop

### `shop_akha`
RLS: ✅ | Rows: ~59

Inventario prodotti shop (spezie, prodotti locali, ecc.).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `sku` | text | NOT NULL |
| `item_name` | text | NOT NULL |
| `description_internal` | text | nullable |
| `price_thb` | numeric | NOT NULL, DEFAULT `0` |
| `cost_thb` | numeric | DEFAULT `0` |
| `stock_quantity` | integer | DEFAULT `0` |
| `reorder_point` | integer | DEFAULT `5` |
| `category_id` | text | nullable | FK → `shop_categories.id` |
| `sub_category` | text | DEFAULT `'general'` |
| `product_type` | text | DEFAULT `'goods'` |
| `account_category` | text | nullable |
| `purchase_account` | text | nullable |
| `tax_code` | text | nullable |
| `catalog_image_url` | text | nullable |
| `is_active` | boolean | DEFAULT `true` |
| `is_visible_online` | boolean | DEFAULT `false` |
| `zoho_item_id` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Staff Manage / Public Read

---

### `shop_orders`
RLS: ✅ | Rows: ~100

Ordini shop collegati a prenotazioni.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `booking_id` | uuid | nullable | FK → `bookings.internal_id` |
| `sku` | text | nullable |
| `quantity` | integer | NOT NULL, DEFAULT `1` |
| `unit_price_snapshot` | numeric | NOT NULL |
| `total_price` | numeric | DEFAULT `quantity * unit_price_snapshot` |
| `status` | text | DEFAULT `'pending'` |
| `staff_note` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Staff Full Access / User View Own / User Create (own bookings)

---

### `shop_storefront`
RLS: ✅ | Rows: 7

Vetrina pubblica (prodotti featured per acquisto online).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `linked_sku` | text | NOT NULL |
| `display_name` | text | NOT NULL |
| `cultural_story` | text | nullable |
| `image_url` | text | NOT NULL |
| `color_theme` | text | DEFAULT `'#98C93C'` |
| `badge_label` | text | nullable |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |

---

### `shop_categories`
RLS: ✅ | Rows: 8

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `title` | text | NOT NULL |
| `icon_name` | text | DEFAULT `'layout-grid'` |
| `description` | text | nullable |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |

---

### `shop_contacts`
RLS: ✅ | Rows: 3

Fornitori e contatti shop.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `shop_name` | text | PK (NOT NULL) |
| `contact_name` | text | nullable |
| `line_id` | text | nullable |
| `phone_number` | text | nullable |
| `notes` | text | nullable |

**RLS Policies**: Admin Manage / Staff Read

---

## 8. Quiz

### `quiz_levels`
RLS: ✅ | Rows: 7

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `title` | text | NOT NULL |
| `subtitle` | text | nullable |
| `image_url` | text | nullable |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |
| `is_featured` | boolean | DEFAULT `false` |
| `reward_id` | integer | nullable | FK → `quiz_rewards.id` |
| `created_at` | timestamptz | DEFAULT `now()` |

---

### `quiz_modules`
RLS: ✅ | Rows: 21

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `level_id` | integer | nullable | FK → `quiz_levels.id` |
| `title` | text | NOT NULL |
| `icon` | text | DEFAULT `'graduation-cap'` |
| `theme` | text | DEFAULT `'culture'` |
| `display_order` | integer | DEFAULT `0` |

---

### `quiz_questions`
RLS: ✅ | Rows: ~147

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `module_id` | uuid | nullable | FK → `quiz_modules.id` |
| `text` | text | NOT NULL |
| `options` | jsonb | NOT NULL |
| `correct_index` | integer | NOT NULL |
| `explanation` | text | nullable |
| `display_order` | integer | DEFAULT `0` |

---

### `quiz_rewards`
RLS: ✅ | Rows: 7

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `icon_name` | text | NOT NULL |
| `label` | text | NOT NULL |
| `description` | text | nullable |
| `image_url` | text | nullable |
| `audio_url` | text | nullable |
| `is_active` | boolean | DEFAULT `true` |

**RLS Policies** (tutti e 4 quiz): Admin Write / Public Read

---

## 9. Content & CMS

### `site_metadata`
RLS: ✅ | Rows: 16

Metadati SEO e OG per le pagine del **front app** (B2C).
> ⚠️ La colonna `features` è stata rimossa. Non esiste più in questa tabella.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `page_slug` | text | NOT NULL |
| `header_title_main` | text | NOT NULL |
| `header_title_highlight` | text | nullable |
| `header_badge` | text | nullable |
| `header_icon` | text | nullable |
| `page_description` | text | nullable |
| `hero_image_url` | text | nullable |
| `show_in_menu` | boolean | DEFAULT `false` |
| `menu_order` | integer | DEFAULT `0` |
| `menu_label` | text | nullable |
| `access_level` | text | DEFAULT `'public'` |
| `seo_title` | text | nullable |
| `seo_description` | text | nullable |
| `seo_keywords` | text[] | DEFAULT `{}` |
| `seo_robots` | text | DEFAULT `'index, follow'` |
| `og_title` | text | nullable |
| `og_description` | text | nullable |
| `og_image` | text | nullable |
| `canonical_url` | text | nullable |
| `json_ld` | jsonb | DEFAULT `{}` |
| `seo_health_score` | integer | DEFAULT `0`, CHECK `0-100` |
| `seo_audit_logs` | jsonb | DEFAULT `[]` |
| `last_seo_audit_at` | timestamptz | nullable |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |

**RLS Policies**: Admin Write / Public Read

---

### `site_metadata_admin`
RLS: ✅ | Rows: 35

Metadati per le pagine dell'**admin app** (B2B).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `page_slug` | text | NOT NULL |
| `header_badge` | text | nullable |
| `header_icon` | text | nullable |
| `hero_image_url` | text | nullable |
| `show_in_menu` | boolean | DEFAULT `false` |
| `menu_order` | integer | DEFAULT `0` |
| `access_level` | text | DEFAULT `'public'`, CHECK | `public`, `admin`, `agency`, `driver`, `kitchen`, `logistics`, `manager` |
| `seo_robots` | text | DEFAULT `'index, follow'` |
| `og_image` | text | nullable |
| `og_type` | text | DEFAULT `'website'` |
| `twitter_card` | text | DEFAULT `'summary_large_image'` |
| `canonical_url` | text | nullable |
| `seo_health_score` | integer | DEFAULT `0`, CHECK `0-100` |
| `seo_audit_logs` | jsonb | DEFAULT `[]` |
| `last_seo_audit_at` | timestamptz | nullable |
| `cache_ttl` | integer | DEFAULT `3600` |
| `redirect_to` | text | nullable |
| `template` | text | DEFAULT `'default'` |
| `is_active` | boolean | DEFAULT `true` |
| `parent_id` | uuid | nullable | FK → `site_metadata_admin.id` |
| `updated_at` | timestamptz | DEFAULT `now()` |
| `updated_by` | uuid | nullable | FK → `profiles.id` |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |

**RLS Policies**:
- `Admin App Metadata Read` SELECT: `true`
- `Admin App Metadata Write` ALL: `auth.jwt() ->> 'role' = 'admin'`

---

### `site_metadata_admin_translations`
RLS: ✅ | Rows: 70

Traduzioni EN/TH per metadati admin.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `page_id` | uuid | NOT NULL | FK → `site_metadata_admin.id` |
| `language` | text | NOT NULL | `en`, `th` |
| `title` | text | nullable |
| `subtitle` | text | nullable |
| `description` | text | nullable |
| `menu_label` | text | nullable |
| `seo_title` | text | nullable |
| `seo_description` | text | nullable |
| `seo_keywords` | text[] | nullable |
| `og_title` | text | nullable |
| `og_description` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

---

### `culture_sections`
RLS: ✅ | Rows: 14

Sezioni pagina Culture (etnogruppi, tradizioni, ecc.).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `title` | text | NOT NULL |
| `subtitle` | text | NOT NULL |
| `content` | text | NOT NULL |
| `display_order` | integer | NOT NULL |
| `featured` | boolean | DEFAULT `false` |
| `primary_image` | text | nullable |
| `quote` | text | nullable |
| `slug` | text | nullable |
| `gallery_images` | text[] | DEFAULT `{}` |
| `category` | text | nullable |
| `is_published` | boolean | DEFAULT `true` |
| `seo_title` | text | nullable |
| `seo_description` | text | nullable |
| `audio_asset_id` | text | nullable |

**RLS Policies**: Admin Write / Public Read

---

### `ethnic_groups`
RLS: ✅ | Rows: 5

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `section_id` | text | FK → `culture_sections.id` |
| `name` | text | NOT NULL |
| `origins` | text | nullable |
| `cultural_depth` | text | nullable |
| `quote` | text | nullable |
| `distinction` | text | nullable |

---

### `home_cards`
RLS: ✅ | Rows: 20

Card admin dashboard (navigazione rapida pagine).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `link` | text | NOT NULL |
| `image_url` | text | NOT NULL |
| `icon_name` | text | nullable |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |
| `card_type` | text | nullable |
| `target_path` | text | nullable |
| `role` | text | nullable |
| `variant` | text | nullable |

**RLS Policies**: Admin Write / Public Read

---

### `home_cards_translations`
RLS: ✅ | Rows: 40

Traduzioni EN/TH per home_cards admin.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `card_id` | integer | NOT NULL | FK → `home_cards.id` |
| `language` | text | NOT NULL |
| `title` | text | NOT NULL |
| `description` | text | NOT NULL |
| `link_label` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Public Read

---

### `home_cards_front`
RLS: ✅ | Rows: 7

Card per il **front app B2C** (homepage).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `link_label` | text | nullable |
| `target_path` | text | NOT NULL |
| `image_url` | text | nullable |
| `icon_name` | text | nullable |
| `color_theme` | text | DEFAULT `'cherry'` |
| `display_order` | integer | DEFAULT `0` |
| `is_active` | boolean | DEFAULT `true` |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: Public Read (`true`)

---

### `gallery_items`
RLS: ✅ | Rows: 8

Item di gallerie fotografiche, referenziano `media_assets` tramite `asset_id`.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `gallery_id` | text | NOT NULL |
| `asset_id` | text | NOT NULL | FK concettuale → `media_assets.asset_id` |
| `display_order` | integer | DEFAULT `0` |
| `quote` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |

---

### `page_sections`
RLS: ✅ | Rows: 17

Sezioni CMS per pagine generiche (hero, intro, ecc.).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `section_id` | text | PK |
| `page_slug` | text | nullable |
| `tag_badge` | text | nullable |
| `title` | text | NOT NULL |
| `highlight` | text | nullable |
| `subtitle` | text | nullable |
| `description` | text | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: authenticated ALL / anon+auth SELECT

---

### `akha_news`
RLS: ✅ | Rows: 3

Blog/news pubblico.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | NOT NULL |
| `slug` | text | NOT NULL |
| `excerpt` | text | nullable |
| `content` | text | nullable |
| `cover_image_url` | text | nullable |
| `category` | text | DEFAULT `'culture'`, CHECK | `culture`, `events`, `recipes`, `community`, `coffee` |
| `tags` | text[] | DEFAULT `{}` |
| `author_id` | uuid | nullable | FK → `profiles.id` |
| `read_time_minutes` | integer | DEFAULT `5` |
| `is_published` | boolean | DEFAULT `false` |
| `is_featured` | boolean | DEFAULT `false` |
| `published_at` | timestamptz | DEFAULT `now()` |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**:
- `Admin Manage News` ALL: role IN (`admin`, `manager`)
- `Public Read News` SELECT: `is_published = true`

---

### `media_assets`
RLS: ✅ | Rows: ~10

Libreria media centralizzata (immagini). `asset_id` è il riferimento testuale usato da `gallery_items`.

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `asset_id` | text | nullable | Slug leggibile (es. `hero-cooking-morning`) |
| `file_name` | text | NOT NULL |
| `folder_path` | text | DEFAULT `'general'` |
| `image_url` | text | NOT NULL |
| `alt_text` | text | nullable |
| `title` | text | nullable |
| `caption` | text | nullable |
| `mime_type` | text | nullable |
| `size_kb` | integer | nullable |
| `width` | integer | nullable |
| `height` | integer | nullable |
| `uploaded_by` | uuid | nullable | FK → `profiles.id` |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: authenticated CRUD / anon+auth SELECT

---

### `audio_assets`
RLS: ✅ | Rows: 2

Asset audio (storie, narrazione culture sections).

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `asset_id` | text | NOT NULL | Slug leggibile |
| `file_name` | text | NOT NULL |
| `folder_path` | text | DEFAULT `'audio'` |
| `audio_url` | text | NOT NULL |
| `title` | text | NOT NULL |
| `caption` | text | nullable |
| `transcript` | text | nullable |
| `mime_type` | text | DEFAULT `'audio/mpeg'` |
| `duration_seconds` | integer | nullable |
| `size_kb` | integer | nullable |
| `uploaded_by` | uuid | nullable | FK → `profiles.id` |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**: authenticated CRUD / anon+auth SELECT

---

## 10. Cherry AI

### `chat_sessions`
RLS: ✅ | Rows: ~61

Sessioni conversazione Cherry AI. Supporta utenti registrati (via `user_id`) e guest anonimi (via `session_token`).

| Colonna | Tipo | Vincoli | Note |
|---|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | nullable | FK → `profiles.id` — null per guest |
| `session_token` | text | nullable | Token per sessioni guest anonime |
| `status` | text | DEFAULT `'active'`, CHECK | `active`, `archived`, `deleted` |
| `summary` | text | nullable |
| `message_count` | integer | DEFAULT `0` |
| `last_activity` | timestamptz | DEFAULT `now()` |
| `metadata` | jsonb | nullable |
| `created_at` | timestamptz | DEFAULT `now()` |
| `updated_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**:
- `Users can manage their own sessions` ALL: `auth.uid() = user_id`
- `Guests can manage their specific anonymous session` ALL: `user_id IS NULL AND session_token IS NOT NULL`

---

### `chat_messages`
RLS: ✅ | Rows: ~129

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | uuid | PK |
| `session_id` | uuid | NOT NULL | FK → `chat_sessions.id` |
| `sender_role` | text | NOT NULL, CHECK | `user`, `assistant`, `system` |
| `content` | text | NOT NULL |
| `type` | text | NOT NULL, DEFAULT `'text'` |
| `created_at` | timestamptz | DEFAULT `now()` |

**RLS Policies**:
- `Access messages via session ownership` ALL: sessione appartiene all'utente o è guest session anonima

---

## 11. Diete & Allergie

### `dietary_profiles`
RLS: ✅ | Rows: 10

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | text | PK |
| `name` | text | NOT NULL |
| `slug` | text | NOT NULL |
| `type` | text | DEFAULT `'religious'` |
| `icon` | text | nullable |
| `icon_name` | text | nullable |
| `introduction` | text | nullable |
| `experience` | text | nullable |
| `image_url` | text | nullable |
| `display_order` | integer | DEFAULT `0` |

**RLS Policies**: Admin Write / Public Read

---

### `dietary_substitutions`
RLS: ✅ | Rows: 30

| Colonna | Tipo | Vincoli |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `profile_id` | text | FK → `dietary_profiles.id` |
| `original_ingredient` | text | NOT NULL |
| `substitute_ingredient` | text | NOT NULL |

---

### `allergy_knowledge`
RLS: ✅ | Rows: 13

| Colonna | Tipo | Vincoli |
|---|---|---|
| `allergy_key` | text | PK |
| `warning_text` | text | NOT NULL |

**RLS Policies**: Admin Write / Public Read

---

## Helper Functions RLS

Le seguenti funzioni sono utilizzate nelle policy:

| Funzione | Descrizione |
|---|---|
| `is_admin()` | `role IN ('admin', 'manager')` |
| `is_staff()` | `role IN ('admin', 'manager', 'kitchen', 'driver', 'agency')` |
| `auth.uid()` | UUID utente corrente dalla sessione Supabase |
| `auth.jwt() ->> 'role'` | Role dal JWT token (usato in admin app) |

---

*Documento generato dallo schema reale Supabase — 29 Mar 2026.*
*Per modifiche strutturali: aprire issue e consultare `/database`.*
