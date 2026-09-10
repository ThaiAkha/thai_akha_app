-- ─────────────────────────────────────────────────────────────────────────────
-- Dividere un gruppo: solo il suo, o lo staff.
--
-- `split_booking_pax` crea una prenotazione FIGLIA con un nuovo hotel e un nuovo
-- orario, riducendo le persone del padre. E' il meccanismo con cui un gruppo si
-- separa per farsi prendere in due posti diversi.
--
-- ── COM'ERA ──────────────────────────────────────────────────────────────────
-- **Nessun controllo. Ne' di ruolo, ne' di proprieta'.** SECURITY DEFINER, concessa
-- a `authenticated`, riceve l'identificativo della prenotazione come parametro e
-- non verifica che sia tua. Quindi un utente registrato qualsiasi poteva dividere
-- la prenotazione di uno sconosciuto, togliergli persone e creare una figlia
-- intestata a lui. Le altre quattro funzioni della stessa famiglia
-- (`split_booking_participants`, `split_booking_seats`, `split_booking_pax_payment`,
-- `merge_split_child`) chiedono tutte `is_staff()`: questa era l'unica scoperta.
--
-- E il parametro `admin_user_id` **non veniva mai usato nel corpo**: dava
-- l'impressione che si registrasse chi stava agendo, e non si registrava niente.
-- Un'apparenza di responsabilita' e' peggio della sua assenza dichiarata.
--
-- ── PERCHE' NON BASTA `is_staff()` ───────────────────────────────────────────
-- Decisione del proprietario del 2026-09-10: **ospite, agenzia e manager possono
-- tutti dividere un gruppo**. Quindi la regola non e' "solo lo staff": e'
-- **"solo sulla TUA prenotazione, e lo staff su tutte"**.
-- Per l'agenzia funziona senza aggiungere niente: tutte le sue prenotazioni sono
-- intestate al suo stesso profilo (39 su 39, verificato), quindi passa dalla stessa
-- porta dell'ospite.
--
-- ── COSA NON CAMBIA, E PERCHE' ───────────────────────────────────────────────
-- La firma resta identica, `admin_user_id` compreso: nessun codice la chiama oggi
-- (verificato in packages/, scripts/, supabase/), ma cambiarla senza bisogno
-- vorrebbe dire un drop+create che non serve a niente. Il parametro resta e il
-- commento dice che e' ignorato, cosi' chi lo legge non ci conta sopra.
--
-- Restano fuori, e vanno decisi a parte: la figlia eredita solo meta' prenotazione
-- (le 3 figlie vere hanno **zona vuota e prezzo zero**, e niente della riconsegna),
-- e non esiste uno split a forma di RICONSEGNA. Sono difetti di modello, non di
-- permessi, e toccarli qui avrebbe mescolato due lavori.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.split_booking_pax(
  original_booking_id uuid,
  pax_to_move integer,
  new_hotel_name text,
  new_pickup_time time without time zone,
  admin_user_id uuid
)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
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

    IF original_booking.internal_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Booking not found');
    END IF;

    -- 1b. Chi sta chiamando puo' dividere QUESTA prenotazione?
    --     Lo staff puo' su tutte; chiunque altro solo sulla propria. Aggiunto il
    --     2026-09-10: prima non c'era nessun controllo e si poteva dividere la
    --     prenotazione di uno sconosciuto.
    IF NOT public.is_staff()
       AND original_booking.user_id IS DISTINCT FROM auth.uid() THEN
        RETURN json_build_object('success', false, 'error', 'forbidden');
    END IF;

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
        pax_to_move,
        new_hotel_name,
        new_pickup_time,
        original_booking.payment_method,
        original_booking.payment_status,
        new_ref,
        original_booking.internal_id,
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
$function$;

comment on function public.split_booking_pax(uuid, integer, text, time without time zone, uuid) is
  'Divide un gruppo creando una prenotazione figlia con hotel e orario propri. Dal 2026-09-10 chiede il permesso: lo staff su tutte, chiunque altro SOLO sulla propria (user_id = auth.uid()) - l''agenzia passa di qui perche'' le sue prenotazioni sono intestate a lei. ATTENZIONE: il parametro admin_user_id NON viene usato, non registra chi agisce; resta solo per non cambiare la firma. La figlia eredita solo parte della prenotazione (niente zona, prezzo, coordinate, riconsegna): difetto noto, da decidere a parte.';
