


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE OR REPLACE FUNCTION "public"."approve_hotel_location"("target_hotel_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.hotel_locations
  SET 
    review_status = 'approved',
    is_active = true, -- Ora visibile a tutti
    rejection_reason = NULL
  WHERE id = target_hotel_id;
END;
$$;


ALTER FUNCTION "public"."approve_hotel_location"("target_hotel_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_driver_payout"("p_driver_id" "uuid", "p_run_date" "date", "p_session_id" "text") RETURNS TABLE("payout_amount" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_total_stops integer;
  v_total_pax integer;
  v_tier_price integer;
BEGIN
  -- Count unique stops (hotels) for this driver's route
  -- Uses dropoff_hotel if available, otherwise falls back to hotel_name
  SELECT COUNT(DISTINCT COALESCE(dropoff_hotel, hotel_name))
  INTO v_total_stops
  FROM bookings
  WHERE pickup_driver_uid = p_driver_id
    AND booking_date = p_run_date
    AND session_id = p_session_id
    AND transport_status = 'dropped_off';
  
  -- Count total passengers delivered
  SELECT COALESCE(SUM(pax_count), 0)
  INTO v_total_pax
  FROM bookings
  WHERE pickup_driver_uid = p_driver_id
    AND booking_date = p_run_date
    AND session_id = p_session_id
    AND transport_status = 'dropped_off';
  
  -- Get payout from tiers table based on number of stops
  SELECT price_thb
  INTO v_tier_price
  FROM driver_payout_tiers
  WHERE session_type = p_session_id
    AND v_total_stops >= min_stops
    AND v_total_stops <= max_stops
  LIMIT 1;
  
  -- Insert/Update driver_payments record
  INSERT INTO driver_payments (
    driver_id, 
    run_date, 
    session_id, 
    total_stops, 
    total_pax, 
    payout_amount, 
    status
  )
  VALUES (
    p_driver_id, 
    p_run_date, 
    p_session_id, 
    v_total_stops, 
    v_total_pax, 
    COALESCE(v_tier_price, 0), 
    'pending'
  )
  ON CONFLICT (driver_id, run_date, session_id)
  DO UPDATE SET
    total_stops = v_total_stops,
    total_pax = v_total_pax,
    payout_amount = COALESCE(v_tier_price, 0),
    updated_at = NOW();
  
  -- Return the calculated payout amount
  RETURN QUERY SELECT COALESCE(v_tier_price, 0) as payout_amount;
END;
$$;


ALTER FUNCTION "public"."calculate_driver_payout"("p_driver_id" "uuid", "p_run_date" "date", "p_session_id" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_driver_payout"("p_driver_id" "uuid", "p_run_date" "date", "p_session_id" "text") IS 'Calculates and stores driver payout based on completed routes. Returns payout amount in THB.';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_chat_messages"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Elimina i messaggi e le sessioni più vecchie di 30 giorni per la privacy
    DELETE FROM public.chat_sessions 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_chat_messages"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrease_stock_on_order"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.shop_akha
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE sku = NEW.sku;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."decrease_stock_on_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_booking_ref"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Genera: TAK + numero con padding di zeri a sinistra (5 cifre)
  NEW.booking_ref := 'TAK' || lpad(nextval('booking_ref_seq')::text, 5, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_booking_ref"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_weekly_payouts"("p_start_date" "date", "p_end_date" "date") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    d date;
    driver record;
    v_amt int;
    v_stops int;
    v_pax int;
    sess text;
BEGIN
    -- Per ogni giorno nel range
    FOR d IN 0 .. (p_end_date - p_start_date) LOOP
        -- Per ogni driver attivo
        FOR driver IN SELECT id FROM profiles WHERE role = 'driver' LOOP
            -- Per ogni sessione (Mattina/Sera)
            FOREACH sess IN ARRAY ARRAY['morning_class', 'evening_class'] LOOP
                
                -- 1. Calcola importo
                v_amt := calculate_driver_payout(driver.id, (p_start_date + d), sess);
                
                -- 2. Se c'è lavoro, crea/aggiorna il record
                IF v_amt > 0 THEN
                    -- Statistiche extra per il report
                    SELECT count(DISTINCT hotel_name), COALESCE(sum(pax_count),0)
                    INTO v_stops, v_pax
                    FROM bookings 
                    WHERE pickup_driver_uid = driver.id 
                    AND booking_date = (p_start_date + d) 
                    AND session_id = sess
                    AND status != 'cancelled';

                    -- Inserisci o aggiorna (se ancora 'pending')
                    INSERT INTO driver_payments (
                        driver_id, run_date, session_id, total_stops, total_pax, payout_amount, status
                    ) VALUES (
                        driver.id, (p_start_date + d), sess, v_stops, v_pax, v_amt, 'pending'
                    )
                    ON CONFLICT (driver_id, run_date, session_id) 
                    DO UPDATE SET 
                        payout_amount = EXCLUDED.payout_amount, 
                        total_stops = EXCLUDED.total_stops, 
                        total_pax = EXCLUDED.total_pax
                    WHERE driver_payments.status = 'pending'; -- Non toccare se già pagato
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_weekly_payouts"("p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_calendar_availability"("start_date" "date", "end_date" "date") RETURNS TABLE("booking_date" "date", "session_id" "text", "total_occupied" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.booking_date,
        b.session_id,
        COALESCE(SUM(b.pax_count), 0)::BIGINT AS total_occupied
    FROM bookings b
    WHERE b.booking_date >= start_date 
      AND b.booking_date <= end_date
      AND b.status != 'cancelled'
    GROUP BY b.booking_date, b.session_id;
END;
$$;


ALTER FUNCTION "public"."get_calendar_availability"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_chat_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.chat_sessions 
  SET 
    last_activity = NOW(),
    message_count = message_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_chat_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    dietary_profile, 
    preferred_spiciness_id,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Guest'), -- Prende il nome dai metadati Auth o usa fallback
    'guest', -- Ruolo Default System 4.8
    'diet_regular',
    2,
    now()
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_stock_inventory"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- A. NUOVO ORDINE (Save/Insert) -> SCALA STOCK
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.shop_akha
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE sku = NEW.sku;
    RETURN NEW;

  -- B. CANCELLAZIONE (Delete) -> RESTITUISCI STOCK
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.shop_akha
    SET stock_quantity = stock_quantity + OLD.quantity
    WHERE sku = OLD.sku;
    RETURN OLD;

  -- C. MODIFICA (Update)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Se cambia solo lo stato (es. da 'pending' a 'paid'), NON toccare lo stock.
    -- Lo stock è già stato scalato all'inserimento (INSERT).
    IF (NEW.quantity = OLD.quantity) THEN
        RETURN NEW;
    END IF;
    
    -- Se cambia la quantità, aggiusta la differenza
    UPDATE public.shop_akha
    SET stock_quantity = stock_quantity - (NEW.quantity - OLD.quantity)
    WHERE sku = NEW.sku;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."handle_stock_inventory"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_recipe_with_ingredients"("p_recipe_id" "text", "p_name" "text", "p_description" "text", "p_is_vegan" boolean, "p_is_vegetarian" boolean, "p_category" "text", "p_image" "text", "p_spiciness" integer, "p_has_peanuts" boolean, "p_has_shellfish" boolean, "p_has_gluten" boolean, "p_has_soy" boolean, "p_color_theme" "text", "p_health_benefits" "text", "p_is_signature" boolean DEFAULT false, "p_is_fixed_dish" boolean DEFAULT false, "p_key_ingredients" "text"[] DEFAULT NULL::"text"[], "p_thai_name" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Inserisci o aggiorna la ricetta
  INSERT INTO public.recipes (
    id, name, thai_name, description, is_vegan, is_vegetarian, 
    category, image, spiciness, has_peanuts, has_shellfish, 
    has_gluten, has_soy, color_theme, health_benefits, 
    is_signature, is_fixed_dish
  ) VALUES (
    p_recipe_id, p_name, p_thai_name, p_description, p_is_vegan, p_is_vegetarian,
    p_category, p_image, p_spiciness, p_has_peanuts, p_has_shellfish,
    p_has_gluten, p_has_soy, p_color_theme, p_health_benefits,
    p_is_signature, p_is_fixed_dish
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    thai_name = EXCLUDED.thai_name,
    description = EXCLUDED.description,
    is_vegan = EXCLUDED.is_vegan,
    is_vegetarian = EXCLUDED.is_vegetarian,
    category = EXCLUDED.category,
    image = EXCLUDED.image,
    spiciness = EXCLUDED.spiciness,
    has_peanuts = EXCLUDED.has_peanuts,
    has_shellfish = EXCLUDED.has_shellfish,
    has_gluten = EXCLUDED.has_gluten,
    has_soy = EXCLUDED.has_soy,
    color_theme = EXCLUDED.color_theme,
    health_benefits = EXCLUDED.health_benefits,
    is_signature = EXCLUDED.is_signature,
    is_fixed_dish = EXCLUDED.is_fixed_dish;
    
  -- Se ci sono ingredienti chiave, inseriscili
  IF p_key_ingredients IS NOT NULL THEN
    -- Prima elimina gli ingredienti esistenti
    DELETE FROM public.recipe_key_ingredients WHERE recipe_id = p_recipe_id;
    
    -- Poi inserisci i nuovi
    FOR i IN 1..array_length(p_key_ingredients, 1) LOOP
      INSERT INTO public.recipe_key_ingredients (recipe_id, ingredient, display_order)
      VALUES (p_recipe_id, p_key_ingredients[i], i);
    END LOOP;
  END IF;
END;
$$;


ALTER FUNCTION "public"."insert_recipe_with_ingredients"("p_recipe_id" "text", "p_name" "text", "p_description" "text", "p_is_vegan" boolean, "p_is_vegetarian" boolean, "p_category" "text", "p_image" "text", "p_spiciness" integer, "p_has_peanuts" boolean, "p_has_shellfish" boolean, "p_has_gluten" boolean, "p_has_soy" boolean, "p_color_theme" "text", "p_health_benefits" "text", "p_is_signature" boolean, "p_is_fixed_dish" boolean, "p_key_ingredients" "text"[], "p_thai_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'kitchen', 'driver', 'logistics')
  );
$$;


ALTER FUNCTION "public"."is_staff"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_booking_by_ref"("p_booking_ref" "text", "p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_booking_id uuid;
    v_current_pax int;
    v_max_pax int;
BEGIN
    -- 1. Trova il booking e controlla validità
    SELECT internal_id, pax_count INTO v_booking_id, v_max_pax
    FROM bookings
    WHERE booking_ref = p_booking_ref
    AND status IN ('confirmed', 'pending');

    IF v_booking_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Booking reference not found or invalid.');
    END IF;

    -- 2. Conta partecipanti attuali
    SELECT count(*) INTO v_current_pax
    FROM booking_participants
    WHERE booking_id = v_booking_id;

    -- 3. Controllo Anti-Overbooking (Opzionale: se vuoi bloccare quando il gruppo è pieno)
    -- IF v_current_pax >= v_max_pax THEN
    --    RETURN json_build_object('success', false, 'message', 'This group is already full.');
    -- END IF;

    -- 4. Inserisci il partecipante (Se non esiste già)
    INSERT INTO booking_participants (booking_id, user_id, is_leader)
    VALUES (v_booking_id, p_user_id, false)
    ON CONFLICT (booking_id, user_id) DO NOTHING;

    RETURN json_build_object('success', true, 'booking_id', v_booking_id);
END;
$$;


ALTER FUNCTION "public"."join_booking_by_ref"("p_booking_ref" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_booking_ref"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF OLD.booking_ref IS DISTINCT FROM NEW.booking_ref THEN
      RAISE EXCEPTION 'Il Booking Reference (TAK ID) non può essere modificato.';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."protect_booking_ref"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reject_hotel_location"("target_hotel_id" "uuid", "reason" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.hotel_locations
  SET 
    review_status = 'rejected',
    is_active = false,
    rejection_reason = reason
  WHERE id = target_hotel_id;
END;
$$;


ALTER FUNCTION "public"."reject_hotel_location"("target_hotel_id" "uuid", "reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_menu_confirmation_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_email text;
  v_user_name text;
  v_curry_name text;
  v_soup_name text;
  v_stirfry_name text;
  v_resend_api_key text := '<RESEND_API_KEY_RIMOSSA_20260804 - vedi 2026_011_Security_Advisor_Remediation>'; -- <--- METTI LA CHIAVE QUI
  v_email_body jsonb;
BEGIN
  -- Recupera Email e Nome dello studente
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Recupera i nomi dei piatti (gestendo il caso null)
  SELECT COALESCE(name, 'Non selezionato') INTO v_curry_name FROM public.recipes WHERE id = NEW.curry_selection;
  SELECT COALESCE(name, 'Non selezionato') INTO v_soup_name FROM public.recipes WHERE id = NEW.soup_selection;
  SELECT COALESCE(name, 'Non selezionato') INTO v_stirfry_name FROM public.recipes WHERE id = NEW.stirfry_selection;

  -- Costruisci il corpo dell'email (HTML semplice)
  v_email_body := json_build_object(
    'from', 'Thai Akha Kitchen <office@thaiakhakitchen.com>', -- Deve matchare il tuo dominio verificato
    'to', v_user_email,
    'subject', 'Menu Confirmation: Your Akha Journey Begins!',
    'html', format(
      '<h1>Sawazdee krup %s!</h1>
       <p>Your menu selection has been locked in for your upcoming class.</p>
       <h3>Your Selections:</h3>
       <ul>
         <li><strong>Curry:</strong> %s</li>
         <li><strong>Soup:</strong> %s</li>
         <li><strong>Stir-Fry:</strong> %s</li>
       </ul>
       <p>Dietary Profile: %s</p>
       <br>
       <p>See you in the kitchen!</p>
       <p><em>Thai Akha Kitchen Team</em></p>',
      v_user_name, v_curry_name, v_soup_name, v_stirfry_name, NEW.selected_profile
    )
  );

  -- Invia la richiesta a Resend
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := json_build_object(
      'Authorization', 'Bearer ' || v_resend_api_key,
      'Content-Type', 'application/json'
    ),
    body := v_email_body
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."send_menu_confirmation_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_menu_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  -- 🔴 INCOLLA QUI LA TUA API KEY DI RESEND (Mantieni gli apici)
  v_resend_key text := '<RESEND_API_KEY_RIMOSSA_20260804 - vedi 2026_011_Security_Advisor_Remediation>'; 
  
  -- Variabili per contenere i dati
  v_user_email text;
  v_user_name text;
  v_booking_id text;
  v_curry text;
  v_soup text;
  v_stirfry text;
BEGIN
  -- A. Recupera nome, email e booking ID dello studente
  SELECT email, full_name, reservation_id INTO v_user_email, v_user_name, v_booking_id
  FROM public.profiles 
  WHERE id = NEW.user_id;

  -- B. Recupera i nomi dei piatti (Se null, scrive 'Non selezionato')
  SELECT COALESCE(name, 'Non selezionato') INTO v_curry FROM public.recipes WHERE id = NEW.curry_selection;
  SELECT COALESCE(name, 'Non selezionato') INTO v_soup FROM public.recipes WHERE id = NEW.soup_selection;
  SELECT COALESCE(name, 'Non selezionato') INTO v_stirfry FROM public.recipes WHERE id = NEW.stirfry_selection;

  -- C. Spedisce l'email usando pg_net (Esattamente come nel test)
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_resend_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Thai Akha Kitchen <office@thaiakhakitchen.com>', -- 🔴 TUA EMAIL VERIFICATA
      'to', v_user_email,
      'subject', 'Menu Confirmation: ' || v_user_name,
      'html', format(
        '<div style="font-family: sans-serif; color: #333;">
           <h1>Sawazdee krup %s!</h1>
           <p>Your menu selection has been confirmed for Booking ID: <strong>%s</strong>.</p>
           <hr style="border: 0; border-top: 1px solid #eee;">
           <h3>Your Selected Menu:</h3>
           <ul>
             <li><strong>Curry:</strong> %s</li>
             <li><strong>Soup:</strong> %s</li>
             <li><strong>Stir-Fry:</strong> %s</li>
           </ul>
           <p><strong>Dietary Profile:</strong> %s</p>
           <br>
           <p style="color: #666; font-size: 12px;">See you in the kitchen!<br>Thai Akha Kitchen Team</p>
         </div>',
        v_user_name, v_booking_id, v_curry, v_soup, v_stirfry, NEW.selected_profile
      )
    )
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."send_menu_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."split_booking_pax"("original_booking_id" "uuid", "pax_to_move" integer, "new_hotel_name" "text", "new_pickup_time" time without time zone, "admin_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    original_booking record;
    new_booking_id uuid;
    new_ref text;
BEGIN
    -- 1. Ottieni dati originali e blocca la riga
    SELECT * INTO original_booking 
    FROM bookings 
    WHERE internal_id = original_booking_id 
    FOR UPDATE;

    IF original_booking.pax_count <= pax_to_move THEN
        RETURN json_build_object('success', false, 'error', 'Cannot move all or more pax than available');
    END IF;

    -- 2. Genera nuovo riferimento (es. TAK-100-B)
    new_ref := original_booking.booking_ref || '-B';

    -- 3. Riduci i PAX del padre
    UPDATE bookings 
    SET pax_count = pax_count - pax_to_move,
        updated_at = now()
    WHERE internal_id = original_booking_id;

    -- 4. Crea il booking "Figlio" (Clona tutto tranne location e pax)
    INSERT INTO bookings (
        user_id, session_id, booking_date, status, 
        pax_count, hotel_name, pickup_time, 
        payment_method, payment_status, booking_ref,
        parent_booking_id, is_split_child,
        agency_note
    )
    VALUES (
        original_booking.user_id, 
        original_booking.session_id, 
        original_booking.booking_date, 
        original_booking.status,
        pax_to_move, -- Nuovi Pax
        new_hotel_name, -- Nuovo Hotel
        new_pickup_time, -- Nuovo Orario
        original_booking.payment_method,
        original_booking.payment_status,
        new_ref, -- Nuovo Ref
        original_booking.internal_id, -- Link al Padre
        true,
        'Split from ' || original_booking.booking_ref
    )
    RETURNING internal_id INTO new_booking_id;

    RETURN json_build_object(
        'success', true, 
        'old_pax', original_booking.pax_count - pax_to_move,
        'new_booking_id', new_booking_id
    );
END;
$$;


ALTER FUNCTION "public"."split_booking_pax"("original_booking_id" "uuid", "pax_to_move" integer, "new_hotel_name" "text", "new_pickup_time" time without time zone, "admin_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."standardize_allergy_value"("allergy" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN CASE LOWER(TRIM(allergy))
    -- Mappa varianti comuni ai valori standard
    WHEN 'gluten' THEN 'gluten'
    WHEN 'wheat' THEN 'gluten'
    WHEN 'celiac' THEN 'gluten'
    WHEN 'peanut' THEN 'peanuts'
    WHEN 'nuts' THEN 'peanuts'
    WHEN 'shellfish' THEN 'shellfish'
    WHEN 'shrimp' THEN 'shellfish'
    WHEN 'prawn' THEN 'shellfish'
    WHEN 'crab' THEN 'shellfish'
    WHEN 'lobster' THEN 'shellfish'
    WHEN 'soy' THEN 'soy'
    WHEN 'soya' THEN 'soy'
    WHEN 'dairy' THEN 'dairy'
    WHEN 'milk' THEN 'dairy'
    WHEN 'lactose' THEN 'dairy'
    WHEN 'egg' THEN 'eggs'
    WHEN 'tree nuts' THEN 'tree nuts'
    WHEN 'cashew' THEN 'tree nuts'
    WHEN 'almond' THEN 'tree nuts'
    WHEN 'sesame' THEN 'sesame'
    WHEN 'fish' THEN 'fish'
    WHEN 'seafood' THEN 'seafood'
    ELSE allergy
  END;
END;
$$;


ALTER FUNCTION "public"."standardize_allergy_value"("allergy" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_chat_session_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.chat_sessions 
  SET 
    last_activity = NOW(),
    message_count = message_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_chat_session_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_and_standardize_allergies"("user_allergies" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  allergy_value text;
BEGIN
  -- Per ogni allergia nell'array
  FOR allergy_value IN 
    SELECT * FROM jsonb_array_elements_text(user_allergies)
  LOOP
    -- Standardizza il valore
    allergy_value := standardize_allergy_value(allergy_value);
    
    -- Verifica se esiste nella knowledge base
    IF EXISTS (SELECT 1 FROM public.allergy_knowledge WHERE allergy_key = allergy_value) THEN
      -- Aggiungi se non già presente
      IF NOT result @> jsonb_build_array(allergy_value) THEN
        result := result || jsonb_build_array(allergy_value);
      END IF;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."validate_and_standardize_allergies"("user_allergies" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_user_allergies_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Standardizza e valida le allergie
  NEW.allergies := validate_and_standardize_allergies(NEW.allergies);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_user_allergies_trigger"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."akha_news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "excerpt" "text",
    "content" "text",
    "cover_image_url" "text",
    "category" "text" DEFAULT 'culture'::"text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "author_id" "uuid",
    "read_time_minutes" integer DEFAULT 5,
    "is_published" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "published_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "seo_title" "text",
    "seo_description" "text",
    "seo_keywords" "text"[] DEFAULT '{}'::"text"[],
    "seo_robots" "text" DEFAULT 'index, follow'::"text",
    "og_image" "text",
    "audio_asset_id" "text",
    "subtitle" "text",
    "json_ld" "jsonb",
    "access_level" "text" DEFAULT 'public'::"text",
    CONSTRAINT "akha_news_access_level_check" CHECK (("access_level" = ANY (ARRAY['public'::"text", 'internal'::"text"]))),
    CONSTRAINT "akha_news_category_check" CHECK (("category" = ANY (ARRAY['culture'::"text", 'events'::"text", 'recipes'::"text", 'community'::"text", 'coffee'::"text"])))
);


ALTER TABLE "public"."akha_news" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."allergy_knowledge" (
    "allergy_key" "text" NOT NULL,
    "warning_text" "text" NOT NULL
);


ALTER TABLE "public"."allergy_knowledge" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audio_assets" (
    "asset_id" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "folder_path" "text" DEFAULT 'audio'::"text",
    "audio_url" "text" NOT NULL,
    "title" "text" NOT NULL,
    "caption" "text",
    "transcript" "text",
    "mime_type" "text" DEFAULT 'audio/mpeg'::"text",
    "duration_seconds" integer,
    "size_kb" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uploaded_by" "uuid"
);


ALTER TABLE "public"."audio_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_leader" boolean DEFAULT false,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."booking_participants" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."booking_ref_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."booking_ref_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "user_id" "uuid",
    "booking_date" "date" DEFAULT "now"() NOT NULL,
    "session_type" "text",
    "status" "text" DEFAULT 'confirmed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "internal_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_source" "text",
    "hotel_name" "text",
    "reservation_id_agency" "text",
    "email_reference" "text",
    "session_id" "text",
    "pickup_zone" "text",
    "pickup_time" time without time zone,
    "pax_count" integer DEFAULT 1,
    "total_price" integer DEFAULT 0,
    "special_requests" "text",
    "phone_number" "text",
    "phone_prefix" "text",
    "agency_note" "text",
    "customer_note" "text",
    "route_order" integer DEFAULT 0,
    "payment_method" "text" DEFAULT 'pay_on_arrival'::"text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "applied_commission_rate" integer DEFAULT 0,
    "pickup_lat" numeric,
    "pickup_lng" numeric,
    "pickup_driver_uid" "uuid",
    "pickup_sequence" integer DEFAULT 99,
    "dropoff_driver_uid" "uuid",
    "dropoff_sequence" integer DEFAULT 99,
    "dropoff_hotel" "text",
    "dropoff_zone" "text",
    "requires_dropoff" boolean DEFAULT true,
    "dropoff_lat" numeric,
    "dropoff_lng" numeric,
    "transport_status" "text" DEFAULT 'waiting'::"text",
    "actual_pickup_time" timestamp with time zone,
    "actual_dropoff_time" timestamp with time zone,
    "booking_ref" "text",
    "zoho_invoice_id" "text",
    "commission_amount" integer DEFAULT 0,
    "guest_user_id" "uuid",
    "guest_name" "text",
    "guest_email" "text",
    "parent_booking_id" "uuid",
    "is_split_child" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "has_luggage" boolean DEFAULT false,
    "meeting_point" "text",
    "visitor_count" integer DEFAULT 0,
    CONSTRAINT "bookings_dropoff_zone_check" CHECK (("dropoff_zone" = ANY (ARRAY['green'::"text", 'yellow'::"text", 'pink'::"text", 'azure'::"text", 'outside'::"text", 'walk-in'::"text"]))),
    CONSTRAINT "bookings_pickup_zone_check" CHECK (("pickup_zone" = ANY (ARRAY['green'::"text", 'yellow'::"text", 'pink'::"text", 'azure'::"text", 'outside'::"text", 'walk-in'::"text"]))),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'cancelled'::"text", 'completed'::"text", 'amended'::"text"]))),
    CONSTRAINT "bookings_transport_status_check" CHECK (("transport_status" = ANY (ARRAY['waiting'::"text", 'driver_en_route'::"text", 'driver_arrived'::"text", 'on_board'::"text", 'dropped_off'::"text"]))),
    CONSTRAINT "check_visitor_limits" CHECK ((("visitor_count" >= 0) AND ("visitor_count" <= 2) AND ("visitor_count" <= "pax_count")))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "sender_role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'text'::"text" NOT NULL,
    CONSTRAINT "chat_messages_sender_role_check" CHECK (("sender_role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_token" "text",
    "user_id" "uuid",
    "summary" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "message_count" integer DEFAULT 0,
    "last_activity" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    CONSTRAINT "chat_sessions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text", 'deleted'::"text"])))
);


ALTER TABLE "public"."chat_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_calendar_overrides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "session_id" "text" NOT NULL,
    "is_closed" boolean DEFAULT false,
    "custom_capacity" integer,
    "closure_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."class_calendar_overrides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_key" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text" NOT NULL,
    "tag_badge" "text",
    "ui_style" "text" DEFAULT 'accordion'::"text",
    "assigned_classes" "text"[] DEFAULT '{}'::"text"[],
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "class_sections_ui_style_check" CHECK (("ui_style" = ANY (ARRAY['accordion'::"text", 'timeline'::"text", 'grid_card'::"text", 'alert_box'::"text"])))
);


