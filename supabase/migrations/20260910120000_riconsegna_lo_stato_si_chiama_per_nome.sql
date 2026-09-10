-- ─────────────────────────────────────────────────────────────────────────────
-- La riconsegna smette di stare in una booleana che significa due cose opposte.
--
-- ── IL GUASTO, misurato ──────────────────────────────────────────────────────
-- `requires_dropoff` oggi porta DUE significati contrari a seconda di chi legge:
--   • nella pagina del sito l'interruttore parte SPENTO e vuol dire "riportami dove
--     mi avete preso". Spento scrive `requires_dropoff = false`
--     (`PickUpPage.tsx:226`, `useLocationState.ts:67`);
--   • nel Driver Planner `false` vuol dire "walk-off, non riportarmi", e quella
--     riga esce da ogni colonna della riconsegna.
-- Quindi l'ospite che vuole solo tornare al proprio hotel - cioe' che non tocca
-- niente - si cancella da solo dal giro di ritorno. **11 prenotazioni su 61 sono
-- in uno stato che nessuno ha scelto**, e la stessa booleana toglie anche fermate
-- dal conteggio del payout (`calculate_driver_payout`: `requires_dropoff IS NOT FALSE`).
--
-- ── PERCHE' UN NOME E NON UN TERZO VALORE ────────────────────────────────────
-- Il proprietario ha nominato TRE stati di partenza, non due: hotel -> stesso
-- posto; punto d'incontro -> DA DEFINIRE; walk-in -> se ne va da se'. "Da definire"
-- non e' ne' vero ne' falso.
-- La via pigra sarebbe usare NULL come terzo stato. Non si fa, ed e' il punto di
-- questa migration: NULL in JavaScript e' falso e in `IS NOT FALSE` e' vero. Sarebbe
-- lo stesso identico difetto - un valore che due lettori interpretano al contrario -
-- rimesso in scena con un altro costume.
-- Quindi lo stato **si chiama per nome**, e i nomi sono cinque.
--
-- ── LA CONVERSIONE NON USA LA BOOLEANA, E IL MOTIVO E' CHE NON E' AFFIDABILE ──
-- Non si puo' convertire `false -> 'none'`: per meta' delle righe quel false
-- significa l'opposto, e non c'e' modo di distinguerle guardando il campo. Quindi
-- lo stato si deriva da cio' che e' VERO nella riga, nell'ordine:
--   1. c'e' una destinazione propria, diversa dall'hotel di ritiro   -> 'hotel'
--   2. il ritiro e' walk-in (punto `point_type='walk_in'`)           -> 'none'
--   3. il ritiro e' un punto di citta'                               -> 'to_define'
--   4. tutto il resto (ritiro in hotel)                              -> 'same'
-- E' la regola del proprietario del 2026-09-10 applicata all'esistente, che e' piu'
-- onesto che credere a un campo che sappiamo ambiguo.
--
-- ── QUESTA MIGRATION E' SOLO ADDITIVA, DI PROPOSITO ──────────────────────────
-- NON tocca `requires_dropoff`, NON aggiunge vincoli su di essa, NON cambia niente
-- di cio' che il codice vivo legge o scrive oggi. Serve a far ESISTERE il dato
-- giusto accanto a quello ambiguo. La sostituzione (rendere `requires_dropoff`
-- derivata, e vietare gli stati incoerenti) va DOPO il deploy del codice che scrive
-- il nome: e' la regola del progetto sui vincoli in scrittura, e qui vale doppio
-- perche' i due scrittori sono in due applicazioni diverse.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1 ── Lo stato della riconsegna, chiamato per nome.
alter table public.bookings
  add column if not exists dropoff_mode text;

comment on column public.bookings.dropoff_mode is
  'Stato della riconsegna, per nome: same = dove ti abbiamo preso (destinazione vuota, risolta con coalesce) · to_define = punto d''incontro, nessuno ha ancora detto dove · none = se ne va da se'' (walk-off) · point = a un punto di riconsegna (vedi dropoff_meeting_point) · hotel = a un hotel proprio (vedi dropoff_hotel). Sostituisce la lettura di requires_dropoff, che significava due cose opposte a seconda di chi la leggeva.';

-- 2 ── Il punto di riconsegna: la destinazione che finora non aveva dove stare.
--     Finora l'unico posto era `dropoff_hotel`, testo libero: il nome del mercato
--     battuto a mano, senza coordinate, senza descrizione, senza traduzione. Ed e'
--     il motivo per cui ZERO prenotazioni puntano a uno dei 5 punti che sanno fare
--     riconsegna, pur essendo un caso reale del servizio.
alter table public.bookings
  add column if not exists dropoff_meeting_point text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_dropoff_meeting_point_fkey') then
    alter table public.bookings
      add constraint bookings_dropoff_meeting_point_fkey
      foreign key (dropoff_meeting_point) references public.meeting_points(id);
  end if;
end $$;

comment on column public.bookings.dropoff_meeting_point is
  'Il punto dove l''autista LASCIA l''ospite. Colonna distinta da meeting_point, che e'' il punto del RITIRO: le due gambe hanno luoghi diversi e non vanno confuse. Vale solo con dropoff_mode = ''point''.';

-- 3 ── Un punto di riconsegna dev'essere un punto che sa farla.
--     Una FK guarda l'id, non il tipo: senza questo si potrebbe scegliere come
--     destinazione un punto di solo ritiro. Un CHECK non puo' interrogare un'altra
--     tabella, quindi serve un trigger. Si puo' aggiungere ADESSO senza rischio
--     perche' nessuno scrive ancora quella colonna: non c'e' codice deployato da
--     rompere, ed e' l'unico momento in cui un vincolo del genere e' gratis.
create or replace function public.check_dropoff_meeting_point()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.dropoff_meeting_point is null then
    return new;
  end if;
  if not exists (
    select 1 from public.meeting_points mp
     where mp.id = new.dropoff_meeting_point
       and (mp.point_type = 'dropoff' or mp.is_dropoff_point)
  ) then
    raise exception
      'Il punto "%" non e'' un punto di riconsegna: serve point_type = ''dropoff'' oppure is_dropoff_point.',
      new.dropoff_meeting_point
      using errcode = '23514';
  end if;
  return new;
end;
$function$;

drop trigger if exists check_dropoff_meeting_point_trg on public.bookings;
create trigger check_dropoff_meeting_point_trg
  before insert or update of dropoff_meeting_point on public.bookings
  for each row execute function public.check_dropoff_meeting_point();

-- 4 ── Conversione delle righe esistenti, dalla verita' e non dalla booleana.
update public.bookings b
   set dropoff_mode = case
     when b.dropoff_hotel is not null
      and btrim(b.dropoff_hotel) <> ''
      and b.dropoff_hotel is distinct from b.hotel_name              then 'hotel'
     when exists (select 1 from public.meeting_points mp
                   where mp.id = b.meeting_point and mp.point_type = 'walk_in')  then 'none'
     when b.meeting_point is not null                                then 'to_define'
     else 'same'
   end
 where b.dropoff_mode is null;

-- 5 ── Controllo: nessuna riga resta senza nome, e i nomi sono solo i cinque previsti.
do $$
declare n_vuote int; n_strane int;
begin
  select count(*) into n_vuote  from public.bookings where dropoff_mode is null;
  select count(*) into n_strane from public.bookings
   where dropoff_mode is not null
     and dropoff_mode not in ('same','to_define','none','point','hotel');
  if n_vuote <> 0 or n_strane <> 0 then
    raise exception 'conversione incompleta: % righe senza stato, % con uno stato non previsto', n_vuote, n_strane;
  end if;
end $$;
