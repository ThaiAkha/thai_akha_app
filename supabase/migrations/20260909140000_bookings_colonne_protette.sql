-- 20260909140000_bookings_colonne_protette.sql
-- /database · 2026-09-09 · STATO: PROPOSTA, non applicata. Su GO:
-- `supabase db query --linked -f <file>` + `migration repair --status applied 20260909140000`.
--
-- IL BUCO (verificato sul database vivo il 09/09, non dedotto)
-- Le due policy UPDATE su `bookings` hanno **WITH CHECK assente**:
--   Bookings Edit  USING ((user_id = auth.uid()) OR is_admin())   WITH CHECK -> assente
--   Admin Update   USING (ruolo in admin,manager)                 WITH CHECK -> assente
-- Quando manca il WITH CHECK, Postgres riusa la USING, che dice CHI possiede la riga e non
-- QUALI colonne cambiano. In parallelo il ruolo `authenticated` ha il permesso di UPDATE su
-- `status`, `payment_status`, `total_price`, `pax_count`, `commission_amount`,
-- `applied_commission_rate`, `booking_date`, `session_type`, `user_id`. E nessuno dei 6 trigger
-- esistenti protegge quelle colonne: `protect_booking_ref` copre il solo `booking_ref`.
-- Non c'e' nemmeno un CHECK su `payment_status`, quindi ci si puo' scrivere qualunque cosa.
--
-- Conseguenza: chi ha un account e una prenotazione a suo nome puo' chiamare l'API REST con la
-- chiave anon (che sta nel bundle del browser per disegno) e portarsi `payment_status` a 'paid',
-- `status` a 'confirmed', `total_price` a 0. Tutte e 48 le prenotazioni hanno un `user_id`.
-- Oggi il danno e' teorico (prenotazione online in pausa dal 10/08, 44 righe su 48 inserite dallo
-- staff), ma **diventa esigibile il giorno esatto in cui si riapre il flusso B2C**.
--
-- PERCHE' NON I PERMESSI PER COLONNA. La cura ovvia sarebbe revocare l'UPDATE su quelle colonne
-- ad `authenticated`. Non si puo': in Supabase **anche admin e manager sono `authenticated`**, e
-- una revoca per colonna spegnerebbe il pannello che quelle colonne le deve scrivere.
--
-- PERCHE' NON UN WITH CHECK. Una policy non puo' confrontare la riga VECCHIA con la NUOVA: puo'
-- solo giudicare la nuova. "Non cambiare questa colonna" non e' esprimibile li'.
--
-- QUINDI: un trigger BEFORE UPDATE, che e' il pattern **gia' in uso su questa tabella**
-- (`protect_booking_ref`), esteso alle colonne che valgono soldi e stato. Lo staff passa, il
-- cliente no. Il servizio (`service_role`, usato dalle edge function) passa: la RLS non lo
-- riguarda e `auth.uid()` e' nullo, quindi il guardiano lo lascia lavorare.

create or replace function public.protect_booking_ref()
returns trigger language plpgsql set search_path to 'public' as $function$
declare
  -- Colonne che un cliente non puo' toccare: denaro, stato, capienza, proprietario.
  -- `booking_ref` resta protetto per TUTTI, staff compreso, come dal 2026 (regola storica).
  v_protette text[] := array[
    'status','payment_status','total_price','pax_count','visitor_count',
    'commission_amount','applied_commission_rate','payment_method',
    'booking_date','session_type','session_id','user_id','guest_user_id',
    'booking_source','reservation_id_agency','zoho_invoice_id','pos_tender','pos_saved_at'
  ];
  v_col text;
begin
  -- 1. Il riferimento non lo cambia nessuno, mai. Regola preesistente, invariata.
  if old.booking_ref is distinct from new.booking_ref then
    raise exception 'Il Booking Reference (TAK ID) non puo'' essere modificato.';
  end if;

  -- 2. Le colonne di denaro e stato le cambia solo lo staff o il servizio.
  --    auth.uid() nullo = chiamata di servizio (edge function con service_role, cron, migration):
  --    li' il guardiano non deve intromettersi, il controllo e' altrove.
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

comment on function public.protect_booking_ref is
  'Guardiano BEFORE UPDATE di bookings. (1) booking_ref immutabile per tutti. (2) denaro, stato, capienza e proprietario modificabili solo da staff o dal service_role: le policy UPDATE non hanno WITH CHECK e la USING giudica CHI possiede la riga, non QUALI colonne cambiano, quindi senza questo guardiano un cliente poteva marcare pagata la propria prenotazione. Le colonne che il cliente cambia davvero dal sito (indirizzo di pickup, zona, punto d''incontro, orario, note) restano libere. 2026-09-09.';

-- VERIFICA DOPO L'APPLICAZIONE (attesi):
-- 1. Lo staff continua a lavorare: dal pannello, cambiare lo stato di una prenotazione -> riesce.
-- 2. Il cliente e' fermato. Prova in transazione ANNULLATA, impersonando un utente vero:
--    begin;
--      set local role authenticated;
--      set local request.jwt.claims to '{"sub":"<user_id di una prenotazione>","role":"authenticated"}';
--      update public.bookings set payment_status = 'paid' where user_id = '<lo stesso>';
--      -- atteso: ERROR 42501 'La colonna "payment_status" ... solo lo staff'
--    rollback;
-- 3. Il sito continua a salvare il pickup (nessuna colonna protetta nel suo payload, verificato
--    su PickUpPage.tsx: hotel_name, pickup_zone, meeting_point, pickup_lat/lng, pickup_time,
--    requires_dropoff, dropoff_*, customer_note).
-- 4. Le edge function continuano a scrivere (service_role, auth.uid() nullo).
-- 5. salute A-F -> 0.
--
-- NON FA, e resta aperto: manca un CHECK sui valori ammessi di `payment_status` (oggi ci si puo'
-- scrivere qualunque stringa). Va aggiunto guardando i valori usati dal codice, non indovinandoli.
