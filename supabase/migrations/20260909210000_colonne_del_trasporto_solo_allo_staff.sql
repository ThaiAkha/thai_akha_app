-- ─────────────────────────────────────────────────────────────────────────────
-- Il cliente non decide chi lo viene a prendere.
--
-- `protect_booking_ref()` protegge 18 colonne - denaro, stato, capienza,
-- proprietario - e le lascia cambiare solo a staff o servizio. Il commento della
-- funzione dichiara deliberatamente libere «indirizzo di pickup, zona, punto
-- d'incontro, orario, note», e ha ragione: sono cose che il cliente sceglie.
--
-- Ma nella lista non ci sono le colonne del TRASPORTO, e quelle non sono ne' un
-- luogo ne' una nota: sono l'organizzazione della giornata di qualcun altro.
-- Verificato oggi sul database vivo: `pickup_driver_uid` NON e' fra le 18.
--
-- Cosa si puo' fare oggi, e non e' teorico. La policy di scrittura e'
-- `USING (user_id = auth.uid() or is_admin())` senza `WITH CHECK`, e il GRANT e'
-- sull'intera tabella: non ci sono permessi per colonna. Quindi un cliente con un
-- account, la chiave pubblica che sta nel bundle del sito e la propria
-- prenotazione puo' chiamare l'API REST e fare:
--
--     update bookings set pickup_driver_uid = null where user_id = <se stesso>;
--
-- La riga sparisce dalla rotta dell'autista la mattina della classe e ricompare
-- nel planner fra le "da assegnare", senza che nessuno abbia toccato niente.
-- Puo' anche scriverci l'uuid di un altro profilo qualsiasi: la foreign key
-- punta a `profiles(id)` e non guarda il ruolo. Stessa storia per l'ordine di
-- rotta e per lo stato della fermata: un cliente puo' dichiararsi "sceso".
--
-- ── PERCHE' QUESTE CINQUE E NON ALTRE ────────────────────────────────────────
-- Sono le colonne che descrivono il SERVIZIO, non la volonta' del cliente:
--   pickup_driver_uid, dropoff_driver_uid  chi guida
--   route_order, dropoff_sequence          in che ordine
--   transport_status                       a che punto e' il giro
-- Restano fuori, di proposito e come prima, hotel/zona/punto/orario/note: quelle
-- il cliente le cambia, ed e' giusto cosi'.
--
-- ── PERCHE' NON ROMPE NIENTE, VERIFICATO PRIMA DI SCRIVERLA ──────────────────
-- 1. Il trigger e' `protect_booking_ref_update`, BEFORE **UPDATE** soltanto. La
--    sola scrittura di `pickup_driver_uid` dal sito e' un INSERT
--    (`useBookingSubmit.ts:76`), che non passa di qui.
-- 2. `is_staff()` comprende 'driver'. L'autista che dal telefono aggiorna
--    `transport_status` continua a passare, come oggi.
-- 3. Il planner e la console admin scrivono da manager o admin: coperti da
--    `is_admin()` e `is_staff()`.
-- 4. `auth.uid()` nullo (edge, cron, migration) non entra nemmeno nel controllo.
-- Nessun percorso legittimo deployato scrive queste colonne come cliente: la
-- regola del progetto - un vincolo si applica solo dopo il deploy del codice che
-- scrive - qui e' soddisfatta perche' il codice che scrive e' gia' staff-only.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.protect_booking_ref()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  -- Colonne che un cliente non puo' toccare: denaro, stato, capienza, proprietario,
  -- e l'organizzazione del trasporto (le ultime cinque, aggiunte il 2026-09-09).
  -- `booking_ref` resta protetto per TUTTI, staff compreso, come dal 2026.
  v_protette text[] := array[
    'status','payment_status','total_price','pax_count','visitor_count',
    'commission_amount','applied_commission_rate','payment_method',
    'booking_date','session_type','session_id','user_id','guest_user_id',
    'booking_source','reservation_id_agency','zoho_invoice_id','pos_tender','pos_saved_at',
    'pickup_driver_uid','dropoff_driver_uid','route_order','dropoff_sequence','transport_status'
  ];
  v_col text;
begin
  -- 1. Il riferimento non lo cambia nessuno, mai. Regola preesistente, invariata.
  if old.booking_ref is distinct from new.booking_ref then
    raise exception 'Il Booking Reference (TAK ID) non puo'' essere modificato.';
  end if;

  -- 2. Le colonne di denaro, stato e trasporto le cambia solo lo staff o il servizio.
  --    auth.uid() nullo = chiamata di servizio (edge function con service_role, cron,
  --    migration): li' il guardiano non deve intromettersi, il controllo e' altrove.
  if auth.uid() is not null and not public.is_admin() and not public.is_staff() then
    foreach v_col in array v_protette loop
      if to_jsonb(new) -> v_col is distinct from to_jsonb(old) -> v_col then
        raise exception
          'La colonna "%" di una prenotazione la puo'' cambiare solo lo staff.', v_col
          using errcode = '42501';
      end if;
    end loop;
  end if;

  return new;
end;
$function$;

comment on function public.protect_booking_ref() is
  'Guardiano BEFORE UPDATE su bookings: booking_ref immutabile per tutti; denaro, stato, proprietario e organizzazione del trasporto (autisti, ordine di rotta, stato della fermata) solo a staff o servizio. Luogo di ritiro, zona, punto d''incontro, orario e note restano liberi: quelli il cliente li sceglie.';