ALTER TABLE "public"."class_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_sessions" (
    "id" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "price_thb" integer NOT NULL,
    "duration_hours" numeric,
    "has_market_tour" boolean DEFAULT false,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "schedule_config" "jsonb" NOT NULL,
    "meeting_points" "jsonb",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "max_capacity" integer NOT NULL
);


ALTER TABLE "public"."class_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_categories" (
    "id" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "content_body" "text",
    "ui_quote" "text",
    "image_url" "text",
    "icon_name" "text",
    "audio_story_url" "text",
    "video_url" "text",
    "author_name" "text",
    "author_url" "text",
    "author_bio" "text",
    "cherry_context" "text",
    "chef_secrets" "text"[],
    "seo_keywords" "text"[],
    "seo_priority" integer DEFAULT 0,
    "translations" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "title_highlight" "text",
    "tab_label" character varying(50),
    CONSTRAINT "content_categories_domain_check" CHECK (("domain" = ANY (ARRAY['recipe'::"text", 'ingredient'::"text", 'history'::"text", 'blog'::"text"])))
);


ALTER TABLE "public"."content_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cooking_classes" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "badge" "text",
    "tags" "text"[],
    "price" integer NOT NULL,
    "currency" "text" DEFAULT 'THB'::"text",
    "unit" "text" DEFAULT 'per person'::"text",
    "theme_color" "text",
    "duration_text" "text",
    "tagline" "text",
    "capacity_text" "text",
    "image_url" "text",
    "description" "text",
    "highlights" "text"[],
    "schedule_items" "jsonb",
    "inclusions" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cooking_classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."culture_sections" (
    "id" "text" NOT NULL,
    "display_order" integer NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text" NOT NULL,
    "content" "text" NOT NULL,
    "featured" boolean DEFAULT false,
    "primary_image" "text",
    "quote" "text",
    "slug" "text",
    "gallery_images" "text"[] DEFAULT '{}'::"text"[],
    "seo_title" "text",
    "seo_description" "text",
    "is_published" boolean DEFAULT true,
    "category" "text",
    "audio_asset_id" "text",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "author_name" "text" DEFAULT 'Niti Muelaeku'::"text",
    "seo_keywords" "text"[] DEFAULT '{}'::"text"[],
    "seo_robots" "text" DEFAULT 'index, follow'::"text",
    "og_image" "text",
    "category_id" "text",
    "json_ld" "jsonb"
);


