-- 20260909160000_join_booking_identita_dal_db.sql
-- /database · 2026-09-09 · A3 dell'audit, su GO owner.
--
-- IL DIFETTO. `join_booking_by_ref(p_booking_ref text, p_user_id uuid)` e' SECURITY DEFINER, ha
-- EXECUTE concesso a PUBLIC e ad `anon`, e **si fida dell'identita' che le viene passata**: non
-- confronta mai `p_user_id` con `auth.uid()`. Inserisce in `booking_participants` l'utente che le
-- viene detto, sulla prenotazione che le viene detta.
-- I riferimenti sono `TAK#####`, strettamente sequenziali (TAK00103, TAK00104, ...): enumerabili.
-- E il messaggio di ritorno distingue un riferimento esistente da uno inesistente, quindi la
-- funzione e' anche un oracolo che dice quali prenotazioni esistono.
-- Prova eseguita dall'audit: `set local role anon; select join_booking_by_ref('ZZ-NONEXISTENT', ...)`
-- ha risposto normalmente, cioe' il corpo gira davvero con il ruolo anonimo.
--
-- PORTATA REALE, misurata e non supposta: la policy SELECT di `bookings` NON si fida della
-- partecipazione (`bookings_select_scoped` guarda user_id, guest_user_id e ruolo staff), quindi
-- **i dati dell'ospite non escono**. Cio' che si otteneva era scrittura non autenticata in
-- `booking_participants` ed enumerazione. Diventerebbe una fuga il giorno in cui qualcuno
-- aggiungesse `is_booking_participant(...)` alla SELECT di bookings: schema gia' in uso sulla
-- policy "View Participants" della tabella partecipanti.
--
-- LA CURA, compatibile col bundle gia' in produzione: la FIRMA resta identica, perche'
-- `group.service.ts:33` chiama la RPC passando `p_user_id` preso da `supabase.auth.getUser()`,
-- cioe' esattamente il proprio uid. Dentro, l'identita' la decide il database: si pretende un
-- utente autenticato e si pretende che il parametro coincida. Piu' la revoca ad anon e PUBLIC.
--
-- RESTA APERTO, e va detto: con `authenticated` la funzione resta un oracolo di esistenza per chi
-- ha un account (crea un account, prova i riferimenti). Chiuderlo del tutto vuole un limite di
-- frequenza, che e' il punto A4 della lista e va progettato insieme a quello del form contatti.

create or replace function public.join_booking_by_ref(p_booking_ref text, p_user_id uuid)
returns json language plpgsql security definer set search_path to 'public' as $function$
declare
    v_booking_id uuid;
    v_current_pax int;
    v_max_pax int;
    v_uid uuid := auth.uid();
begin
    -- L'identita' la decide il DB, non il chiamante (2026-09-09).
    if v_uid is null then
        raise exception 'join_booking_by_ref: serve un utente autenticato.' using errcode = '42501';
    end if;
    if p_user_id is distinct from v_uid then
        raise exception 'join_booking_by_ref: si puo'' aggiungere solo se stessi a un gruppo.' using errcode = '42501';
    end if;

    select internal_id, pax_count into v_booking_id, v_max_pax
    from bookings
    where booking_ref = p_booking_ref
      and status in ('confirmed', 'pending');

    if v_booking_id is null then
        return json_build_object('success', false, 'message', 'Booking reference not found or invalid.');
    end if;

    select count(*) into v_current_pax from booking_participants where booking_id = v_booking_id;

    insert into booking_participants (booking_id, user_id, is_leader)
    values (v_booking_id, v_uid, false)
    on conflict (booking_id, user_id) do nothing;

    return json_build_object('success', true, 'booking_id', v_booking_id);
end;
$function$;

comment on function public.join_booking_by_ref is
  'Unisce CHI CHIAMA (auth.uid()) al gruppo di una prenotazione dato il suo riferimento. Il parametro p_user_id resta nella firma per compatibilita'' col bundle deployato, ma deve coincidere con auth.uid(): fino al 2026-09-09 non era controllato e la funzione era eseguibile da anon, quindi chiunque poteva aggiungere un utente arbitrario a una prenotazione arbitraria enumerando i riferimenti TAK#####.';

revoke execute on function public.join_booking_by_ref(text, uuid) from public, anon;
grant execute on function public.join_booking_by_ref(text, uuid) to authenticated, service_role;

-- VERIFICA DOPO (attesi):
-- set local role anon; select public.join_booking_by_ref('TAK00103', '<uuid>');  -> ERROR 42501 permission denied
-- cliente autenticato che passa il PROPRIO uid                                   -> funziona come prima
-- cliente autenticato che passa l'uid di un ALTRO                                -> ERROR 42501
-- select grantee from information_schema.role_routine_grants where routine_name='join_booking_by_ref';
--   -> postgres, authenticated, service_role (niente anon, niente PUBLIC)
