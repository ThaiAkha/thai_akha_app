# Thai Akha Kitchen 2026 - Database Structure (Full)

**Data di estrazione:** 2026-03-24
**Status:** Single Source of Truth - Struttura completa del database (51 tabelle in public schema).
**Nota di sicurezza:** Questo file contiene esclusivamente metadati strutturali. **NON contiene dati sensibili.**

```sql
/*
  THAI AKHA KITCHEN 2026 - DB SCHEMA EXPORT
  Extracting from public schema...
*/

-- Table: public.profiles
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    email text,
    dietary_profile text DEFAULT 'diet_regular',
    allergies jsonb DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'user' CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'agency'::text, 'kitchen'::text, 'driver'::text, 'alumni'::text, 'guest'::text])),
    preferred_spiciness_id integer DEFAULT 2,
    avatar_url text,
    agency_commission_rate integer,
    agency_company_name text,
    agency_tax_id text,
    agency_phone text,
    agency_address text,
    agency_city text,
    agency_province text,
    agency_country text,
    agency_postal_code text,
    zoho_contact_id text,
    commission_config jsonb,
    managed_by uuid,
    whatsapp boolean DEFAULT false,
    gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
    age integer,
    nationality text,
    is_active boolean DEFAULT true,
    line_id text,
    PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_managed_by_fkey FOREIGN KEY (managed_by) REFERENCES public.profiles.id;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_preferred_spiciness_id_fkey FOREIGN KEY (preferred_spiciness_id) REFERENCES public.spiciness_levels.id;
-- Policies for public.profiles
CREATE POLICY "Admins see all" ON public.profiles FOR SELECT USING ((((auth.jwt() ->> 'email'::text) = 'svevomondino@yahoo.it'::text) OR (auth.uid() = id)));
CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Emergency Profile Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for users based on user_id" ON public.profiles FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = id));
CREATE POLICY "Profiles Insert" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Profiles Update" ON public.profiles FOR UPDATE USING (((auth.uid() = id) OR (is_admin() = true)));
CREATE POLICY "Profiles View" ON public.profiles FOR SELECT USING (((auth.uid() = id) OR (is_staff() = true) OR (managed_by = auth.uid())));
CREATE POLICY "Public profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Super Permissive Profile Policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Svevo Mondino" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
CREATE POLICY "User Insert Own" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "User Update Own" ON public.profiles FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));
-- Triggers for public.profiles
CREATE TRIGGER validate_user_allergies BEFORE INSERT ON public.profiles EXECUTE FUNCTION validate_user_allergies_trigger();
CREATE TRIGGER validate_user_allergies BEFORE UPDATE ON public.profiles EXECUTE FUNCTION validate_user_allergies_trigger();
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles EXECUTE FUNCTION update_updated_at_column();

-- Table: public.bookings
CREATE TABLE public.bookings (
    user_id uuid,
    booking_date date DEFAULT now() NOT NULL,
    session_type text,
    status text DEFAULT 'confirmed' CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text, 'amended'::text])),
    created_at timestamp with time zone DEFAULT now(),
    internal_id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_source text,
    hotel_name text,
    reservation_id_agency text,
    email_reference text,
    session_id text,
    pickup_zone text CHECK (pickup_zone = ANY (ARRAY['green'::text, 'yellow'::text, 'pink'::text, 'azure'::text, 'outside'::text, 'walk-in'::text])),
    pickup_time time without time zone,
    pax_count integer DEFAULT 1,
    total_price integer DEFAULT 0,
    special_requests text,
    phone_number text,
    phone_prefix text,
    agency_note text,
    customer_note text,
    route_order integer DEFAULT 0,
    payment_method text DEFAULT 'pay_on_arrival',
    payment_status text DEFAULT 'pending',
    applied_commission_rate integer DEFAULT 0,
    pickup_lat numeric,
    pickup_lng numeric,
    pickup_driver_uid uuid,
    pickup_sequence integer DEFAULT 99,
    dropoff_driver_uid uuid,
    dropoff_sequence integer DEFAULT 99,
    dropoff_hotel text,
    dropoff_zone text CHECK (dropoff_zone = ANY (ARRAY['green'::text, 'yellow'::text, 'pink'::text, 'azure'::text, 'outside'::text, 'walk-in'::text])),
    requires_dropoff boolean DEFAULT true,
    dropoff_lat numeric,
    dropoff_lng numeric,
    transport_status text DEFAULT 'waiting' CHECK (transport_status = ANY (ARRAY['waiting'::text, 'driver_en_route'::text, 'driver_arrived'::text, 'on_board'::text, 'dropped_off'::text])),
    actual_pickup_time timestamp with time zone,
    actual_dropoff_time timestamp with time zone,
    booking_ref text,
    zoho_invoice_id text,
    commission_amount integer DEFAULT 0,
    guest_user_id uuid,
    guest_name text,
    guest_email text,
    parent_booking_id uuid,
    is_split_child boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now(),
    has_luggage boolean DEFAULT false,
    meeting_point text,
    visitor_count integer DEFAULT 0,
    PRIMARY KEY (internal_id)
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles.id;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_parent_booking_id_fkey FOREIGN KEY (parent_booking_id) REFERENCES public.bookings.internal_id;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_guest_user_id_fkey FOREIGN KEY (guest_user_id) REFERENCES public.profiles.id;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_dropoff_driver_uid_fkey FOREIGN KEY (dropoff_driver_uid) REFERENCES public.profiles.id;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_pickup_driver_uid_fkey FOREIGN KEY (pickup_driver_uid) REFERENCES public.profiles.id;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions.id;
-- Policies for public.bookings
CREATE POLICY "Admin Update" ON public.bookings FOR UPDATE USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = ANY (ARRAY['admin'::text, 'manager'::text])));
CREATE POLICY "Bookings Create" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings Edit" ON public.bookings FOR UPDATE USING (((user_id = auth.uid()) OR (is_staff() = true)));
CREATE POLICY "Bookings View" ON public.bookings FOR SELECT USING (((user_id = auth.uid()) OR (guest_user_id = auth.uid()) OR (is_staff() = true)));
CREATE POLICY "Create Booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Driver Update Status" ON public.bookings FOR UPDATE USING (((auth.uid() = pickup_driver_uid) OR (auth.uid() = dropoff_driver_uid))) WITH CHECK ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'driver'::text));
-- Triggers for public.bookings
CREATE TRIGGER set_booking_ref BEFORE INSERT ON public.bookings EXECUTE FUNCTION generate_booking_ref();
CREATE TRIGGER protect_booking_ref_update BEFORE UPDATE ON public.bookings EXECUTE FUNCTION protect_booking_ref();
CREATE TRIGGER send-booking-email AFTER INSERT ON public.bookings EXECUTE FUNCTION supabase_functions.http_request('https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-booking-confirmation', 'POST', '{\"Content-type\":\"application/json\"}', '{\"Authorization\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io\"}', '1000');
CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON public.bookings EXECUTE FUNCTION update_updated_at_column();

-- Table: public.menu_selections
CREATE TABLE public.menu_selections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    curry_id text,
    soup_id text,
    stirfry_id text,
    updated_at timestamp with time zone DEFAULT now(),
    selected_allergies ARRAY DEFAULT '{}'::text[],
    selected_profile text DEFAULT 'regular',
    spiciness_id integer,
    booking_id uuid,
    PRIMARY KEY (id)
);
ALTER TABLE public.menu_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_selections ADD CONSTRAINT fk_menu_spiciness FOREIGN KEY (spiciness_id) REFERENCES public.spiciness_levels.id;
ALTER TABLE public.menu_selections ADD CONSTRAINT fk_menu_stirfry FOREIGN KEY (stirfry_id) REFERENCES public.recipes.id;
ALTER TABLE public.menu_selections ADD CONSTRAINT fk_menu_soup FOREIGN KEY (soup_id) REFERENCES public.recipes.id;
ALTER TABLE public.menu_selections ADD CONSTRAINT menu_selections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles.id;
ALTER TABLE public.menu_selections ADD CONSTRAINT fk_menu_curry FOREIGN KEY (curry_id) REFERENCES public.recipes.id;
ALTER TABLE public.menu_selections ADD CONSTRAINT menu_selections_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings.internal_id;
-- Policies for public.menu_selections
CREATE POLICY "Admins see all selections" ON public.menu_selections FOR SELECT TO authenticated USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::text));
CREATE POLICY "Enable select for all" ON public.menu_selections FOR SELECT USING (true);
CREATE POLICY "Menu Manage" ON public.menu_selections FOR ALL USING (((user_id = auth.uid()) OR is_admin()));
CREATE POLICY "Menu View" ON public.menu_selections FOR SELECT USING (((user_id = auth.uid()) OR is_staff()));
CREATE POLICY "Permetti tutto" ON public.menu_selections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read" ON public.menu_selections FOR SELECT USING (true);
CREATE POLICY "Public Read Menu" ON public.menu_selections FOR SELECT USING (true);
CREATE POLICY "Svevo Mondino" ON public.menu_selections FOR ALL USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own selections" ON public.menu_selections FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can manage own selections" ON public.menu_selections FOR ALL USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can manage their menu" ON public.menu_selections FOR ALL USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can manage their own selections" ON public.menu_selections FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own menu" ON public.menu_selections FOR UPDATE TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can upsert own menu" ON public.menu_selections FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own menu" ON public.menu_selections FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own selections" ON public.menu_selections FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own selections" ON public.menu_selections FOR SELECT USING ((auth.uid() = user_id));

-- Table: public.site_metadata
CREATE TABLE public.site_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_slug text NOT NULL,
    header_title_main text NOT NULL,
    header_title_highlight text,
    header_badge text,
    header_icon text,
    page_description text,
    hero_image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    show_in_menu boolean DEFAULT false,
    menu_order integer DEFAULT 0,
    menu_label text,
    access_level text DEFAULT 'public',
    seo_title text,
    seo_description text,
    seo_keywords ARRAY DEFAULT '{}'::text[],
    seo_robots text DEFAULT 'index, follow',
    og_title text,
    og_description text,
    og_image text,
    json_ld jsonb DEFAULT '{}'::jsonb,
    canonical_url text,
    seo_health_score integer DEFAULT 0 CHECK (seo_health_score >= 0 AND seo_health_score <= 100),
    seo_audit_logs jsonb DEFAULT '[]'::jsonb,
    last_seo_audit_at timestamp with time zone,
    features jsonb,
    PRIMARY KEY (id)
);
ALTER TABLE public.site_metadata ENABLE ROW LEVEL SECURITY;
-- Policies for public.site_metadata
CREATE POLICY "Admin Write" ON public.site_metadata FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.site_metadata FOR SELECT USING (true);

-- Table: public.home_cards
CREATE TABLE public.home_cards (
    id integer DEFAULT nextval('home_cards_id_seq'::regclass) NOT NULL,
    link text NOT NULL,
    image_url text NOT NULL,
    icon_name text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    card_type text,
    target_path text,
    role text,
    variant text,
    PRIMARY KEY (id)
);
ALTER TABLE public.home_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_cards ADD CONSTRAINT home_cards_translations_card_id_fkey FOREIGN KEY (public.home_cards_translations.card_id) REFERENCES public.home_cards.id;
-- Policies for public.home_cards
CREATE POLICY "Admin Write" ON public.home_cards FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.home_cards FOR SELECT USING (true);

-- Table: public.quiz_rewards
CREATE TABLE public.quiz_rewards (
    id integer DEFAULT nextval('quiz_rewards_id_seq'::regclass) NOT NULL,
    icon_name text NOT NULL,
    label text NOT NULL,
    is_active boolean DEFAULT true,
    image_url text,
    audio_url text,
    description text,
    PRIMARY KEY (id)
);
ALTER TABLE public.quiz_rewards ENABLE ROW LEVEL SECURITY;
-- Policies for public.quiz_rewards
CREATE POLICY "Admin Write" ON public.quiz_rewards FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.quiz_rewards FOR SELECT USING (true);

-- Table: public.culture_sections
CREATE TABLE public.culture_sections (
    id text NOT NULL,
    display_order integer NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    content text NOT NULL,
    featured boolean DEFAULT false,
    primary_image text,
    quote text,
    slug text,
    gallery_images ARRAY DEFAULT '{}'::text[],
    seo_title text,
    seo_description text,
    is_published boolean DEFAULT true,
    category text,
    audio_asset_id text,
    PRIMARY KEY (id)
);
ALTER TABLE public.culture_sections ENABLE ROW LEVEL SECURITY;
-- Policies for public.culture_sections
CREATE POLICY "Admin Write" ON public.culture_sections FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.culture_sections FOR SELECT USING (true);

-- Table: public.ethnic_groups
CREATE TABLE public.ethnic_groups (
    id integer DEFAULT nextval('ethnic_groups_id_seq'::regclass) NOT NULL,
    section_id text,
    name text NOT NULL,
    origins text,
    cultural_depth text,
    quote text,
    distinction text,
    PRIMARY KEY (id)
);
ALTER TABLE public.ethnic_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethnic_groups ADD CONSTRAINT ethnic_groups_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.culture_sections.id;
-- Policies for public.ethnic_groups
CREATE POLICY "Admin Write" ON public.ethnic_groups FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.ethnic_groups FOR SELECT USING (true);

-- Table: public.dietary_profiles
CREATE TABLE public.dietary_profiles (
    id text NOT NULL,
    name text NOT NULL,
    icon text,
    introduction text,
    experience text,
    slug text NOT NULL,
    icon_name text,
    display_order integer DEFAULT 0,
    type text DEFAULT 'religious',
    image_url text,
    PRIMARY KEY (id)
);
ALTER TABLE public.dietary_profiles ENABLE ROW LEVEL SECURITY;
-- Policies for public.dietary_profiles
CREATE POLICY "Admin Write" ON public.dietary_profiles FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.dietary_profiles FOR SELECT USING (true);

-- Table: public.dietary_substitutions
CREATE TABLE public.dietary_substitutions (
    id integer DEFAULT nextval('dietary_substitutions_id_seq'::regclass) NOT NULL,
    profile_id text,
    original_ingredient text,
    substitute_ingredient text,
    PRIMARY KEY (id)
);
ALTER TABLE public.dietary_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietary_substitutions ADD CONSTRAINT dietary_substitutions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.dietary_profiles.id;
-- Policies for public.dietary_substitutions
CREATE POLICY "Admin Write" ON public.dietary_substitutions FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.dietary_substitutions FOR SELECT USING (true);

-- Table: public.allergy_knowledge
CREATE TABLE public.allergy_knowledge (
    allergy_key text NOT NULL,
    warning_text text NOT NULL,
    PRIMARY KEY (allergy_key)
);
ALTER TABLE public.allergy_knowledge ENABLE ROW LEVEL SECURITY;
-- Policies for public.allergy_knowledge
CREATE POLICY "Admin Write" ON public.allergy_knowledge FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.allergy_knowledge FOR SELECT USING (true);

-- Table: public.recipe_categories
CREATE TABLE public.recipe_categories (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    image text,
    display_order integer DEFAULT 0,
    ui_quote text,
    content_body text,
    audio_story_url text,
    icon_name text DEFAULT 'utensils',
    cherry_context text,
    chef_secrets ARRAY,
    keywords ARRAY,
    cuisine_type text,
    PRIMARY KEY (id)
);
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
-- Policies for public.recipe_categories
CREATE POLICY "Admin Write" ON public.recipe_categories FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.recipe_categories FOR SELECT USING (true);

-- Table: public.recipes
CREATE TABLE public.recipes (
    id text NOT NULL,
    name text NOT NULL,
    thai_name text,
    description text NOT NULL,
    is_vegan boolean DEFAULT false,
    is_vegetarian boolean DEFAULT false,
    category text,
    has_peanuts boolean DEFAULT false,
    has_shellfish boolean DEFAULT false,
    has_gluten boolean DEFAULT false,
    has_soy boolean DEFAULT false,
    image text,
    spiciness integer DEFAULT 0 CHECK (spiciness >= 0 AND spiciness <= 5),
    color_theme text,
    health_benefits text,
    is_signature boolean DEFAULT false,
    is_fixed_dish boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    dietary_variants jsonb DEFAULT '{}'::jsonb,
    gallery_images ARRAY DEFAULT '{}'::text[],
    PRIMARY KEY (id)
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ADD CONSTRAINT recipes_category_fkey FOREIGN KEY (category) REFERENCES public.recipe_categories.id;
-- Policies for public.recipes
CREATE POLICY "Admin Write" ON public.recipes FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.recipes FOR SELECT USING (true);
-- Triggers for public.recipes
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes EXECUTE FUNCTION update_updated_at_column();

-- Table: public.recipe_key_ingredients
CREATE TABLE public.recipe_key_ingredients (
    id integer DEFAULT nextval('recipe_key_ingredients_id_seq'::regclass) NOT NULL,
    recipe_id text,
    ingredient text NOT NULL,
    display_order integer DEFAULT 0,
    PRIMARY KEY (id)
);
ALTER TABLE public.recipe_key_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_key_ingredients ADD CONSTRAINT recipe_key_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes.id;
-- Policies for public.recipe_key_ingredients
CREATE POLICY "Admin Write" ON public.recipe_key_ingredients FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.recipe_key_ingredients FOR SELECT USING (true);

-- Table: public.recipe_selection_categories
CREATE TABLE public.recipe_selection_categories (
    id text NOT NULL,
    name text NOT NULL,
    max_selections integer DEFAULT 1,
    PRIMARY KEY (id)
);
ALTER TABLE public.recipe_selection_categories ENABLE ROW LEVEL SECURITY;
-- Policies for public.recipe_selection_categories
CREATE POLICY "Admin Write" ON public.recipe_selection_categories FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.recipe_selection_categories FOR SELECT USING (true);

-- Table: public.recipe_selections
CREATE TABLE public.recipe_selections (
    id integer DEFAULT nextval('recipe_selections_id_seq'::regclass) NOT NULL,
    selection_category_id text,
    recipe_id text,
    display_order integer DEFAULT 0,
    PRIMARY KEY (id)
);
ALTER TABLE public.recipe_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_selections ADD CONSTRAINT recipe_selections_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes.id;
ALTER TABLE public.recipe_selections ADD CONSTRAINT recipe_selections_selection_category_id_fkey FOREIGN KEY (selection_category_id) REFERENCES public.recipe_selection_categories.id;
-- Policies for public.recipe_selections
CREATE POLICY "Admin Write" ON public.recipe_selections FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.recipe_selections FOR SELECT USING (true);

-- Table: public.spiciness_levels
CREATE TABLE public.spiciness_levels (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    photo_description text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    label text,
    philosophy_quote text,
    chef_note text,
    color_code text DEFAULT '#9CA3AF',
    subtitle text,
    akha_connection text,
    PRIMARY KEY (id)
);
ALTER TABLE public.spiciness_levels ENABLE ROW LEVEL SECURITY;
-- Policies for public.spiciness_levels
CREATE POLICY "Admin Write" ON public.spiciness_levels FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.spiciness_levels FOR SELECT USING (true);

-- Table: public.class_sessions
CREATE TABLE public.class_sessions (
    id text NOT NULL,
    display_name text NOT NULL,
    price_thb integer NOT NULL,
    duration_hours numeric,
    has_market_tour boolean DEFAULT false,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    schedule_config jsonb NOT NULL,
    meeting_points jsonb,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    max_capacity integer NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
-- Policies for public.class_sessions
CREATE POLICY "Admin Write" ON public.class_sessions FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.class_sessions FOR SELECT USING (true);

-- Table: public.pickup_zones
CREATE TABLE public.pickup_zones (
    id text NOT NULL,
    name text NOT NULL,
    color_code text,
    morning_pickup_time time without time zone,
    evening_pickup_time time without time zone,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    display_order integer DEFAULT 100,
    morning_pickup_end time without time zone,
    evening_pickup_end time without time zone,
    PRIMARY KEY (id)
);
ALTER TABLE public.pickup_zones ENABLE ROW LEVEL SECURITY;
-- Policies for public.pickup_zones
CREATE POLICY "Admin Write" ON public.pickup_zones FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.pickup_zones FOR SELECT USING (true);
CREATE POLICY "Public read zones" ON public.pickup_zones FOR SELECT USING (true);

-- Table: public.meeting_points
CREATE TABLE public.meeting_points (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    latitude numeric,
    longitude numeric,
    google_maps_link text,
    active boolean DEFAULT true,
    image_url text,
    icon_url text,
    morning_pickup_time time without time zone,
    morning_pickup_end time without time zone,
    evening_pickup_time time without time zone,
    evening_pickup_end time without time zone,
    PRIMARY KEY (id)
);
ALTER TABLE public.meeting_points ENABLE ROW LEVEL SECURITY;
-- Policies for public.meeting_points
CREATE POLICY "Admin Write" ON public.meeting_points FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.meeting_points FOR SELECT USING (true);
CREATE POLICY "Public read meeting points" ON public.meeting_points FOR SELECT USING (true);

-- Table: public.hotel_locations
CREATE TABLE public.hotel_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    zone_id text,
    latitude numeric,
    longitude numeric,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    google_place_id text,
    source text DEFAULT 'admin' CHECK (source = ANY (ARRAY['admin'::text, 'google'::text, 'user_pin'::text])),
    review_status text DEFAULT 'approved' CHECK (review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
    rejection_reason text,
    submitted_by uuid,
    address text,
    phone_number text,
    map_link text,
    website text,
    PRIMARY KEY (id)
);
ALTER TABLE public.hotel_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_locations ADD CONSTRAINT hotel_locations_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users.id;
ALTER TABLE public.hotel_locations ADD CONSTRAINT hotel_locations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.pickup_zones.id;
-- Policies for public.hotel_locations
CREATE POLICY "Admin Full Access" ON public.hotel_locations FOR ALL USING (is_admin());
CREATE POLICY "Admin Manage Hotels" ON public.hotel_locations FOR ALL TO authenticated USING (((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'manager'::text, 'logistics'::text]))) WITH CHECK (((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'manager'::text, 'logistics'::text])));
CREATE POLICY "Public Read Active" ON public.hotel_locations FOR SELECT USING ((is_active = true));
CREATE POLICY "Public Read Hotels" ON public.hotel_locations FOR SELECT USING (true);
CREATE POLICY "Users Suggest Hotel" ON public.hotel_locations FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (review_status = 'pending'::text)));

-- Table: public.cooking_classes
CREATE TABLE public.cooking_classes (
    id text NOT NULL,
    title text NOT NULL,
    badge text,
    tags ARRAY,
    price integer NOT NULL,
    currency text DEFAULT 'THB',
    unit text DEFAULT 'per person',
    theme_color text,
    duration_text text,
    tagline text,
    capacity_text text,
    image_url text,
    description text,
    highlights ARRAY,
    schedule_items jsonb,
    inclusions ARRAY,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.cooking_classes ENABLE ROW LEVEL SECURITY;
-- Policies for public.cooking_classes
CREATE POLICY "Admin Write" ON public.cooking_classes FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.cooking_classes FOR SELECT USING (true);

-- Table: public.gallery_items
CREATE TABLE public.gallery_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    gallery_id text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    quote text,
    asset_id text NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ADD CONSTRAINT fk_gallery_media FOREIGN KEY (asset_id) REFERENCES public.media_assets.asset_id;
-- Policies for public.gallery_items
CREATE POLICY "Admin Write" ON public.gallery_items FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.gallery_items FOR SELECT USING (true);

-- Table: public.class_calendar_overrides
CREATE TABLE public.class_calendar_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    session_id text NOT NULL,
    is_closed boolean DEFAULT false,
    custom_capacity integer,
    closure_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.class_calendar_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_calendar_overrides ADD CONSTRAINT class_calendar_overrides_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions.id;
-- Policies for public.class_calendar_overrides
CREATE POLICY "Admin Write" ON public.class_calendar_overrides FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.class_calendar_overrides FOR SELECT USING (true);

-- Table: public.shop_akha
CREATE TABLE public.shop_akha (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sku text NOT NULL,
    item_name text NOT NULL,
    description_internal text,
    price_thb numeric DEFAULT 0 NOT NULL,
    cost_thb numeric DEFAULT 0,
    account_category text,
    purchase_account text,
    product_type text DEFAULT 'goods',
    stock_quantity integer DEFAULT 0,
    reorder_point integer DEFAULT 5,
    is_active boolean DEFAULT true,
    category_id text,
    is_visible_online boolean DEFAULT false,
    tax_code text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    catalog_image_url text,
    sub_category text DEFAULT 'general',
    zoho_item_id text,
    PRIMARY KEY (id)
);
ALTER TABLE public.shop_akha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_akha ADD CONSTRAINT fk_shop_category FOREIGN KEY (category_id) REFERENCES public.shop_categories.id;
-- Policies for public.shop_akha
CREATE POLICY "Public Read" ON public.shop_akha FOR SELECT USING (true);
CREATE POLICY "Public Read Inventory" ON public.shop_akha FOR SELECT USING (true);
CREATE POLICY "Staff Manage Inventory" ON public.shop_akha FOR ALL USING (is_staff());
-- Triggers for public.shop_akha
CREATE TRIGGER update_shop_timestamp BEFORE UPDATE ON public.shop_akha EXECUTE FUNCTION update_updated_at_column();

-- Table: public.shop_orders
CREATE TABLE public.shop_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    sku text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price_snapshot numeric NOT NULL,
    total_price numeric DEFAULT ((quantity)::numeric * unit_price_snapshot),
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    staff_note text,
    PRIMARY KEY (id)
);
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ADD CONSTRAINT shop_orders_sku_fkey FOREIGN KEY (sku) REFERENCES public.shop_akha.sku;
ALTER TABLE public.shop_orders ADD CONSTRAINT shop_orders_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings.internal_id;
-- Policies for public.shop_orders
CREATE POLICY "Staff Full Access" ON public.shop_orders FOR ALL USING (is_staff());
CREATE POLICY "User Create Orders" ON public.shop_orders FOR INSERT WITH CHECK (((booking_id IN ( SELECT bookings.internal_id
   FROM bookings
  WHERE (bookings.user_id = auth.uid()))) OR is_staff()));
CREATE POLICY "User View Own Orders" ON public.shop_orders FOR SELECT USING ((booking_id IN ( SELECT bookings.internal_id
   FROM bookings
  WHERE (bookings.user_id = auth.uid()))));
-- Triggers for public.shop_orders
CREATE TRIGGER on_order_created AFTER INSERT ON public.shop_orders EXECUTE FUNCTION decrease_stock_on_order();

-- Table: public.shop_storefront
CREATE TABLE public.shop_storefront (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    linked_sku text NOT NULL,
    display_name text NOT NULL,
    cultural_story text,
    image_url text NOT NULL,
    color_theme text DEFAULT '#98C93C',
    badge_label text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.shop_storefront ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_storefront ADD CONSTRAINT shop_storefront_linked_sku_fkey FOREIGN KEY (linked_sku) REFERENCES public.shop_akha.sku;
-- Policies for public.shop_storefront
CREATE POLICY "Admin Write" ON public.shop_storefront FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.shop_storefront FOR SELECT USING (true);

-- Table: public.quiz_levels
CREATE TABLE public.quiz_levels (
    id integer DEFAULT nextval('quiz_levels_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    subtitle text,
    image_url text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    reward_id integer,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.quiz_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_levels ADD CONSTRAINT quiz_levels_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.quiz_rewards.id;
-- Policies for public.quiz_levels
CREATE POLICY "Admin Write" ON public.quiz_levels FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.quiz_levels FOR SELECT USING (true);

-- Table: public.quiz_modules
CREATE TABLE public.quiz_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level_id integer,
    title text NOT NULL,
    icon text DEFAULT 'graduation-cap',
    theme text DEFAULT 'culture',
    display_order integer DEFAULT 0,
    PRIMARY KEY (id)
);
ALTER TABLE public.quiz_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_modules ADD CONSTRAINT quiz_modules_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.quiz_levels.id;
-- Policies for public.quiz_modules
CREATE POLICY "Admin Write" ON public.quiz_modules FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.quiz_modules FOR SELECT USING (true);

-- Table: public.quiz_questions
CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid,
    text text NOT NULL,
    options jsonb NOT NULL,
    correct_index integer NOT NULL,
    explanation text,
    display_order integer DEFAULT 0,
    PRIMARY KEY (id)
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.quiz_modules.id;
-- Policies for public.quiz_questions
CREATE POLICY "Admin Write" ON public.quiz_questions FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.quiz_questions FOR SELECT USING (true);

-- Table: public.ingredients_library
CREATE TABLE public.ingredients_library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_en text NOT NULL,
    name_th text,
    phonetic text,
    description text,
    image_url text,
    category text DEFAULT 'fresh',
    default_unit text DEFAULT 'g',
    storage_area text,
    created_at timestamp with time zone DEFAULT now(),
    category_id text,
    purchase_group text DEFAULT 'none' CHECK (purchase_group = ANY (ARRAY['teacher_daily'::text, 'logistics_weekly'::text, 'none'::text])),
    logistics_shop text DEFAULT 'general',
    is_logistics_item boolean DEFAULT true,
    is_teacher_item boolean DEFAULT false,
    teacher_shop text DEFAULT 'General',
    is_visible_public boolean DEFAULT false,
    PRIMARY KEY (id)
);
ALTER TABLE public.ingredients_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients_library ADD CONSTRAINT ingredients_library_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.ingredient_categories.id;
-- Policies for public.ingredients_library
CREATE POLICY "Admin Write" ON public.ingredients_library FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.ingredients_library FOR SELECT USING (true);

-- Table: public.recipe_composition
CREATE TABLE public.recipe_composition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id text NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity numeric,
    unit text,
    prep_note text,
    is_key_ingredient boolean DEFAULT false,
    display_order integer DEFAULT 0,
    PRIMARY KEY (id)
);
ALTER TABLE public.recipe_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_composition ADD CONSTRAINT fk_composition_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes.id;
ALTER TABLE public.recipe_composition ADD CONSTRAINT fk_composition_ingredient FOREIGN KEY (ingredient_id) REFERENCES public.ingredients_library.id;
-- Policies for public.recipe_composition
CREATE POLICY "Admin Write" ON public.recipe_composition FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.recipe_composition FOR SELECT USING (true);

-- Table: public.ingredient_categories
CREATE TABLE public.ingredient_categories (
    id text NOT NULL,
    title text NOT NULL,
    name_th text,
    description text,
    PRIMARY KEY (id)
);
ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;
-- Policies for public.ingredient_categories
CREATE POLICY "Admin Write" ON public.ingredient_categories FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.ingredient_categories FOR SELECT USING (true);

-- Table: public.market_runs
CREATE TABLE public.market_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    run_date date DEFAULT CURRENT_DATE NOT NULL,
    shopper_role text NOT NULL CHECK (shopper_role = ANY (ARRAY['teacher'::text, 'logistics'::text])),
    total_cost numeric DEFAULT 0,
    notes text,
    items_snapshot jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    zoho_expense_id text,
    status text DEFAULT 'planned',
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.market_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_runs ADD CONSTRAINT market_runs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users.id;
-- Policies for public.market_runs
CREATE POLICY "Staff Full Access" ON public.market_runs FOR ALL USING (is_staff());

-- Table: public.shop_categories
CREATE TABLE public.shop_categories (
    id text NOT NULL,
    title text NOT NULL,
    icon_name text DEFAULT 'layout-grid',
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    description text,
    PRIMARY KEY (id)
);
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;
-- Policies for public.shop_categories
CREATE POLICY "Admin Write" ON public.shop_categories FOR ALL USING (is_admin());
CREATE POLICY "Public Read" ON public.shop_categories FOR SELECT USING (true);

-- Table: public.shop_contacts
CREATE TABLE public.shop_contacts (
    shop_name text NOT NULL,
    contact_name text,
    line_id text,
    phone_number text,
    notes text,
    PRIMARY KEY (shop_name)
);
ALTER TABLE public.shop_contacts ENABLE ROW LEVEL SECURITY;
-- Policies for public.shop_contacts
CREATE POLICY "Admin Manage Contacts" ON public.shop_contacts FOR ALL USING (is_admin());
CREATE POLICY "Staff Read Contacts" ON public.shop_contacts FOR SELECT USING (is_staff());

-- Table: public.booking_participants
CREATE TABLE public.booking_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_leader boolean DEFAULT false,
    joined_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.booking_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_participants ADD CONSTRAINT booking_participants_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings.internal_id;
ALTER TABLE public.booking_participants ADD CONSTRAINT booking_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles.id;
-- Policies for public.booking_participants
CREATE POLICY "Manage Participants" ON public.booking_participants FOR ALL USING (((user_id = auth.uid()) OR is_admin()));
CREATE POLICY "View Participants" ON public.booking_participants FOR SELECT USING (((user_id = auth.uid()) OR (booking_id IN ( SELECT booking_participants_1.booking_id
   FROM booking_participants booking_participants_1
  WHERE (booking_participants_1.user_id = auth.uid()))) OR is_staff()));

-- Table: public.driver_payout_tiers
CREATE TABLE public.driver_payout_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_type text NOT NULL CHECK (session_type = ANY (ARRAY['morning_class'::text, 'evening_class'::text])),
    min_stops integer NOT NULL,
    max_stops integer NOT NULL,
    price_thb integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.driver_payout_tiers ENABLE ROW LEVEL SECURITY;
-- Policies for public.driver_payout_tiers
CREATE POLICY "Admin Manage Tiers" ON public.driver_payout_tiers FOR ALL USING (is_admin());
CREATE POLICY "Staff Read Tiers" ON public.driver_payout_tiers FOR SELECT USING (is_staff());

-- Table: public.driver_payments
CREATE TABLE public.driver_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    driver_id uuid NOT NULL,
    run_date date NOT NULL,
    session_id text NOT NULL,
    total_stops integer NOT NULL,
    total_pax integer NOT NULL,
    payout_amount integer NOT NULL,
    status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text])),
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.driver_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payments ADD CONSTRAINT fk_driver FOREIGN KEY (driver_id) REFERENCES public.profiles.id;
-- Policies for public.driver_payments
CREATE POLICY "Admin Payment Access" ON public.driver_payments FOR ALL USING (is_admin());
CREATE POLICY "Driver Read Own" ON public.driver_payments FOR SELECT USING ((auth.uid() = driver_id));

-- Table: public.site_metadata_admin
CREATE TABLE public.site_metadata_admin (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_slug text NOT NULL,
    header_badge text,
    header_icon text,
    hero_image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    show_in_menu boolean DEFAULT false,
    menu_order integer DEFAULT 0,
    access_level text DEFAULT 'public' CHECK (access_level = ANY (ARRAY['public'::text, 'admin'::text, 'agency'::text, 'driver'::text, 'kitchen'::text, 'logistics'::text, 'manager'::text])),
    seo_robots text DEFAULT 'index, follow',
    og_image text,
    canonical_url text,
    seo_health_score integer DEFAULT 0 CHECK (seo_health_score >= 0 AND seo_health_score <= 100),
    seo_audit_logs jsonb DEFAULT '[]'::jsonb,
    last_seo_audit_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    is_active boolean DEFAULT true,
    parent_id uuid,
    template text DEFAULT 'default',
    og_type text DEFAULT 'website',
    twitter_card text DEFAULT 'summary_large_image',
    cache_ttl integer DEFAULT 3600,
    redirect_to text,
    PRIMARY KEY (id)
);
ALTER TABLE public.site_metadata_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_metadata_admin ADD CONSTRAINT site_metadata_admin_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.site_metadata_admin.id;
ALTER TABLE public.site_metadata_admin ADD CONSTRAINT site_metadata_admin_translations_page_id_fkey FOREIGN KEY (public.site_metadata_admin_translations.page_id) REFERENCES public.site_metadata_admin.id;
ALTER TABLE public.site_metadata_admin ADD CONSTRAINT site_metadata_admin_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users.id;
-- Policies for public.site_metadata_admin
CREATE POLICY "Admin App Metadata Read" ON public.site_metadata_admin FOR SELECT USING (true);
CREATE POLICY "Admin App Metadata Write" ON public.site_metadata_admin FOR ALL TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text)) WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));
-- Triggers for public.site_metadata_admin
CREATE TRIGGER trigger_update_site_metadata_admin BEFORE UPDATE ON public.site_metadata_admin EXECUTE FUNCTION update_updated_at_column();

-- Table: public.akha_news
CREATE TABLE public.akha_news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text,
    cover_image_url text,
    category text DEFAULT 'culture' CHECK (category = ANY (ARRAY['culture'::text, 'events'::text, 'recipes'::text, 'community'::text, 'coffee'::text])),
    tags ARRAY DEFAULT '{}'::text[],
    author_id uuid,
    read_time_minutes integer DEFAULT 5,
    is_published boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    published_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.akha_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akha_news ADD CONSTRAINT akha_news_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles.id;
-- Policies for public.akha_news
CREATE POLICY "Admin Manage News" ON public.akha_news FOR ALL TO authenticated USING (((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'manager'::text])));
CREATE POLICY "Public Read News" ON public.akha_news FOR SELECT USING ((is_published = true));

-- Table: public.hotel_pickup_rules
CREATE TABLE public.hotel_pickup_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hotel_id uuid NOT NULL,
    day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time time without time zone DEFAULT '00:00:00'::time without time zone NOT NULL,
    end_time time without time zone DEFAULT '23:59:59'::time without time zone NOT NULL,
    alt_meeting_point text NOT NULL,
    alt_latitude numeric NOT NULL,
    alt_longitude numeric NOT NULL,
    alt_map_link text,
    guest_message text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.hotel_pickup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_pickup_rules ADD CONSTRAINT hotel_pickup_rules_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotel_locations.id;
-- Policies for public.hotel_pickup_rules
CREATE POLICY "Admin Manage Rules" ON public.hotel_pickup_rules FOR ALL TO authenticated USING (((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'manager'::text, 'logistics'::text]))) WITH CHECK (((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'manager'::text, 'logistics'::text])));
CREATE POLICY "Public Read Rules" ON public.hotel_pickup_rules FOR SELECT USING (true);

-- Table: public.site_metadata_admin_translations
CREATE TABLE public.site_metadata_admin_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    language text NOT NULL,
    title text,
    subtitle text,
    description text,
    menu_label text,
    seo_title text,
    seo_description text,
    seo_keywords ARRAY,
    og_title text,
    og_description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.site_metadata_admin_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_metadata_admin_translations ADD CONSTRAINT site_metadata_admin_translations_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_metadata_admin.id;
-- Policies for public.site_metadata_admin_translations
CREATE POLICY "Admin App Metadata Translations Read" ON public.site_metadata_admin_translations FOR SELECT USING (true);
CREATE POLICY "Admin App Metadata Translations Write" ON public.site_metadata_admin_translations FOR ALL USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));
CREATE POLICY "Public Read Access for Site Metadata Admin Translations" ON public.site_metadata_admin_translations FOR SELECT USING (true);
-- Triggers for public.site_metadata_admin_translations
CREATE TRIGGER trigger_update_admin_translations BEFORE UPDATE ON public.site_metadata_admin_translations EXECUTE FUNCTION update_updated_at_column();

-- Table: public.home_cards_translations
CREATE TABLE public.home_cards_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_id integer NOT NULL,
    language text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    link_label text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.home_cards_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_cards_translations ADD CONSTRAINT home_cards_translations_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.home_cards.id;
-- Policies for public.home_cards_translations
CREATE POLICY "Public Read Access for Home Cards Translations" ON public.home_cards_translations FOR SELECT USING (true);

-- Table: public.home_cards_front
CREATE TABLE public.home_cards_front (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    link_label text,
    target_path text NOT NULL,
    image_url text,
    icon_name text,
    color_theme text DEFAULT 'cherry',
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.home_cards_front ENABLE ROW LEVEL SECURITY;
-- Policies for public.home_cards_front
CREATE POLICY "public_read_home_cards_front" ON public.home_cards_front FOR SELECT USING (true);

-- Table: public.media_assets
CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file_name text NOT NULL,
    folder_path text DEFAULT 'general',
    image_url text NOT NULL,
    alt_text text,
    title text,
    caption text,
    mime_type text,
    size_kb integer,
    width integer,
    height integer,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    asset_id text,
    PRIMARY KEY (id)
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ADD CONSTRAINT media_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users.id;
-- Policies for public.media_assets
CREATE POLICY "public_crud_media_auth" ON public.media_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_media" ON public.media_assets FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_media_auth" ON public.media_assets FOR SELECT TO authenticated USING (true);

-- Table: public.page_sections
CREATE TABLE public.page_sections (
    section_id text NOT NULL,
    page_slug text,
    tag_badge text,
    title text NOT NULL,
    highlight text,
    subtitle text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (section_id)
);
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
-- Policies for public.page_sections
CREATE POLICY "public_crud_page_sections_auth" ON public.page_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_page_sections" ON public.page_sections FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_page_sections_auth" ON public.page_sections FOR SELECT TO authenticated USING (true);

-- Table: public.audio_assets
CREATE TABLE public.audio_assets (
    asset_id text NOT NULL,
    file_name text NOT NULL,
    folder_path text DEFAULT 'audio',
    audio_url text NOT NULL,
    title text NOT NULL,
    caption text,
    transcript text,
    mime_type text DEFAULT 'audio/mpeg',
    duration_seconds integer,
    size_kb integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    uploaded_by uuid,
    PRIMARY KEY (id)
);
ALTER TABLE public.audio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_assets ADD CONSTRAINT audio_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users.id;
-- Policies for public.audio_assets
CREATE POLICY "public_crud_audio_auth" ON public.audio_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_audio" ON public.audio_assets FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_audio_auth" ON public.audio_assets FOR SELECT TO authenticated USING (true);

-- Table: public.class_sections
CREATE TABLE public.class_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_key text NOT NULL,
    title text NOT NULL,
    subtitle text,
    description text NOT NULL,
    tag_badge text,
    ui_style text DEFAULT 'accordion' CHECK (ui_style = ANY (ARRAY['accordion'::text, 'timeline'::text, 'grid_card'::text, 'alert_box'::text])),
    assigned_classes ARRAY DEFAULT '{}'::text[],
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;

-- Table: public.chat_sessions
CREATE TABLE public.chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_token text NOT NULL,
    user_id uuid,
    summary text,
    status text DEFAULT 'active' CHECK (status = ANY (ARRAY['active'::text, 'archived'::text, 'deleted'::text])),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    message_count integer DEFAULT 0,
    last_activity timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles.id;
-- Policies for public.chat_sessions
CREATE POLICY "Guests can manage their specific anonymous session" ON public.chat_sessions FOR ALL USING (((user_id IS NULL) AND (session_token IS NOT NULL)));
CREATE POLICY "Users can manage their own sessions" ON public.chat_sessions FOR ALL USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users/Guests manage own session via token or ID" ON public.chat_sessions FOR ALL USING (((auth.uid() = user_id) OR ((user_id IS NULL) AND (session_token IS NOT NULL))));

-- Table: public.chat_messages
CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    sender_role text NOT NULL CHECK (sender_role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions.id;
-- Policies for public.chat_messages
CREATE POLICY "Access messages via session ownership" ON public.chat_messages FOR ALL USING ((EXISTS ( SELECT 1
   FROM chat_sessions s
  WHERE ((s.id = chat_messages.session_id) AND ((s.user_id = auth.uid()) OR (s.user_id IS NULL))))));
CREATE POLICY "Strict session access for messages" ON public.chat_messages FOR ALL USING ((EXISTS ( SELECT 1
   FROM chat_sessions s
  WHERE ((s.id = chat_messages.session_id) AND ((s.user_id = auth.uid()) OR (s.user_id IS NULL))))));
-- Triggers for public.chat_messages
CREATE TRIGGER on_chat_message_inserted AFTER INSERT ON public.chat_messages EXECUTE FUNCTION handle_new_chat_message();
CREATE TRIGGER on_new_chat_message AFTER INSERT ON public.chat_messages EXECUTE FUNCTION sync_chat_session_activity();

```