ALTER TABLE "public"."culture_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dietary_profiles" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text",
    "introduction" "text",
    "experience" "text",
    "slug" "text" NOT NULL,
    "icon_name" "text",
    "display_order" integer DEFAULT 0,
    "type" "text" DEFAULT 'religious'::"text",
    "image_url" "text"
);


ALTER TABLE "public"."dietary_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dietary_substitutions" (
    "id" integer NOT NULL,
    "profile_id" "text",
    "original_ingredient" "text",
    "substitute_ingredient" "text"
);


ALTER TABLE "public"."dietary_substitutions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."dietary_substitutions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."dietary_substitutions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."dietary_substitutions_id_seq" OWNED BY "public"."dietary_substitutions"."id";



CREATE TABLE IF NOT EXISTS "public"."driver_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "run_date" "date" NOT NULL,
    "session_id" "text" NOT NULL,
    "total_stops" integer NOT NULL,
    "total_pax" integer NOT NULL,
    "payout_amount" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "driver_payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text"])))
);


ALTER TABLE "public"."driver_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."driver_payout_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_type" "text" NOT NULL,
    "min_stops" integer NOT NULL,
    "max_stops" integer NOT NULL,
    "price_thb" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "driver_payout_tiers_session_type_check" CHECK (("session_type" = ANY (ARRAY['morning_class'::"text", 'evening_class'::"text"])))
);


ALTER TABLE "public"."driver_payout_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ethnic_groups" (
    "id" integer NOT NULL,
    "section_id" "text",
    "name" "text" NOT NULL,
    "origins" "text",
    "cultural_depth" "text",
    "quote" "text",
    "distinction" "text"
);


ALTER TABLE "public"."ethnic_groups" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ethnic_groups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."ethnic_groups_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ethnic_groups_id_seq" OWNED BY "public"."ethnic_groups"."id";



CREATE TABLE IF NOT EXISTS "public"."gallery_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gallery_id" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "quote" "text",
    "asset_id" "text" NOT NULL
);


ALTER TABLE "public"."gallery_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_cards" (
    "id" integer NOT NULL,
    "link" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "icon_name" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "card_type" "text",
    "target_path" "text",
    "role" "text",
    "variant" "text"
);


ALTER TABLE "public"."home_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_cards_front" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "link_label" "text",
    "target_path" "text" NOT NULL,
    "image_url" "text",
    "icon_name" "text",
    "color_theme" "text" DEFAULT 'cherry'::"text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."home_cards_front" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."home_cards_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."home_cards_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."home_cards_id_seq" OWNED BY "public"."home_cards"."id";



CREATE TABLE IF NOT EXISTS "public"."home_cards_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "card_id" integer NOT NULL,
    "language" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "link_label" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."home_cards_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hotel_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "zone_id" "text",
    "latitude" numeric,
    "longitude" numeric,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "google_place_id" "text",
    "source" "text" DEFAULT 'admin'::"text",
    "review_status" "text" DEFAULT 'approved'::"text",
    "rejection_reason" "text",
    "submitted_by" "uuid",
    "address" "text",
    "phone_number" "text",
    "map_link" "text",
    "website" "text",
    CONSTRAINT "hotel_locations_review_status_check" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "hotel_locations_source_check" CHECK (("source" = ANY (ARRAY['admin'::"text", 'google'::"text", 'user_pin'::"text"])))
);


ALTER TABLE "public"."hotel_locations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."hotel_locations"."map_link" IS 'Link diretto (es. https://maps.app.goo.gl/...) per uso Driver';



