-- ─────────────────────────────────────────────────────────────────────────────
-- Lo stato del trasporto smette di essere una colonna sola per due gambe.
--
-- `transport_status` ha UNA catena per DUE viaggi:
--     waiting -> driver_en_route -> driver_arrived -> on_board -> dropped_off
-- Quindi `dropped_off` significa due cose diverse - la mattina "consegnato in
-- cucina", la sera "riportato a casa" - e la distinzione **non e' nel database**:
-- vive in una variabile del browser dell'autista (`useDriverRoute.ts:19`), che la
-- indovina guardando gli stati. Quell'indovinello ha una zona cieca precisa:
-- `dropped_off` non compare in nessuna delle sue due condizioni, quindi quando lo
-- incontra smette semplicemente di decidere.
--
-- CONSEGUENZA CHE BLOCCA IL LAVORO: il congelamento voluto dal proprietario e'
-- **per gamba e per fermata**. Non e' scrivibile finche' il database non sa quale
-- gamba e' arrivata dove.
--
-- ── PERCHE' DUE COLONNE E NON UNA TABELLA DI FERMATE ─────────────────────────
-- Perche' la riga di `bookings` ha **gia' la forma per gamba ovunque tranne che
-- nello stato**: 14 colonne sono gia' divise (i due autisti, le due sequenze, le
-- due coppie di coordinate, le due zone, i due punti d'incontro, i due orari
-- reali). E il planner lo sa gia': salvando scrive due payload diversi a seconda
-- della modalita' (`ManagerLogistic.tsx:105-114`).
-- Una tabella di fermate introdurrebbe una SECONDA forma mentre la prima resta al
-- suo posto: quelle 14 colonne non si spostano senza riscrivere quattro punti di
-- salvataggio e la RPC `driver_route` intera. E se restano, la tabella e' una
-- quarta copia della stessa verita'.
-- Cosa si perde, detto onestamente: **nessuna delle due forme da' la storia**. Chi
-- un giorno vorra' "l'autista e' arrivato alle 8:42, l'ospite non c'era, e' tornato
-- alle 8:55" vorra' un registro append-only, che e' una terza cosa e non c'entra
-- con questa scelta.
--
-- ── LE DUE CATENE NON SONO SIMMETRICHE, E FORZARLE LO SAREBBE ────────────────
-- `pickup_status` tiene i cinque passi. `dropoff_status` ne vuole **tre**:
--     waiting -> on_board -> dropped_off
-- "In viaggio verso di te" al RITORNO non esiste: l'ospite e' gia' sul furgone, e
-- "il furgone parte" e "sei a bordo" sono lo stesso istante. Non e' una
-- semplificazione teorica - e' quello che l'app fa gia': in fase di riconsegna
-- `handleStartRoute` NON scrive nel database, mette un booleano nel browser
-- (`useDriverRoute.ts:287-294`). E combacia col flusso dettato dal proprietario:
-- si parte con tutti a bordo insieme, poi ogni fermata si conferma, e l'ultima
-- chiude la corsa.
--
-- ── I VALORI DEL RITIRO RESTANO GLI STESSI, E LO DICO PERCHE' E' UN COMPROMESSO ─
-- `pickup_status` usa gli stessi cinque letterali di oggi. Cosi' la conversione e'
-- una copia e il codice dell'autista non cambia una riga per leggerla.
-- Il costo: `pickup_status = 'dropped_off'` si legge male. Non e' ambiguo - a
-- disambiguare e' il NOME DELLA COLONNA, che e' il punto di tutta questa migration -
-- ma resta brutto. Rinominarlo (`delivered`, e via il prefisso `driver_`) costa tre
-- punti nel codice admin e si puo' fare quando quei file si toccano comunque.
--
-- ── LA CONVERSIONE E' UNA DECISIONE, NON UNA DERIVAZIONE ─────────────────────
-- `pickup_status` = copia di `transport_status`: quella catena e' nata per il
-- ritiro e i suoi valori sono di ritiro.
-- `dropoff_status` = `waiting` per TUTTI, e non e' pigrizia: **nessuna prenotazione
-- ha mai registrato un orario reale di riconsegna** (zero su 66), quindi nessuno e'
-- mai stato riportato a casa. Le 2 righe `dropped_off` non fanno eccezione: hanno
-- `actual_dropoff_time` NULL mentre `driver_update_pickup` timbra SEMPRE quel campo
-- quando scrive quello stato - quindi non vengono dal flusso dell'autista, sono
-- valori messi a mano, e non portano l'informazione di quale gamba fossero.
-- Metterle su "riportato" sarebbe inventare un viaggio che non risulta avvenuto.
--
-- ── LE COLONNE NUOVE NASCONO PROTETTE, NELLA STESSA MIGRATION ────────────────
-- La policy `Bookings Edit` e' `USING (user_id = auth.uid() OR is_admin())` senza
-- `WITH CHECK`, e il GRANT e' sull'intera tabella: **non esistono permessi per
-- colonna**. Una colonna nuova nasce scrivibile dal cliente. `transport_status` e'
-- fra le protette dal 09/09 proprio per questo: le due nuove ci entrano subito,
-- non "dopo", o esiste una finestra in cui un ospite puo' dichiararsi riportato a
-- casa.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.bookings
  add column if not exists pickup_status  text,
  add column if not exists dropoff_status text;

