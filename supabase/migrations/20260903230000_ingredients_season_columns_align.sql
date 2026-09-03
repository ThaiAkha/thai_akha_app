-- 20260903230000_ingredients_season_columns_align.sql
-- ALLINEAMENTO, non modifica dello schema.
--
-- Le 5 colonne `season_*` e i 2 CHECK qui sotto ESISTONO GIA' nel database live: sono
-- stati creati il 2026-09-03 da una sessione Code, fuori dal flusso `supabase/migrations/`.
-- Questa migration li dichiara com'erano il giorno in cui e' stata scritta, cosi' un
-- ambiente ricostruito dalle sole migration ha la stessa tabella del live. Sul live non
-- cambia nulla (tutto e' `if not exists`), su un ambiente nuovo crea colonne e vincoli
-- identici.
--
-- A COSA SERVONO, e chi le riempie:
--   Campagna **#189 - Stagionalita' ingredienti** (2026-09-03), riga #189 dell'inbox
--   `700_To_Do_2027/Svevo_ToDo_2027.md`, stato "In corso". Piano e dati:
--     - 700_To_Do_2027/750_Data_Content/PROMPT_189_Ingredienti_Stagionalita_2026-09-03.md
--     - .../DB_Audit_Fix_2027/189_Ingredienti_Stagionalita_2026-09-03.md  (proposta, 192 righe)
--     - .../DB_Audit_Fix_2027/189_season_update.sql                        (UPDATE pronto, NON eseguito)
--     - .../DB_Audit_Fix_2027/189_season_source.py                         (generatore)
--   Il popolamento e' di /database su GO owner: al 2026-09-03 tutte e 5 le colonne sono
--   VUOTE su 204 righe. Alimenta il lotto E delle FAQ `.8` (Piano_155_Gate3).
--   Nessuna e' fra le colonne traducibili: la campagna multilingua non le tocca.
--
-- Perche' esiste questo file: un ambiente ricostruito dalle migration non avrebbe avuto
-- queste colonne, e nessuno se ne sarebbe accorto finche' #189 non avesse provato a
-- scriverci. Trovate di passaggio dalla sessione del rename name_en -> name.

begin;

alter table public.ingredients_library
  add column if not exists season_status      text,
  add column if not exists season_months      smallint[],
  add column if not exists season_note        text,
  add column if not exists season_source      text,
  add column if not exists season_verified_at timestamptz;

do $$
begin
  -- le 4 etichette ammesse (vedi 189_Ingredienti_Stagionalita per il criterio di ognuna)
  if not exists (select 1 from pg_constraint where conname = 'ingredients_library_season_status_check') then
    alter table public.ingredients_library
      add constraint ingredients_library_season_status_check
      check (season_status = any (array['seasonal','year_round','imported','not_applicable']));
  end if;

  -- coerenza: 'seasonal' esige almeno un mese; i mesi, se ci sono, stanno fra 1 e 12
  if not exists (select 1 from pg_constraint where conname = 'chk_season_coerente') then
    alter table public.ingredients_library
      add constraint chk_season_coerente
      check (
        (season_status is distinct from 'seasonal' or array_length(season_months, 1) >= 1)
        and (
          season_months is null
          or (array_length(season_months, 1) >= 1
              and array_length(season_months, 1) <= 12
              and season_months <@ array[1,2,3,4,5,6,7,8,9,10,11,12]::smallint[])
        )
      );
  end if;
end $$;

-- Guardia: se una delle 5 colonne o dei 2 vincoli mancasse, questa migration non ha
-- fatto il suo lavoro e il rollback e' meglio di un allineamento a meta'.
do $g$
declare c integer; k integer;
begin
  select count(*) into c from information_schema.columns
   where table_schema='public' and table_name='ingredients_library' and column_name like 'season%';
  if c <> 5 then raise exception 'attese 5 colonne season_*, trovate %', c; end if;
  select count(*) into k from pg_constraint
   where conname in ('chk_season_coerente','ingredients_library_season_status_check');
  if k <> 2 then raise exception 'attesi 2 CHECK season, trovati %', k; end if;
  raise notice 'allineamento season_*: 5 colonne, 2 vincoli';
end $g$;

commit;