CREATE TABLE IF NOT EXISTS "public"."hotel_pickup_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hotel_id" "uuid" NOT NULL,
    "day_of_week" integer,
    "start_time" time without time zone DEFAULT '00:00:00'::time without time zone NOT NULL,
    "end_time" time without time zone DEFAULT '23:59:59'::time without time zone NOT NULL,
    "alt_meeting_point" "text" NOT NULL,
    "alt_latitude" numeric NOT NULL,
    "alt_longitude" numeric NOT NULL,
    "alt_map_link" "text",
    "guest_message" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "hotel_pickup_rules_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."hotel_pickup_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingredients_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name_en" "text" NOT NULL,
    "name_th" "text",
    "phonetic" "text",
    "description" "text",
    "image_url" "text",
    "category" "text" DEFAULT 'fresh'::"text",
    "default_unit" "text" DEFAULT 'g'::"text",
    "storage_area" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category_id" "text",
    "purchase_group" "text" DEFAULT 'none'::"text",
    "logistics_shop" "text" DEFAULT 'general'::"text",
    "is_logistics_item" boolean DEFAULT true,
    "is_teacher_item" boolean DEFAULT false,
    "teacher_shop" "text" DEFAULT 'General'::"text",
    "is_visible_public" boolean DEFAULT false,
    CONSTRAINT "ingredients_purchase_group_check" CHECK (("purchase_group" = ANY (ARRAY['teacher_daily'::"text", 'logistics_weekly'::"text", 'none'::"text"])))
);


ALTER TABLE "public"."ingredients_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "shopper_role" "text" NOT NULL,
    "total_cost" numeric DEFAULT 0,
    "notes" "text",
    "items_snapshot" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "zoho_expense_id" "text",
    "status" "text" DEFAULT 'planned'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "market_runs_shopper_role_check" CHECK (("shopper_role" = ANY (ARRAY['teacher'::"text", 'logistics'::"text"])))
);


ALTER TABLE "public"."market_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text" NOT NULL,
    "folder_path" "text" DEFAULT 'general'::"text",
    "image_url" "text" NOT NULL,
    "alt_text" "text",
    "title" "text",
    "caption" "text",
    "mime_type" "text",
    "size_kb" integer,
    "width" integer,
    "height" integer,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "asset_id" "text",
    "copyright" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "is_ai_generated" boolean DEFAULT true,
    "ai_tool" "text" DEFAULT 'Google Flow'::"text"
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meeting_points" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "latitude" numeric,
    "longitude" numeric,
    "google_maps_link" "text",
    "active" boolean DEFAULT true,
    "image_url" "text",
    "icon_url" "text",
    "morning_pickup_time" time without time zone,
    "morning_pickup_end" time without time zone,
    "evening_pickup_time" time without time zone,
    "evening_pickup_end" time without time zone
);


ALTER TABLE "public"."meeting_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."menu_selections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "curry_id" "text",
    "soup_id" "text",
    "stirfry_id" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "selected_allergies" "text"[] DEFAULT '{}'::"text"[],
    "selected_profile" "text" DEFAULT 'regular'::"text",
    "spiciness_id" integer,
    "booking_id" "uuid"
);


ALTER TABLE "public"."menu_selections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_sections" (
    "section_id" "text" NOT NULL,
    "page_slug" "text",
    "tag_badge" "text",
    "title" "text" NOT NULL,
    "highlight" "text",
    "subtitle" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."page_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pickup_zones" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "color_code" "text",
    "morning_pickup_time" time without time zone,
    "evening_pickup_time" time without time zone,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "display_order" integer DEFAULT 100,
    "morning_pickup_end" time without time zone,
    "evening_pickup_end" time without time zone
);


ALTER TABLE "public"."pickup_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text",
    "dietary_profile" "text" DEFAULT 'diet_regular'::"text",
    "allergies" "jsonb" DEFAULT '[]'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" DEFAULT 'user'::"text",
    "preferred_spiciness_id" integer DEFAULT 2,
    "avatar_url" "text",
    "agency_commission_rate" integer,
    "agency_company_name" "text",
    "agency_tax_id" "text",
    "agency_phone" "text",
    "agency_address" "text",
    "agency_city" "text",
    "agency_province" "text",
    "agency_country" "text",
    "agency_postal_code" "text",
    "zoho_contact_id" "text",
    "commission_config" "jsonb",
    "managed_by" "uuid",
    "whatsapp" boolean DEFAULT false,
    "gender" "text",
    "age" integer,
    "nationality" "text",
    "is_active" boolean DEFAULT true,
    "line_id" "text",
    "quiz_points" integer DEFAULT 0,
    CONSTRAINT "profiles_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'manager'::"text", 'agency'::"text", 'kitchen'::"text", 'driver'::"text", 'alumni'::"text", 'guest'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."avatar_url" IS 'Se null, generato automaticamente in base a age/gender';



CREATE TABLE IF NOT EXISTS "public"."quiz_categories" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "icon_name" "text",
    "color_theme" "text" DEFAULT 'quiz-p'::"text",
    "avatar_url" "text",
    "cover_image_url" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quiz_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_levels" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "image_url" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category_id" "text"
);


ALTER TABLE "public"."quiz_levels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."quiz_levels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."quiz_levels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."quiz_levels_id_seq" OWNED BY "public"."quiz_levels"."id";



CREATE TABLE IF NOT EXISTS "public"."quiz_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" integer,
    "title" "text" NOT NULL,
    "icon" "text" DEFAULT 'graduation-cap'::"text",
    "theme" "text" DEFAULT 'culture'::"text",
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."quiz_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "uuid",
    "text" "text" NOT NULL,
    "options" "jsonb" NOT NULL,
    "correct_index" integer NOT NULL,
    "explanation" "text",
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_rewards" (
    "id" integer NOT NULL,
    "icon_name" "text" NOT NULL,
    "label" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "image_url" "text",
    "audio_url" "text",
    "description" "text",
    "required_points" integer DEFAULT 100
);


ALTER TABLE "public"."quiz_rewards" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."quiz_rewards_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."quiz_rewards_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."quiz_rewards_id_seq" OWNED BY "public"."quiz_rewards"."id";



CREATE TABLE IF NOT EXISTS "public"."recipe_composition" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipe_id" "text" NOT NULL,
    "ingredient_id" "uuid" NOT NULL,
    "quantity" numeric,
    "unit" "text",
    "prep_note" "text",
    "is_key_ingredient" boolean DEFAULT false,
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."recipe_composition" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_key_ingredients" (
    "id" integer NOT NULL,
    "recipe_id" "text",
    "ingredient" "text" NOT NULL,
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."recipe_key_ingredients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."recipe_key_ingredients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."recipe_key_ingredients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."recipe_key_ingredients_id_seq" OWNED BY "public"."recipe_key_ingredients"."id";



CREATE TABLE IF NOT EXISTS "public"."recipe_selection_categories" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "max_selections" integer DEFAULT 1
);


ALTER TABLE "public"."recipe_selection_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_selections" (
    "id" integer NOT NULL,
    "selection_category_id" "text",
    "recipe_id" "text",
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."recipe_selections" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."recipe_selections_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."recipe_selections_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."recipe_selections_id_seq" OWNED BY "public"."recipe_selections"."id";



CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "thai_name" "text",
    "description" "text" NOT NULL,
    "is_vegan" boolean DEFAULT false,
    "is_vegetarian" boolean DEFAULT false,
    "category" "text",
    "has_peanuts" boolean DEFAULT false,
    "has_shellfish" boolean DEFAULT false,
    "has_gluten" boolean DEFAULT false,
    "has_soy" boolean DEFAULT false,
    "image" "text",
    "spiciness" integer DEFAULT 0,
    "color_theme" "text",
    "health_benefits" "text",
    "is_signature" boolean DEFAULT false,
    "is_fixed_dish" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "dietary_variants" "jsonb" DEFAULT '{}'::"jsonb",
    "gallery_images" "text"[] DEFAULT '{}'::"text"[],
    "slug" "text",
    "seo_title" "text",
    "seo_description" "text",
    "seo_keywords" "text"[] DEFAULT '{}'::"text"[],
    "seo_robots" "text" DEFAULT 'index, follow'::"text",
    "og_image" "text",
    "is_published" boolean DEFAULT true,
    "published_at" timestamp with time zone DEFAULT "now"(),
    "author_name" "text" DEFAULT 'Niti Muelaeku'::"text",
    "audio_asset_id" "text",
    "subtitle" "text",
    "excerpt" "text",
    "json_ld" "jsonb",
    CONSTRAINT "recipes_spiciness_check" CHECK ((("spiciness" >= 1) AND ("spiciness" <= 5)))
);


ALTER TABLE "public"."recipes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."recipes"."dietary_variants" IS 'Contiene override di testi per diete specifiche. Es: {"diet_vegan": {"title": "Plant-Based Curry"}}';



CREATE TABLE IF NOT EXISTS "public"."shop_akha" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sku" "text" NOT NULL,
    "item_name" "text" NOT NULL,
    "description_internal" "text",
    "price_thb" numeric DEFAULT 0 NOT NULL,
    "cost_thb" numeric DEFAULT 0,
    "account_category" "text",
    "purchase_account" "text",
    "product_type" "text" DEFAULT 'goods'::"text",
    "stock_quantity" integer DEFAULT 0,
    "reorder_point" integer DEFAULT 5,
    "is_active" boolean DEFAULT true,
    "category_id" "text",
    "is_visible_online" boolean DEFAULT false,
    "tax_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "catalog_image_url" "text",
    "sub_category" "text" DEFAULT 'general'::"text",
    "zoho_item_id" "text"
);


ALTER TABLE "public"."shop_akha" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shop_categories" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "icon_name" "text" DEFAULT 'layout-grid'::"text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "description" "text"
);


ALTER TABLE "public"."shop_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shop_contacts" (
    "shop_name" "text" NOT NULL,
    "contact_name" "text",
    "line_id" "text",
    "phone_number" "text",
    "notes" "text"
);


ALTER TABLE "public"."shop_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shop_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid",
    "sku" "text",
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price_snapshot" numeric NOT NULL,
    "total_price" numeric GENERATED ALWAYS AS ((("quantity")::numeric * "unit_price_snapshot")) STORED,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "staff_note" "text"
);