update public.bookings
   set pickup_status  = coalesce(pickup_status, transport_status, 'waiting'),
       dropoff_status = coalesce(dropoff_status, 'waiting');

alter table public.bookings
  add constraint bookings_pickup_status_chk
    check (pickup_status is null or pickup_status in
           ('waiting','driver_en_route','driver_arrived','on_board','dropped_off')),
  add constraint bookings_dropoff_status_chk
    check (dropoff_status is null or dropoff_status in
           ('waiting','on_board','dropped_off'));

comment on column public.bookings.pickup_status is
  'Stato della gamba di RITIRO: waiting -> driver_en_route -> driver_arrived -> on_board -> dropped_off. Sostituisce la lettura di transport_status, che teneva le due gambe in una catena sola. Scrivibile solo da staff o servizio.';
comment on column public.bookings.dropoff_status is
  'Stato della gamba di RICONSEGNA: waiting -> on_board -> dropped_off. Tre valori e non cinque: "in viaggio verso di te" al ritorno non esiste, l''ospite e'' gia'' sul furgone. La corsa di ritorno parte con tutti a bordo insieme, poi ogni fermata si conferma. Scrivibile solo da staff o servizio.';
comment on column public.bookings.transport_status is
  'VECCHIA colonna a catena unica per due gambe: dal 2026-09-10 la verita'' sta in pickup_status e dropoff_status. Resta finche'' i lettori non sono spostati (8 file + 3 funzioni). NON aggiungere lettori nuovi.';

-- Le due colonne nuove entrano fra le protette, nella stessa migration che le crea.
create or replace function public.protect_booking_ref()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  -- Denaro, stato, capienza, proprietario, e l'organizzazione del trasporto.
  -- `booking_ref` resta protetto per TUTTI, staff compreso, come dal 2026.
  v_protette text[] := array[
    'status','payment_status','total_price','pax_count','visitor_count',
    'commission_amount','applied_commission_rate','payment_method',
    'booking_date','session_type','session_id','user_id','guest_user_id',
    'booking_source','reservation_id_agency','zoho_invoice_id','pos_tender','pos_saved_at',
    'pickup_driver_uid','dropoff_driver_uid','route_order','dropoff_sequence','transport_status',
    'pickup_status','dropoff_status'
  ];
  v_col text;
begin
  if old.booking_ref is distinct from new.booking_ref then
    raise exception 'Il Booking Reference (TAK ID) non puo'' essere modificato.';
  end if;

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

do $$
declare n int;
begin
  select count(*) into n from public.bookings
   where pickup_status is null or dropoff_status is null;
  if n <> 0 then raise exception '% righe senza i nuovi stati', n; end if;
end $$;
