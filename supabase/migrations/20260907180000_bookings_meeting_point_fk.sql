-- 20260907180000_bookings_meeting_point_fk.sql
-- /database · 2026-09-07 · dal riesame del pickup. STATO: PROPOSTA. ⛔ NON APPLICARE PRIMA DEL DEPLOY.
--
-- PRECONDIZIONE (verificata il 07/09, grep sugli scrittori di meeting_point): si applica SOLO
-- dopo che sono in produzione queste correzioni di codice. Stato al 07/09 sera: TUTTE fatte sul
-- branch perf/data-flow-cleanup (commit dfa50b5 e 1714430 admin, aeb1383 front), NON pushate:
-- il gate e' "main deployato con questi commit", e lo dice l'altra chat a /database.
--   - admin packages/admin/src/hooks/useManagerLogistic.ts ~riga 237: scrive
--     `meeting_point: meetingPointName` (il NOME) -> deve scrivere l'ID di meeting_points;
--   - admin packages/admin/src/components/manager/logistic/LogisticInspector.tsx ~riga 154:
--     `meeting_point: ''` e' un sentinello di SOLA interfaccia ("punto non ancora scelto", mostra
--     la select) e al salvataggio diventa null: non arriva al DB (verificato dall'altra chat,
--     documentato nel codice). La riga '' -> NULL qui sotto resta come guardia;
--   - admin packages/admin/src/hooks/useAdminBooking.ts ~riga 321: `meetingPoint || null`,
--     verificare che sia un id;
--   - front packages/front/src/pages/PickUpPage.tsx: commit aeb1383 scrive `chosenPoint.id`
--     (oggi solo locale, non su origin/main).
-- Prima del deploy la FK farebbe fallire in produzione ogni salvataggio della logistica che
-- passa da un nome e ogni "svuota punto" che passa da ''. Lezione 20/08: schema nuovo +
-- bundle vecchio = pagina rotta. Il gate e' il deploy, non il GO.
--
-- IL DIFETTO: bookings.meeting_point e' testo libero senza FK. Oggi contiene 4 volte il NOME
-- "Thai Akha Kitchen (School)" (prenotazioni di giugno, scritte dall'admin), mai un id. La
-- pagina front fino a ieri scriveva l'id del punto nella colonna ZONA, il CHECK lo rifiutava e
-- la pagina navigava come se avesse salvato. Con la FK il valore puo' essere solo un id di
-- meeting_points o NULL, e l'errore e' visibile.
--
-- COSA FA: 1) '' -> NULL (oggi 0 righe, guardia); 2) i 4 nomi -> 'mp_school' (il punto walk_in
-- della scuola: le 4 righe hanno zona outside/walk-in e il proprio hotel); 3) FK
-- bookings.meeting_point -> meeting_points(id) on update cascade. Il trigger
-- update_bookings_timestamp viene spento attorno agli UPDATE: sono prenotazioni passate e un
-- updated_at di oggi dichiarerebbe una modifica che non c'e' stata. Nessun trigger email su
-- UPDATE (send-agency-booking-confirmation e' AFTER INSERT; protect_booking_ref_update e
-- trg_booking_default_kitchen non guardano questa colonna).

alter table public.bookings disable trigger update_bookings_timestamp;
update public.bookings set meeting_point = null where meeting_point = '';
update public.bookings set meeting_point = 'mp_school' where meeting_point = 'Thai Akha Kitchen (School)';
alter table public.bookings enable trigger update_bookings_timestamp;
alter table public.bookings
  add constraint bookings_meeting_point_fkey foreign key (meeting_point)
    references public.meeting_points(id) on update cascade;

-- VERIFICA DOPO (attesi):
-- select count(*) from public.bookings where meeting_point is not null and meeting_point not in (select id from public.meeting_points);  -> 0
-- select meeting_point, count(*) from public.bookings where meeting_point is not null group by 1;  -> mp_school 4 (+ id nuovi)
-- update public.bookings set meeting_point = 'Thai Akha Kitchen (School)' where booking_ref = 'TAK00103';  -> ERROR 23503
-- select max(updated_at) from public.bookings where booking_ref in ('TAK00103','TAK00120','TAK00130','TAK00111');  -> invariato
-- salute A-F -> 0