ALTER TABLE "public"."shop_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shop_storefront" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "linked_sku" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "cultural_story" "text",
    "image_url" "text" NOT NULL,
    "color_theme" "text" DEFAULT '#98C93C'::"text",
    "badge_label" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."shop_storefront" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_metadata" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_slug" "text" NOT NULL,
    "header_title_main" "text" NOT NULL,
    "header_title_highlight" "text",
    "header_badge" "text",
    "header_icon" "text",
    "page_description" "text",
    "hero_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "show_in_menu" boolean DEFAULT false,
    "menu_order" integer DEFAULT 0,
    "menu_label" "text",
    "access_level" "text" DEFAULT 'public'::"text",
    "seo_title" "text",
    "seo_description" "text",
    "seo_keywords" "text"[] DEFAULT '{}'::"text"[],
    "seo_robots" "text" DEFAULT 'index, follow'::"text",
    "og_title" "text",
    "og_description" "text",
    "og_image" "text",
    "json_ld" "jsonb" DEFAULT '{}'::"jsonb",
    "canonical_url" "text",
    "seo_health_score" integer DEFAULT 0,
    "seo_audit_logs" "jsonb" DEFAULT '[]'::"jsonb",
    "last_seo_audit_at" timestamp with time zone,
    "parent_id" "uuid",
    CONSTRAINT "site_metadata_seo_health_score_check" CHECK ((("seo_health_score" >= 0) AND ("seo_health_score" <= 100)))
);


ALTER TABLE "public"."site_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_metadata_admin" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_slug" "text" NOT NULL,
    "header_badge" "text",
    "header_icon" "text",
    "hero_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "show_in_menu" boolean DEFAULT false,
    "menu_order" integer DEFAULT 0,
    "access_level" "text" DEFAULT 'public'::"text",
    "seo_robots" "text" DEFAULT 'index, follow'::"text",
    "og_image" "text",
    "canonical_url" "text",
    "seo_health_score" integer DEFAULT 0,
    "seo_audit_logs" "jsonb" DEFAULT '[]'::"jsonb",
    "last_seo_audit_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid",
    "is_active" boolean DEFAULT true,
    "parent_id" "uuid",
    "template" "text" DEFAULT 'default'::"text",
    "og_type" "text" DEFAULT 'website'::"text",
    "twitter_card" "text" DEFAULT 'summary_large_image'::"text",
    "cache_ttl" integer DEFAULT 3600,
    "redirect_to" "text",
    CONSTRAINT "check_access_level_admin" CHECK (("access_level" = ANY (ARRAY['public'::"text", 'admin'::"text", 'agency'::"text", 'driver'::"text", 'kitchen'::"text", 'logistics'::"text", 'manager'::"text"]))),
    CONSTRAINT "check_menu_order_admin" CHECK ((("show_in_menu" AND ("menu_order" IS NOT NULL)) OR ((NOT "show_in_menu") AND ("menu_order" IS NULL)))),
    CONSTRAINT "check_seo_score_admin" CHECK ((("seo_health_score" >= 0) AND ("seo_health_score" <= 100))),
    CONSTRAINT "site_metadata_admin_seo_health_score_check" CHECK ((("seo_health_score" >= 0) AND ("seo_health_score" <= 100)))
);


ALTER TABLE "public"."site_metadata_admin" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_metadata_admin_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "language" "text" NOT NULL,
    "title" "text",
    "subtitle" "text",
    "description" "text",
    "menu_label" "text",
    "seo_title" "text",
    "seo_description" "text",
    "seo_keywords" "text"[],
    "og_title" "text",
    "og_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."site_metadata_admin_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spiciness_levels" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "photo_description" "text",
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "label" "text",
    "philosophy_quote" "text",
    "chef_note" "text",
    "color_code" "text" DEFAULT '#9CA3AF'::"text",
    "subtitle" "text",
    "akha_connection" "text"
);


ALTER TABLE "public"."spiciness_levels" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_shop_products" WITH ("security_invoker"='on') AS
 SELECT "a"."sku",
    "a"."item_name" AS "accounting_name",
    "a"."price_thb",
    "a"."stock_quantity",
    "a"."category_id",
    "a"."catalog_image_url",
    COALESCE("s"."display_name", "a"."item_name") AS "display_name",
    "s"."cultural_story" AS "display_description",
    ("a"."is_active" AND ("a"."stock_quantity" > 0)) AS "is_purchasable"
   FROM ("public"."shop_akha" "a"
     LEFT JOIN "public"."shop_storefront" "s" ON (("a"."sku" = "s"."linked_sku")));


ALTER VIEW "public"."view_shop_products" OWNER TO "postgres";


ALTER TABLE ONLY "public"."dietary_substitutions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."dietary_substitutions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ethnic_groups" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ethnic_groups_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."home_cards" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."home_cards_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."quiz_levels" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."quiz_levels_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."quiz_rewards" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."quiz_rewards_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."recipe_key_ingredients" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recipe_key_ingredients_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."recipe_selections" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recipe_selections_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."akha_news"
    ADD CONSTRAINT "akha_news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."akha_news"
    ADD CONSTRAINT "akha_news_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."allergy_knowledge"
    ADD CONSTRAINT "allergy_knowledge_pkey" PRIMARY KEY ("allergy_key");



ALTER TABLE ONLY "public"."audio_assets"
    ADD CONSTRAINT "audio_assets_asset_id_key" UNIQUE ("asset_id");



ALTER TABLE ONLY "public"."audio_assets"
    ADD CONSTRAINT "audio_assets_audio_url_key" UNIQUE ("audio_url");



ALTER TABLE ONLY "public"."audio_assets"
    ADD CONSTRAINT "audio_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_participants"
    ADD CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booking_ref_key" UNIQUE ("booking_ref");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("internal_id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."class_calendar_overrides"
    ADD CONSTRAINT "class_calendar_overrides_date_session_id_key" UNIQUE ("date", "session_id");



ALTER TABLE ONLY "public"."class_calendar_overrides"
    ADD CONSTRAINT "class_calendar_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."class_sections"
    ADD CONSTRAINT "class_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."class_sections"
    ADD CONSTRAINT "class_sections_section_key_key" UNIQUE ("section_key");



ALTER TABLE ONLY "public"."class_sessions"
    ADD CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_categories"
    ADD CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cooking_classes"
    ADD CONSTRAINT "cooking_classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."culture_sections"
    ADD CONSTRAINT "cultu<RESEND_API_KEY_RIMOSSA_20260804 - vedi 2026_011_Security_Advisor_Remediation>" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."culture_sections"
    ADD CONSTRAINT "cultu<RESEND_API_KEY_RIMOSSA_20260804 - vedi 2026_011_Security_Advisor_Remediation>" UNIQUE ("slug");



ALTER TABLE ONLY "public"."dietary_profiles"
    ADD CONSTRAINT "dietary_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dietary_substitutions"
    ADD CONSTRAINT "dietary_substitutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."driver_payments"
    ADD CONSTRAINT "driver_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."driver_payout_tiers"
    ADD CONSTRAINT "driver_payout_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ethnic_groups"
    ADD CONSTRAINT "ethnic_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_items"
    ADD CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_cards_front"
    ADD CONSTRAINT "home_cards_front_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_cards"
    ADD CONSTRAINT "home_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_cards_translations"
    ADD CONSTRAINT "home_cards_translations_card_id_language_key" UNIQUE ("card_id", "language");



ALTER TABLE ONLY "public"."home_cards_translations"
    ADD CONSTRAINT "home_cards_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hotel_locations"
    ADD CONSTRAINT "hotel_locations_google_place_id_key" UNIQUE ("google_place_id");



ALTER TABLE ONLY "public"."hotel_locations"
    ADD CONSTRAINT "hotel_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hotel_pickup_rules"
    ADD CONSTRAINT "hotel_pickup_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ingredients_library"
    ADD CONSTRAINT "ingredients_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ingredients_library"
    ADD CONSTRAINT "ingredients_name_unique" UNIQUE ("name_en");



ALTER TABLE ONLY "public"."market_runs"
    ADD CONSTRAINT "market_runs_date_role_unique" UNIQUE ("run_date", "shopper_role");



