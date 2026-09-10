-- ─────────────────────────────────────────────────────────────────────────────
-- Ripristino di cio' che la migration precedente ha svuotato per errore.
--
-- `20260910130000` ha azzerato `class_sessions.meeting_points` sulla base di una
-- verifica che diceva «nessuno la legge». La verifica era INCOMPLETA: aveva cercato
-- in `packages/` e in `supabase/functions/`, e non in `scripts/`. Quel campo lo
-- legge `scripts/gen-cherry-facts.ts:115`, che ne ricava il campo `walkIn` dei
-- fatti di Cherry - cioe' l'elenco dei posti dove un ospite si presenta da solo,
-- in dodici lingue.
--
-- Nessun danno reale: nessuno ha rigenerato i fatti nel frattempo, e il backup
-- c'era perche' la regola della casa lo impone. Ma il danno possibile era che
-- Cherry smettesse di sapere dove si presentano i walk-in.
--
-- Questa migration esiste perche' il ripristino era stato fatto a mano, e una
-- correzione che vive solo nel database e non nella storia **e' una mina**:
-- rigiocando la sequenza da zero, lo svuotamento resterebbe e il ripristino no.
-- Con questo file la sequenza torna a produrre lo stato giusto.
--
-- LEZIONE, gia' scritta una volta il 09/09 e ripetuta il 10/09:
-- **un risultato vuoto perche' hai cercato nel posto sbagliato e' identico a un
-- risultato vuoto perche' non c'e' niente.** L'unica differenza e' che uno dei due
-- va verificato. Prima di dichiarare morto un dato: cercare in TUTTE le cartelle
-- che contengono codice, `scripts/` compresa.
-- ─────────────────────────────────────────────────────────────────────────────

update public.class_sessions cs
   set meeting_points = b.meeting_points
  from archive.class_sessions_bak_20260910_meeting_points b
 where b.id = cs.id
   and cs.meeting_points is null
   and b.meeting_points is not null;

comment on column public.class_sessions.meeting_points is
  'Elenco walk-in per sessione, LETTO da scripts/gen-cherry-facts.ts (campo walkIn dei fatti di Cherry). NON svuotare: il 2026-09-10 e'' stata svuotata per errore e ripristinata dal backup archive.class_sessions_bak_20260910_meeting_points. Resta una seconda copia dei punti accanto alla tabella meeting_points: finche'' il generatore non legge la tabella anche per i punti (come gia'' fa per le zone), le due vanno tenute allineate a mano.';

do $$
declare n int;
begin
  select count(*) into n from public.class_sessions where meeting_points is null;
  if n <> 0 then
    raise exception 'ripristino incompleto: % sessioni senza punti', n;
  end if;
end $$;
