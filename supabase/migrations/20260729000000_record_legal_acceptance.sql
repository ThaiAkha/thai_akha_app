-- 20260729000000_record_legal_acceptance.sql
-- Registrazione dell'accettazione di un documento legale in profiles.legal_accepted.
--
-- Forma: { "<doc_key>": [ {"v":"1.2","lang":"th","at":"<iso8601>","ip":"1.2.3.4"}, ... ] }
-- Array APPEND-ONLY: l'ultimo elemento e' l'accettazione corrente, l'array e' lo storico.
--
-- Perche' una RPC e non una scrittura diretta dal client:
--  - `at` e `ip` devono essere timbrati dal SERVER. Un browser non conosce il proprio IP,
--    e una data scelta dal client non e' una prova.
--  - `v` deve essere la versione REALE del documento: la funzione la rilegge da
--    legal_documents invece di fidarsi del parametro, cosi' non si puo' dichiarare di
--    aver accettato una versione diversa da quella mostrata.
--  - append-only garantito lato server: il client non puo' sovrascrivere lo storico.
-- Resta una limitazione nota: essendo il dato su profiles, l'interessato puo' comunque
-- riscrivere la colonna. Per una prova a prova di contestazione servirebbe una tabella
-- append-only separata: scelta di /terms, non di questa PR.

create or replace function public.record_legal_acceptance(
  p_doc_key text,
  p_lang    text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_version text;
  v_ip      text;
  v_entry   jsonb;
  v_result  jsonb;
begin
  if v_uid is null then
    raise exception 'record_legal_acceptance: nessun utente autenticato' using errcode = '42501';
  end if;

  -- La versione la decide il DB, non il chiamante.
  select legal_version into v_version
  from public.legal_documents where doc_key = p_doc_key;

  if v_version is null then
    raise exception 'record_legal_acceptance: doc_key % inesistente', p_doc_key using errcode = '22023';
  end if;

  if p_lang is null or btrim(p_lang) = '' then
    raise exception 'record_legal_acceptance: lang obbligatoria (serve a sapere QUALE testo e stato accettato)'
      using errcode = '22023';
  end if;

  -- IP dal proxy (PostgREST espone gli header della richiesta). NULL da backend/cron.
  begin
    v_ip := split_part(
      coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
    if btrim(coalesce(v_ip, '')) = '' then v_ip := null; end if;
  exception when others then
    v_ip := null;
  end;

  v_entry := jsonb_build_object(
    'v',    v_version,
    'lang', p_lang,
    'at',   to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'ip',   v_ip
  );

  -- APPEND: mai sovrascrivere lo storico gia' presente per quel doc_key.
  update public.profiles
  set legal_accepted = jsonb_set(
        coalesce(legal_accepted, '{}'::jsonb),
        array[p_doc_key],
        coalesce(legal_accepted -> p_doc_key, '[]'::jsonb) || jsonb_build_array(v_entry),
        true
      )
  where id = v_uid
  returning legal_accepted -> p_doc_key into v_result;

  return v_result;
end;
$$;

comment on function public.record_legal_acceptance(text, text) is
  'Registra in profiles.legal_accepted[doc_key] una accettazione append-only. Versione, timestamp e IP sono timbrati dal server; il chiamante fornisce solo doc_key e lang.';

grant execute on function public.record_legal_acceptance(text, text) to authenticated;