ALTER TABLE ONLY "public"."market_runs"
    ADD CONSTRAINT "market_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_asset_id_key" UNIQUE ("asset_id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_image_url_key" UNIQUE ("image_url");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meeting_points"
    ADD CONSTRAINT "meeting_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "menu_selections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_sections"
    ADD CONSTRAINT "page_sections_pkey" PRIMARY KEY ("section_id");



ALTER TABLE ONLY "public"."pickup_zones"
    ADD CONSTRAINT "pickup_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_categories"
    ADD CONSTRAINT "quiz_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_levels"
    ADD CONSTRAINT "quiz_levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_modules"
    ADD CONSTRAINT "quiz_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_rewards"
    ADD CONSTRAINT "quiz_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_composition"
    ADD CONSTRAINT "recipe_composition_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_key_ingredients"
    ADD CONSTRAINT "recipe_key_ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_selection_categories"
    ADD CONSTRAINT "recipe_selection_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_selections"
    ADD CONSTRAINT "recipe_selections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_selections"
    ADD CONSTRAINT "recipe_selections_selection_category_id_recipe_id_key" UNIQUE ("selection_category_id", "recipe_id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."shop_akha"
    ADD CONSTRAINT "shop_akha_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shop_akha"
    ADD CONSTRAINT "shop_akha_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."shop_categories"
    ADD CONSTRAINT "shop_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shop_contacts"
    ADD CONSTRAINT "shop_contacts_pkey" PRIMARY KEY ("shop_name");



ALTER TABLE ONLY "public"."shop_orders"
    ADD CONSTRAINT "shop_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shop_storefront"
    ADD CONSTRAINT "shop_storefront_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_metadata_admin"
    ADD CONSTRAINT "site_metadata_admin_page_slug_key" UNIQUE ("page_slug");



ALTER TABLE ONLY "public"."site_metadata_admin"
    ADD CONSTRAINT "site_metadata_admin_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_metadata_admin_translations"
    ADD CONSTRAINT "site_metadata_admin_translations_page_id_language_key" UNIQUE ("page_id", "language");



ALTER TABLE ONLY "public"."site_metadata_admin_translations"
    ADD CONSTRAINT "site_metadata_admin_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_metadata"
    ADD CONSTRAINT "site_metadata_page_slug_key" UNIQUE ("page_slug");



ALTER TABLE ONLY "public"."site_metadata"
    ADD CONSTRAINT "site_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spiciness_levels"
    ADD CONSTRAINT "spiciness_levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."driver_payments"
    ADD CONSTRAINT "unique_driver_payment" UNIQUE ("driver_id", "run_date", "session_id");



ALTER TABLE ONLY "public"."booking_participants"
    ADD CONSTRAINT "unique_participant_per_booking" UNIQUE ("booking_id", "user_id");



CREATE INDEX "idx_admin_translations_page_lang" ON "public"."site_metadata_admin_translations" USING "btree" ("page_id", "language");



CREATE INDEX "idx_akha_news_category" ON "public"."akha_news" USING "btree" ("category");



CREATE INDEX "idx_akha_news_published" ON "public"."akha_news" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_akha_news_slug" ON "public"."akha_news" USING "btree" ("slug");



CREATE INDEX "idx_bookings_dropoff_driver" ON "public"."bookings" USING "btree" ("dropoff_driver_uid");



CREATE INDEX "idx_bookings_pickup_driver" ON "public"."bookings" USING "btree" ("pickup_driver_uid");



CREATE INDEX "idx_class_sections_assigned" ON "public"."class_sections" USING "gin" ("assigned_classes");



CREATE INDEX "idx_content_categories_active_order" ON "public"."content_categories" USING "btree" ("is_active", "display_order");



CREATE INDEX "idx_cultu<RESEND_API_KEY_RIMOSSA_20260804 - vedi 2026_011_Security_Advisor_Remediation>" ON "public"."culture_sections" USING "btree" ("slug");



CREATE INDEX "idx_dietary_profiles_slug" ON "public"."dietary_profiles" USING "btree" ("slug");



CREATE INDEX "idx_hotels_place_id" ON "public"."hotel_locations" USING "btree" ("google_place_id");



CREATE INDEX "idx_hotels_status" ON "public"."hotel_locations" USING "btree" ("review_status");



CREATE INDEX "idx_key_ingredients_recipe" ON "public"."recipe_key_ingredients" USING "btree" ("recipe_id");



CREATE INDEX "idx_menu_selections_allergies" ON "public"."menu_selections" USING "gin" ("selected_allergies");



CREATE INDEX "idx_profiles_managed_by" ON "public"."profiles" USING "btree" ("managed_by");



CREATE INDEX "idx_recipe_selections_category" ON "public"."recipe_selections" USING "btree" ("selection_category_id");



CREATE INDEX "idx_recipes_category" ON "public"."recipes" USING "btree" ("category");



CREATE INDEX "idx_recipes_is_fixed" ON "public"."recipes" USING "btree" ("is_fixed_dish");



CREATE INDEX "idx_recipes_is_vegan" ON "public"."recipes" USING "btree" ("is_vegan");



CREATE INDEX "idx_recipes_is_vegetarian" ON "public"."recipes" USING "btree" ("is_vegetarian");



CREATE INDEX "idx_rules_lookup" ON "public"."hotel_pickup_rules" USING "btree" ("hotel_id", "day_of_week");



CREATE INDEX "idx_shop_akha_sku" ON "public"."shop_akha" USING "btree" ("sku");



CREATE INDEX "idx_site_metadata_admin_access" ON "public"."site_metadata_admin" USING "btree" ("access_level");



CREATE INDEX "idx_site_metadata_admin_active" ON "public"."site_metadata_admin" USING "btree" ("is_active");



CREATE INDEX "idx_site_metadata_admin_audit" ON "public"."site_metadata_admin" USING "btree" ("last_seo_audit_at");



CREATE INDEX "idx_site_metadata_admin_menu" ON "public"."site_metadata_admin" USING "btree" ("show_in_menu", "menu_order");



CREATE INDEX "idx_site_metadata_admin_parent" ON "public"."site_metadata_admin" USING "btree" ("parent_id");



CREATE OR REPLACE TRIGGER "on_chat_message_inserted" AFTER INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_chat_message"();



CREATE OR REPLACE TRIGGER "on_new_chat_message" AFTER INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."sync_chat_session_activity"();



CREATE OR REPLACE TRIGGER "on_order_created" AFTER INSERT ON "public"."shop_orders" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_stock_on_order"();



CREATE OR REPLACE TRIGGER "protect_booking_ref_update" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."protect_booking_ref"();



CREATE OR REPLACE TRIGGER "send-booking-email" AFTER INSERT ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-booking-confirmation', 'POST', '{"Content-type":"application/json"}', '{"Authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io"}', '1000');



CREATE OR REPLACE TRIGGER "set_booking_ref" BEFORE INSERT ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."generate_booking_ref"();



CREATE OR REPLACE TRIGGER "trg_content_categories_updated_at" BEFORE UPDATE ON "public"."content_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_admin_translations" BEFORE UPDATE ON "public"."site_metadata_admin_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_site_metadata_admin" BEFORE UPDATE ON "public"."site_metadata_admin" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bookings_timestamp" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_timestamp" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_recipes_updated_at" BEFORE UPDATE ON "public"."recipes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_shop_timestamp" BEFORE UPDATE ON "public"."shop_akha" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_user_allergies" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_user_allergies_trigger"();



ALTER TABLE ONLY "public"."akha_news"
    ADD CONSTRAINT "akha_news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audio_assets"
    ADD CONSTRAINT "audio_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."booking_participants"
    ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("internal_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_participants"
    ADD CONSTRAINT "booking_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_dropoff_driver_uid_fkey" FOREIGN KEY ("dropoff_driver_uid") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_guest_user_id_fkey" FOREIGN KEY ("guest_user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_parent_booking_id_fkey" FOREIGN KEY ("parent_booking_id") REFERENCES "public"."bookings"("internal_id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pickup_driver_uid_fkey" FOREIGN KEY ("pickup_driver_uid") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_calendar_overrides"
    ADD CONSTRAINT "class_calendar_overrides_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id");



ALTER TABLE ONLY "public"."content_categories"
    ADD CONSTRAINT "content_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."content_categories"
    ADD CONSTRAINT "content_categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."culture_sections"
    ADD CONSTRAINT "cultu<RESEND_API_KEY_RIMOSSA_20260804 - vedi 2026_011_Security_Advisor_Remediation>" FOREIGN KEY ("category_id") REFERENCES "public"."content_categories"("id");



ALTER TABLE ONLY "public"."dietary_substitutions"
    ADD CONSTRAINT "dietary_substitutions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."dietary_profiles"("id");



ALTER TABLE ONLY "public"."ethnic_groups"
    ADD CONSTRAINT "ethnic_groups_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."culture_sections"("id");



ALTER TABLE ONLY "public"."recipe_composition"
    ADD CONSTRAINT "fk_composition_ingredient" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients_library"("id");



ALTER TABLE ONLY "public"."recipe_composition"
    ADD CONSTRAINT "fk_composition_recipe" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id");



ALTER TABLE ONLY "public"."driver_payments"
    ADD CONSTRAINT "fk_driver" FOREIGN KEY ("driver_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."gallery_items"
    ADD CONSTRAINT "fk_gallery_media" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("asset_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "fk_menu_curry" FOREIGN KEY ("curry_id") REFERENCES "public"."recipes"("id");



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "fk_menu_soup" FOREIGN KEY ("soup_id") REFERENCES "public"."recipes"("id");



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "fk_menu_spiciness" FOREIGN KEY ("spiciness_id") REFERENCES "public"."spiciness_levels"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "fk_menu_stirfry" FOREIGN KEY ("stirfry_id") REFERENCES "public"."recipes"("id");



ALTER TABLE ONLY "public"."shop_akha"
    ADD CONSTRAINT "fk_shop_category" FOREIGN KEY ("category_id") REFERENCES "public"."shop_categories"("id");



ALTER TABLE ONLY "public"."home_cards_translations"
    ADD CONSTRAINT "home_cards_translations_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."home_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hotel_locations"
    ADD CONSTRAINT "hotel_locations_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."hotel_locations"
    ADD CONSTRAINT "hotel_locations_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "public"."pickup_zones"("id");



ALTER TABLE ONLY "public"."hotel_pickup_rules"
    ADD CONSTRAINT "hotel_pickup_rules_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotel_locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ingredients_library"
    ADD CONSTRAINT "ingredients_library_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."content_categories"("id");



ALTER TABLE ONLY "public"."market_runs"
    ADD CONSTRAINT "market_runs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "menu_selections_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("internal_id");



ALTER TABLE ONLY "public"."menu_selections"
    ADD CONSTRAINT "menu_selections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_managed_by_fkey" FOREIGN KEY ("managed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_preferred_spiciness_id_fkey" FOREIGN KEY ("preferred_spiciness_id") REFERENCES "public"."spiciness_levels"("id");



ALTER TABLE ONLY "public"."quiz_levels"
    ADD CONSTRAINT "quiz_levels_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."quiz_categories"("id");



ALTER TABLE ONLY "public"."quiz_modules"
    ADD CONSTRAINT "quiz_modules_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."quiz_levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."quiz_modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_key_ingredients"
    ADD CONSTRAINT "recipe_key_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_selections"
    ADD CONSTRAINT "recipe_selections_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id");



ALTER TABLE ONLY "public"."recipe_selections"
    ADD CONSTRAINT "recipe_selections_selection_category_id_fkey" FOREIGN KEY ("selection_category_id") REFERENCES "public"."recipe_selection_categories"("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_category_fkey" FOREIGN KEY ("category") REFERENCES "public"."content_categories"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shop_orders"
    ADD CONSTRAINT "shop_orders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("internal_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shop_orders"
    ADD CONSTRAINT "shop_orders_sku_fkey" FOREIGN KEY ("sku") REFERENCES "public"."shop_akha"("sku");



ALTER TABLE ONLY "public"."shop_storefront"
    ADD CONSTRAINT "shop_storefront_linked_sku_fkey" FOREIGN KEY ("linked_sku") REFERENCES "public"."shop_akha"("sku");



ALTER TABLE ONLY "public"."site_metadata_admin"
    ADD CONSTRAINT "site_metadata_admin_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."site_metadata_admin"("id");



ALTER TABLE ONLY "public"."site_metadata_admin_translations"
    ADD CONSTRAINT "site_metadata_admin_translations_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."site_metadata_admin"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_metadata_admin"
    ADD CONSTRAINT "site_metadata_admin_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."site_metadata"
    ADD CONSTRAINT "site_metadata_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."site_metadata"("id");



CREATE POLICY "Access messages via session ownership" ON "public"."chat_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."chat_sessions" "s"
  WHERE (("s"."id" = "chat_messages"."session_id") AND (("s"."user_id" = "auth"."uid"()) OR ("s"."user_id" IS NULL))))));



CREATE POLICY "Admin App Metadata Read" ON "public"."site_metadata_admin" FOR SELECT USING (true);



CREATE POLICY "Admin App Metadata Translations Read" ON "public"."site_metadata_admin_translations" FOR SELECT USING (true);



CREATE POLICY "Admin App Metadata Translations Write" ON "public"."site_metadata_admin_translations" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin App Metadata Write" ON "public"."site_metadata_admin" TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admin Full Access" ON "public"."hotel_locations" USING ("public"."is_admin"());



CREATE POLICY "Admin Manage Contacts" ON "public"."shop_contacts" USING ("public"."is_admin"());



CREATE POLICY "Admin Manage Hotels" ON "public"."hotel_locations" TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'manager'::"text", 'logistics'::"text"]))) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'manager'::"text", 'logistics'::"text"])));



CREATE POLICY "Admin Manage News" ON "public"."akha_news" TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'manager'::"text"])));



CREATE POLICY "Admin Manage Rules" ON "public"."hotel_pickup_rules" TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'manager'::"text", 'logistics'::"text"]))) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'manager'::"text", 'logistics'::"text"])));



