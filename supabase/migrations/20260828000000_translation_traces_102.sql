-- 2026-08-28 · /database · #102 - dare al DB una traccia di cosa e' successo a una traduzione
--
-- IL PROBLEMA
-- Il 27/08 e' stata mossa un'accusa a /translate-db: "hai marcato fresca una lingua senza
-- tradurla". FALSA. E il database non aveva modo di smentirla: l'unica data disponibile,
-- `updated_at`, veniva scritta all'INSERT e non piu' toccata (NESSUN trigger la manteneva,
-- ne' sui sidecar ne' sulle madri). Diceva quando la riga era NATA, non quando era cambiata.
-- La smentita e' arrivata leggendo il TESTO: `akha_news` in italiano aveva `updated_at`
-- = 10/08 e dentro gli orari nuovi (9:00/17:00), riscritti la notte del 27.
--
-- > Non e' un campo mancante. E' un campo che risponde con un valore PLAUSIBILE.
-- > Un campo vuoto lo verifichi; una data credibile ci costruisci sopra una conclusione.
--
-- LA CURA (concordata con /translate-db)
--   translated_at            -> quando il TESTO e' cambiato (lo scrive il trigger)
--   verified_at/verified_by  -> quando qualcuno ha guardato SENZA cambiare
--                               ('upload' | 'attest' | 'human'), lo scrivono gli script
--   source_hash              -> invariata: "contro quale madre"
--
-- Con queste, "ritradotto o solo verificato?" ha una risposta nel DB e non nei ricordi
-- di due sessioni di chat.

create or replace function public.trg_set_translated_at()
returns trigger language plpgsql as $$
declare
  -- tutto cio' che NON e' testo da tradurre: se cambia solo questo, translated_at non si muove
  ignora text[] := array['id','lang','language','human_reviewed','created_at','updated_at',
                         'translated_at','verified_at','verified_by','source_hash',
                         'source_version','slug','page_slug','canonical_url'];
begin
  -- In plpgsql non si itera su colonne dinamiche senza contorsioni: si confrontano due
  -- jsonb sottraendo le chiavi non-traducibili. Una riga, e vale per tutti i 24 sidecar.
  -- tg_argv[0] = colonna FK del sidecar (section_id, news_id, ...), diversa per ognuno.
  if (to_jsonb(new) - ignora - tg_argv[0]) is distinct from (to_jsonb(old) - ignora - tg_argv[0])
  then
    new.translated_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;

comment on function public.trg_set_translated_at() is
  '#102 (2026-08-28). translated_at = quando il TESTO e cambiato, non quando la riga e stata toccata: un mark_fresh o un flag human_reviewed non lo muovono. Aggiorna anche updated_at, che prima del 28/08 valeva la data di NASCITA della riga e da qui in avanti vale ultima modifica.';

-- Colonne + vincolo + trigger su TUTTI i sidecar, generati da v_translation_pairs:
-- le coppie sono 24 e cambiano nel tempo, scriverle a mano significa dimenticarne una.
do $$
declare r record;
begin
  for r in select sidecar, sidecar_fk_col from public.v_translation_pairs loop
    execute format('alter table public.%I
      add column if not exists translated_at timestamptz,
      add column if not exists verified_at   timestamptz,
      add column if not exists verified_by   text', r.sidecar);
    execute format('alter table public.%I drop constraint if exists %I', r.sidecar, r.sidecar||'_verified_by_chk');
    execute format('alter table public.%I add constraint %I
      check (verified_by is null or verified_by in (''upload'',''attest'',''human''))',
      r.sidecar, r.sidecar||'_verified_by_chk');
    execute format('drop trigger if exists set_translated_at on public.%I', r.sidecar);
    execute format('create trigger set_translated_at before update on public.%I
      for each row execute function public.trg_set_translated_at(%L)', r.sidecar, r.sidecar_fk_col);
  end loop;
end $$;

-- ⚠️ NESSUN BACKFILL, ed e' una scelta.
-- `translated_at := coalesce(updated_at, created_at)` sembra gratis e scriverebbe una data
-- di traduzione FALSA su ogni riga esistente, indistinguibile da una vera. NULL dice
-- "non lo sappiamo", che e' esattamente cio' che sappiamo.
-- Quindi: translated_at NULL = riga anteriore al 28/08, non "mai tradotta".
--
-- ⚠️ `updated_at` cambia significato a una data nota: valori storici = nascita della riga,
-- dal 28/08 = ultima modifica. Si muove anche su mark_fresh (che e' una modifica di riga,
-- non di testo): per "il testo e' cambiato?" la colonna giusta e' translated_at.
--
-- VERIFICATO (test in transazione, poi rollback): tocco di una colonna NON traducibile
-- -> translated_at resta vuoto; modifica di un testo -> translated_at valorizzato.
-- 24 trigger su 24 sidecar, 24 colonne, zero righe perse.
