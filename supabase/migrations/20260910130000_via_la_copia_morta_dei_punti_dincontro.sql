-- ─────────────────────────────────────────────────────────────────────────────
-- Via la seconda copia dei punti d'incontro, che diceva cose diverse dalla prima.
--
-- `class_sessions.meeting_points` era un JSONB con dentro i punti d'incontro:
-- nome, nota, orario, tipo. Cioe' una SECONDA versione di `meeting_points`, la
-- tabella. E le due non erano d'accordo:
--
--   Wat Pan Whaen, orario mattina   tabella 08:50   ·   copia JSON 09:00
--   Wat Pan Whaen, tipo             tabella walk_in ·   copia JSON market_meeting
--
-- Due orari per lo stesso posto, e un tipo che nella tabella non esiste.
--
-- ── PERCHE' SI TOGLIE INVECE DI ALLINEARLA ───────────────────────────────────
-- Perche' non la legge nessuno, verificato nei quattro posti dove poteva servire:
--   • nessuna funzione e nessuna vista del database la nomina;
--   • nessun file di `packages/` o `supabase/functions/` legge quel campo (il codice
--     legge `class_sessions` per max_capacity, price_thb, display_name, start_time,
--     mai per i punti);
--   • il `json_ld` di `site_metadata` non nomina Wat Pan Whaen, e nemmeno i campi
--     SEO/GEO (`summary_ai`, `page_essentials`, `related_queries_geo`);
--   • nessuna FAQ lo nomina.
-- Allinearla vorrebbe dire tenere in vita due verita' da sincronizzare a mano. E
-- una copia che ha smesso di essere una copia e' peggio di un dato mancante: il
-- dato mancante da' errore, questa risponde, e risponde con l'orario sbagliato.
--
-- ── PERCHE' SI SVUOTA E NON SI DROPPA ────────────────────────────────────────
-- Ordine del proprietario del 2026-08-10: niente drop, si lavora per aggiunta e
-- sottrazione di CONTENUTO. E qui la colonna vuota col suo commento vale piu' di una
-- colonna sparita: e' il cartello che impedisce a qualcuno di ricominciare a
-- riempirla fra sei mesi, quando nessuno ricordera' perche' era stata svuotata.
--
-- Backup in `archive` prima di toccare, come da regola (create + revoke insieme).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists archive.class_sessions_bak_20260910_meeting_points as
  select id, meeting_points, schedule_config from public.class_sessions;
revoke all on archive.class_sessions_bak_20260910_meeting_points from anon, authenticated;

update public.class_sessions
   set meeting_points = null
 where meeting_points is not null;

comment on column public.class_sessions.meeting_points is
  'SVUOTATA il 2026-09-10 e da lasciare vuota. Conteneva una seconda versione dei punti d''incontro che divergeva dalla tabella `meeting_points` (Wat Pan Whaen: 09:00 qui, 08:50 la''; tipo market_meeting qui, walk_in la''). Nessuno la leggeva. La fonte unica dei punti d''incontro e'' la tabella `meeting_points`, con i suoi orari e le sue regole. Copia in archive.class_sessions_bak_20260910_meeting_points.';

do $$
declare n int;
begin
  select count(*) into n from public.class_sessions where meeting_points is not null;
  if n <> 0 then
    raise exception 'restano % righe con la copia dei punti', n;
  end if;
end $$;