CREATE POLICY "Admin Manage Tiers" ON "public"."driver_payout_tiers" USING ("public"."is_admin"());



CREATE POLICY "Admin Payment Access" ON "public"."driver_payments" USING ("public"."is_admin"());



CREATE POLICY "Admin Update" ON "public"."bookings" FOR UPDATE USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'manager'::"text"])));



CREATE POLICY "Admin Write" ON "public"."allergy_knowledge" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."class_calendar_overrides" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."class_sessions" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."cooking_classes" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."culture_sections" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."dietary_profiles" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."dietary_substitutions" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."ethnic_groups" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."gallery_items" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."home_cards" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."ingredients_library" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."meeting_points" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."pickup_zones" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."quiz_categories" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."quiz_levels" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."quiz_modules" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."quiz_questions" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."quiz_rewards" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."recipe_composition" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."recipe_key_ingredients" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."recipe_selection_categories" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."recipe_selections" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."recipes" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."shop_categories" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."shop_storefront" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."site_metadata" USING ("public"."is_admin"());



CREATE POLICY "Admin Write" ON "public"."spiciness_levels" USING ("public"."is_admin"());



CREATE POLICY "Admins see all" ON "public"."profiles" FOR SELECT USING (((("auth"."jwt"() ->> 'email'::"text") = 'svevomondino@yahoo.it'::"text") OR ("auth"."uid"() = "id")));



CREATE POLICY "Admins see all selections" ON "public"."menu_selections" FOR SELECT TO "authenticated" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Audio staff delete" ON "public"."audio_assets" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "uploaded_by") OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'manager'::"text"]))));



CREATE POLICY "Audio staff insert" ON "public"."audio_assets" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Audio staff update" ON "public"."audio_assets" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "uploaded_by") OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'manager'::"text"]))));



CREATE POLICY "Authenticated users can delete class sections." ON "public"."class_sections" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert class sections." ON "public"."class_sections" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update class sections." ON "public"."class_sections" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Bookings Edit" ON "public"."bookings" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR ("public"."is_staff"() = true)));



CREATE POLICY "Bookings View" ON "public"."bookings" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("guest_user_id" = "auth"."uid"()) OR ("public"."is_staff"() = true)));



CREATE POLICY "Class sections are viewable by everyone." ON "public"."class_sections" FOR SELECT USING (true);



CREATE POLICY "Driver Read Own" ON "public"."driver_payments" FOR SELECT USING (("auth"."uid"() = "driver_id"));



CREATE POLICY "Driver Update Status" ON "public"."bookings" FOR UPDATE USING ((("auth"."uid"() = "pickup_driver_uid") OR ("auth"."uid"() = "dropoff_driver_uid"))) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'driver'::"text"));



CREATE POLICY "Emergency Profile Read" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable select for all" ON "public"."menu_selections" FOR SELECT USING (true);



CREATE POLICY "Guests can manage their specific anonymous session" ON "public"."chat_sessions" USING ((("user_id" IS NULL) AND ("session_token" IS NOT NULL)));



CREATE POLICY "Manage Participants" ON "public"."booking_participants" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Media assets are viewable by everyone." ON "public"."media_assets" FOR SELECT USING (true);



CREATE POLICY "Media staff delete" ON "public"."media_assets" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "uploaded_by") OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'manager'::"text"]))));



CREATE POLICY "Media staff insert" ON "public"."media_assets" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Media staff update" ON "public"."media_assets" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "uploaded_by") OR (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'manager'::"text"]))));



CREATE POLICY "Menu Manage" ON "public"."menu_selections" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Menu View" ON "public"."menu_selections" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_staff"()));



CREATE POLICY "Profiles Insert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Profiles Update" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR ("public"."is_admin"() = true)));



CREATE POLICY "Profiles View" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR ("public"."is_staff"() = true) OR ("managed_by" = "auth"."uid"())));



CREATE POLICY "Public Read" ON "public"."allergy_knowledge" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."class_calendar_overrides" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."class_sessions" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."cooking_classes" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."culture_sections" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."dietary_profiles" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."dietary_substitutions" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."ethnic_groups" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."gallery_items" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."home_cards" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."ingredients_library" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."meeting_points" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."menu_selections" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."pickup_zones" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."quiz_categories" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."quiz_levels" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."quiz_modules" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."quiz_questions" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."quiz_rewards" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."recipe_composition" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."recipe_key_ingredients" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."recipe_selection_categories" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."recipe_selections" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."recipes" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."shop_akha" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."shop_categories" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."shop_storefront" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."site_metadata" FOR SELECT USING (true);



CREATE POLICY "Public Read" ON "public"."spiciness_levels" FOR SELECT USING (true);



CREATE POLICY "Public Read Access for Home Cards Translations" ON "public"."home_cards_translations" FOR SELECT USING (true);



CREATE POLICY "Public Read Access for Site Metadata Admin Translations" ON "public"."site_metadata_admin_translations" FOR SELECT USING (true);



CREATE POLICY "Public Read Active" ON "public"."hotel_locations" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public Read Hotels" ON "public"."hotel_locations" FOR SELECT USING (true);



CREATE POLICY "Public Read Inventory" ON "public"."shop_akha" FOR SELECT USING (true);



CREATE POLICY "Public Read Menu" ON "public"."menu_selections" FOR SELECT USING (true);



CREATE POLICY "Public Read Rules" ON "public"."hotel_pickup_rules" FOR SELECT USING (true);



CREATE POLICY "Public Read content_categories" ON "public"."content_categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."content_categories" FOR SELECT USING (true);



CREATE POLICY "Public read meeting points" ON "public"."meeting_points" FOR SELECT USING (true);



CREATE POLICY "Public read zones" ON "public"."pickup_zones" FOR SELECT USING (true);



CREATE POLICY "Read News by Access Level" ON "public"."akha_news" FOR SELECT USING ((("is_published" = true) AND (("access_level" = 'public'::"text") OR (("access_level" = 'internal'::"text") AND ("auth"."role"() = 'authenticated'::"text") AND (( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'manager'::"text", 'agency'::"text"]))))));



CREATE POLICY "Staff Full Access" ON "public"."market_runs" USING ("public"."is_staff"());



CREATE POLICY "Staff Full Access" ON "public"."shop_orders" USING ("public"."is_staff"());



CREATE POLICY "Staff Manage Inventory" ON "public"."shop_akha" USING ("public"."is_staff"());



CREATE POLICY "Staff Read Contacts" ON "public"."shop_contacts" FOR SELECT USING ("public"."is_staff"());



CREATE POLICY "Staff Read Tiers" ON "public"."driver_payout_tiers" FOR SELECT USING ("public"."is_staff"());



CREATE POLICY "Staff can insert any booking" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff can manage page sections" ON "public"."page_sections" TO "authenticated" USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Strict session access for messages" ON "public"."chat_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."chat_sessions" "s"
  WHERE (("s"."id" = "chat_messages"."session_id") AND (("s"."user_id" = "auth"."uid"()) OR ("s"."user_id" IS NULL))))));



CREATE POLICY "Svevo Mondino" ON "public"."menu_selections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Svevo Mondino" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "User Create Orders" ON "public"."shop_orders" FOR INSERT WITH CHECK ((("booking_id" IN ( SELECT "bookings"."internal_id"
   FROM "public"."bookings"
  WHERE ("bookings"."user_id" = "auth"."uid"()))) OR "public"."is_staff"()));



CREATE POLICY "User Insert Own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "User Update Own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "User View Own Orders" ON "public"."shop_orders" FOR SELECT USING (("booking_id" IN ( SELECT "bookings"."internal_id"
   FROM "public"."bookings"
  WHERE ("bookings"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users Suggest Hotel" ON "public"."hotel_locations" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("review_status" = 'pending'::"text")));



CREATE POLICY "Users can create their own bookings" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own selections" ON "public"."menu_selections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own selections" ON "public"."menu_selections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their menu" ON "public"."menu_selections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own selections" ON "public"."menu_selections" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own sessions" ON "public"."chat_sessions" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own menu" ON "public"."menu_selections" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can upsert own menu" ON "public"."menu_selections" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own menu" ON "public"."menu_selections" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own selections" ON "public"."menu_selections" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own selections" ON "public"."menu_selections" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users/Guests manage own session via token or ID" ON "public"."chat_sessions" USING ((("auth"."uid"() = "user_id") OR (("user_id" IS NULL) AND ("session_token" IS NOT NULL))));



CREATE POLICY "View Participants" ON "public"."booking_participants" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("booking_id" IN ( SELECT "booking_participants_1"."booking_id"
   FROM "public"."booking_participants" "booking_participants_1"
  WHERE ("booking_participants_1"."user_id" = "auth"."uid"()))) OR "public"."is_staff"()));



ALTER TABLE "public"."akha_news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."allergy_knowledge" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audio_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_calendar_overrides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cooking_classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."culture_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dietary_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dietary_substitutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."driver_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."driver_payout_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ethnic_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."home_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."home_cards_front" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."home_cards_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hotel_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hotel_pickup_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ingredients_library" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."market_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meeting_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."menu_selections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pickup_zones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_audio" ON "public"."audio_assets" FOR SELECT TO "anon" USING (true);



CREATE POLICY "public_read_audio_auth" ON "public"."audio_assets" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "public_read_home_cards_front" ON "public"."home_cards_front" FOR SELECT USING (true);



CREATE POLICY "public_read_media" ON "public"."media_assets" FOR SELECT TO "anon" USING (true);



CREATE POLICY "public_read_media_auth" ON "public"."media_assets" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "public_read_page_sections" ON "public"."page_sections" FOR SELECT TO "anon" USING (true);



CREATE POLICY "public_read_page_sections_auth" ON "public"."page_sections" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."quiz_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_composition" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_key_ingredients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_selection_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_selections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_read_media" ON "public"."media_assets" FOR SELECT USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."shop_akha" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shop_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shop_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shop_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shop_storefront" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_metadata_admin" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_metadata_admin_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spiciness_levels" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."approve_hotel_location"("target_hotel_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_hotel_location"("target_hotel_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_hotel_location"("target_hotel_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_driver_payout"("p_driver_id" "uuid", "p_run_date" "date", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_driver_payout"("p_driver_id" "uuid", "p_run_date" "date", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_driver_payout"("p_driver_id" "uuid", "p_run_date" "date", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_chat_messages"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_chat_messages"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_chat_messages"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrease_stock_on_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_stock_on_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_stock_on_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_booking_ref"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_booking_ref"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_booking_ref"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_weekly_payouts"("p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_weekly_payouts"("p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_weekly_payouts"("p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_calendar_availability"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_calendar_availability"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_calendar_availability"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_chat_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_chat_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_chat_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_stock_inventory"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_stock_inventory"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_stock_inventory"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_recipe_with_ingredients"("p_recipe_id" "text", "p_name" "text", "p_description" "text", "p_is_vegan" boolean, "p_is_vegetarian" boolean, "p_category" "text", "p_image" "text", "p_spiciness" integer, "p_has_peanuts" boolean, "p_has_shellfish" boolean, "p_has_gluten" boolean, "p_has_soy" boolean, "p_color_theme" "text", "p_health_benefits" "text", "p_is_signature" boolean, "p_is_fixed_dish" boolean, "p_key_ingredients" "text"[], "p_thai_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_recipe_with_ingredients"("p_recipe_id" "text", "p_name" "text", "p_description" "text", "p_is_vegan" boolean, "p_is_vegetarian" boolean, "p_category" "text", "p_image" "text", "p_spiciness" integer, "p_has_peanuts" boolean, "p_has_shellfish" boolean, "p_has_gluten" boolean, "p_has_soy" boolean, "p_color_theme" "text", "p_health_benefits" "text", "p_is_signature" boolean, "p_is_fixed_dish" boolean, "p_key_ingredients" "text"[], "p_thai_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_recipe_with_ingredients"("p_recipe_id" "text", "p_name" "text", "p_description" "text", "p_is_vegan" boolean, "p_is_vegetarian" boolean, "p_category" "text", "p_image" "text", "p_spiciness" integer, "p_has_peanuts" boolean, "p_has_shellfish" boolean, "p_has_gluten" boolean, "p_has_soy" boolean, "p_color_theme" "text", "p_health_benefits" "text", "p_is_signature" boolean, "p_is_fixed_dish" boolean, "p_key_ingredients" "text"[], "p_thai_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."join_booking_by_ref"("p_booking_ref" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."join_booking_by_ref"("p_booking_ref" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_booking_by_ref"("p_booking_ref" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_booking_ref"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_booking_ref"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_booking_ref"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reject_hotel_location"("target_hotel_id" "uuid", "reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reject_hotel_location"("target_hotel_id" "uuid", "reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reject_hotel_location"("target_hotel_id" "uuid", "reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_menu_confirmation_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_menu_confirmation_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_menu_confirmation_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_menu_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_menu_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_menu_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."split_booking_pax"("original_booking_id" "uuid", "pax_to_move" integer, "new_hotel_name" "text", "new_pickup_time" time without time zone, "admin_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."split_booking_pax"("original_booking_id" "uuid", "pax_to_move" integer, "new_hotel_name" "text", "new_pickup_time" time without time zone, "admin_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."split_booking_pax"("original_booking_id" "uuid", "pax_to_move" integer, "new_hotel_name" "text", "new_pickup_time" time without time zone, "admin_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."standardize_allergy_value"("allergy" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."standardize_allergy_value"("allergy" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."standardize_allergy_value"("allergy" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_chat_session_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_chat_session_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_chat_session_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_and_standardize_allergies"("user_allergies" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_and_standardize_allergies"("user_allergies" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_and_standardize_allergies"("user_allergies" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_user_allergies_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_user_allergies_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_user_allergies_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";















GRANT ALL ON TABLE "public"."akha_news" TO "anon";
GRANT ALL ON TABLE "public"."akha_news" TO "authenticated";
GRANT ALL ON TABLE "public"."akha_news" TO "service_role";



GRANT ALL ON TABLE "public"."allergy_knowledge" TO "anon";
GRANT ALL ON TABLE "public"."allergy_knowledge" TO "authenticated";
GRANT ALL ON TABLE "public"."allergy_knowledge" TO "service_role";



GRANT ALL ON TABLE "public"."audio_assets" TO "anon";
GRANT ALL ON TABLE "public"."audio_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_assets" TO "service_role";



GRANT ALL ON TABLE "public"."booking_participants" TO "anon";
GRANT ALL ON TABLE "public"."booking_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_participants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."booking_ref_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."booking_ref_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."booking_ref_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."chat_sessions" TO "anon";
GRANT ALL ON TABLE "public"."chat_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."class_calendar_overrides" TO "anon";
GRANT ALL ON TABLE "public"."class_calendar_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."class_calendar_overrides" TO "service_role";



GRANT ALL ON TABLE "public"."class_sections" TO "anon";
GRANT ALL ON TABLE "public"."class_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."class_sections" TO "service_role";



GRANT ALL ON TABLE "public"."class_sessions" TO "anon";
GRANT ALL ON TABLE "public"."class_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."class_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."content_categories" TO "anon";
GRANT ALL ON TABLE "public"."content_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."content_categories" TO "service_role";



GRANT ALL ON TABLE "public"."cooking_classes" TO "anon";
GRANT ALL ON TABLE "public"."cooking_classes" TO "authenticated";
GRANT ALL ON TABLE "public"."cooking_classes" TO "service_role";



GRANT ALL ON TABLE "public"."culture_sections" TO "anon";
GRANT ALL ON TABLE "public"."culture_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."culture_sections" TO "service_role";



GRANT ALL ON TABLE "public"."dietary_profiles" TO "anon";
GRANT ALL ON TABLE "public"."dietary_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."dietary_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."dietary_substitutions" TO "anon";
GRANT ALL ON TABLE "public"."dietary_substitutions" TO "authenticated";
GRANT ALL ON TABLE "public"."dietary_substitutions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dietary_substitutions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dietary_substitutions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dietary_substitutions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."driver_payments" TO "anon";
GRANT ALL ON TABLE "public"."driver_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."driver_payments" TO "service_role";



GRANT ALL ON TABLE "public"."driver_payout_tiers" TO "anon";
GRANT ALL ON TABLE "public"."driver_payout_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."driver_payout_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."ethnic_groups" TO "anon";
GRANT ALL ON TABLE "public"."ethnic_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."ethnic_groups" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ethnic_groups_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ethnic_groups_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ethnic_groups_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_items" TO "anon";
GRANT ALL ON TABLE "public"."gallery_items" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_items" TO "service_role";



GRANT ALL ON TABLE "public"."home_cards" TO "anon";
GRANT ALL ON TABLE "public"."home_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."home_cards" TO "service_role";



GRANT ALL ON TABLE "public"."home_cards_front" TO "anon";
GRANT ALL ON TABLE "public"."home_cards_front" TO "authenticated";
GRANT ALL ON TABLE "public"."home_cards_front" TO "service_role";



GRANT ALL ON SEQUENCE "public"."home_cards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."home_cards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."home_cards_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."home_cards_translations" TO "anon";
GRANT ALL ON TABLE "public"."home_cards_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."home_cards_translations" TO "service_role";



GRANT ALL ON TABLE "public"."hotel_locations" TO "anon";
GRANT ALL ON TABLE "public"."hotel_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."hotel_locations" TO "service_role";



GRANT ALL ON TABLE "public"."hotel_pickup_rules" TO "anon";
GRANT ALL ON TABLE "public"."hotel_pickup_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."hotel_pickup_rules" TO "service_role";



GRANT ALL ON TABLE "public"."ingredients_library" TO "anon";
GRANT ALL ON TABLE "public"."ingredients_library" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredients_library" TO "service_role";



GRANT ALL ON TABLE "public"."market_runs" TO "anon";
GRANT ALL ON TABLE "public"."market_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."market_runs" TO "service_role";



GRANT ALL ON TABLE "public"."media_assets" TO "anon";
GRANT ALL ON TABLE "public"."media_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."media_assets" TO "service_role";



GRANT ALL ON TABLE "public"."meeting_points" TO "anon";
GRANT ALL ON TABLE "public"."meeting_points" TO "authenticated";
GRANT ALL ON TABLE "public"."meeting_points" TO "service_role";



GRANT ALL ON TABLE "public"."menu_selections" TO "anon";
GRANT ALL ON TABLE "public"."menu_selections" TO "authenticated";
GRANT ALL ON TABLE "public"."menu_selections" TO "service_role";



GRANT ALL ON TABLE "public"."page_sections" TO "anon";
GRANT ALL ON TABLE "public"."page_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."page_sections" TO "service_role";



GRANT ALL ON TABLE "public"."pickup_zones" TO "anon";
GRANT ALL ON TABLE "public"."pickup_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."pickup_zones" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_categories" TO "anon";
GRANT ALL ON TABLE "public"."quiz_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_categories" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_levels" TO "anon";
GRANT ALL ON TABLE "public"."quiz_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_levels" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quiz_levels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quiz_levels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quiz_levels_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_modules" TO "anon";
GRANT ALL ON TABLE "public"."quiz_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_modules" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_rewards" TO "anon";
GRANT ALL ON TABLE "public"."quiz_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_rewards" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quiz_rewards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quiz_rewards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quiz_rewards_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_composition" TO "anon";
GRANT ALL ON TABLE "public"."recipe_composition" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_composition" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_key_ingredients" TO "anon";
GRANT ALL ON TABLE "public"."recipe_key_ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_key_ingredients" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recipe_key_ingredients_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recipe_key_ingredients_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recipe_key_ingredients_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_selection_categories" TO "anon";
GRANT ALL ON TABLE "public"."recipe_selection_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_selection_categories" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_selections" TO "anon";
GRANT ALL ON TABLE "public"."recipe_selections" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_selections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recipe_selections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recipe_selections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recipe_selections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recipes" TO "anon";
GRANT ALL ON TABLE "public"."recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipes" TO "service_role";



GRANT ALL ON TABLE "public"."shop_akha" TO "anon";
GRANT ALL ON TABLE "public"."shop_akha" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_akha" TO "service_role";



GRANT ALL ON TABLE "public"."shop_categories" TO "anon";
GRANT ALL ON TABLE "public"."shop_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_categories" TO "service_role";



GRANT ALL ON TABLE "public"."shop_contacts" TO "anon";
GRANT ALL ON TABLE "public"."shop_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."shop_orders" TO "anon";
GRANT ALL ON TABLE "public"."shop_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_orders" TO "service_role";



GRANT ALL ON TABLE "public"."shop_storefront" TO "anon";
GRANT ALL ON TABLE "public"."shop_storefront" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_storefront" TO "service_role";



GRANT ALL ON TABLE "public"."site_metadata" TO "anon";
GRANT ALL ON TABLE "public"."site_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."site_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."site_metadata_admin" TO "anon";
GRANT ALL ON TABLE "public"."site_metadata_admin" TO "authenticated";
GRANT ALL ON TABLE "public"."site_metadata_admin" TO "service_role";



GRANT ALL ON TABLE "public"."site_metadata_admin_translations" TO "anon";
GRANT ALL ON TABLE "public"."site_metadata_admin_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."site_metadata_admin_translations" TO "service_role";



GRANT ALL ON TABLE "public"."spiciness_levels" TO "anon";
GRANT ALL ON TABLE "public"."spiciness_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."spiciness_levels" TO "service_role";



GRANT ALL ON TABLE "public"."view_shop_products" TO "anon";
GRANT ALL ON TABLE "public"."view_shop_products" TO "authenticated";
GRANT ALL ON TABLE "public"."view_shop_products" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































