-- 20260730000000_record_legal_acceptance_hardening.sql
-- Corregge tre difetti di record_legal_acceptance emersi dalla code-review.
--
-- 1. NO-OP SILENZIOSO: `update ... where id = auth.uid()` non trovava riga (profilo non
--    ancora creato, upsert fallito a monte) e la funzione tornava comunque "successo"
--    con NULL. Una prova di consenso che sparisce senza errore e' peggio di nessuna prova.
-- 2. VERSIONE MOSTRATA != VERSIONE REGISTRATA: la UI mostra la versione dei file generati,
--    la funzione registrava quella del DB. Se qualcuno bumpa il DB e dimentica
--    `pnpm gen-legal`, l'utente legge la 1.2 e il registro giura che ha accettato la 1.3.
--    Ora il chiamante DICHIARA la versione mostrata e la funzione rifiuta se diverge.
-- 3. IP FALSIFICABILE: si prendeva il PRIMO elemento di x-forwarded-for, cioe' quello
--    scritto dal client. Ora si preferisce cf-connecting-ip / x-real-ip e, in fallback,
--    l'ULTIMO elemento di XFF (quello aggiunto dal proxy).
--
-- In piu': guardia jsonb_typeof (se la chiave contenesse un oggetto, `||` fallirebbe) e
-- de-duplica (stessa versione + stessa lingua consecutive non si riaccodano all'infinito).

create or replace function public.record_legal_acceptance(
  p_doc_key        text,
  p_lang           text,
  p_shown_version  text default null
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
  v_hdrs    json;
  v_entry   jsonb;
  v_prev    jsonb;
  v_last    jsonb;
  v_rows    int;
  v_result  jsonb;
begin
  if v_uid is null then
    raise exception 'record_legal_acceptance: nessun utente autenticato' using errcode = '42501';
  end if;

  if p_lang is null or btrim(p_lang) = '' then
    raise exception 'record_legal_acceptance: lang obbligatoria (serve a sapere QUALE testo e stato accettato)'
      using errcode = '22023';
  end if;

  select legal_version into v_version
  from public.legal_documents where doc_key = p_doc_key;

  if v_version is null then
    raise exception 'record_legal_acceptance: doc_key % inesistente', p_doc_key using errcode = '22023';
  end if;

  -- La versione mostrata deve coincidere con quella in DB: se i file generati sono
  -- disallineati (manca un `pnpm gen-legal`) si blocca invece di registrare il falso.
  if p_shown_version is not null and p_shown_version is distinct from v_version then
    raise exception
      'record_legal_acceptance: versione mostrata (%) diversa da quella in DB (%) per %. Rigenerare i file legali.',
      p_shown_version, v_version, p_doc_key
      using errcode = '22023';
  end if;

  begin
    v_hdrs := current_setting('request.headers', true)::json;
    v_ip := coalesce(
      nullif(btrim(coalesce(v_hdrs ->> 'cf-connecting-ip', '')), ''),
      nullif(btrim(coalesce(v_hdrs ->> 'x-real-ip', '')), ''),
      -- ultimo elemento di XFF = quello aggiunto dal proxy, non dal client
      nullif(btrim(coalesce(
        (string_to_array(coalesce(v_hdrs ->> 'x-forwarded-for', ''), ','))[
          array_length(string_to_array(coalesce(v_hdrs ->> 'x-forwarded-for', ''), ','), 1)
        ], '')), '')
    );
  exception when others then
    v_ip := null;
  end;

  v_entry := jsonb_build_object(
    'v',    v_version,
    'lang', p_lang,
    'at',   to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'ip',   v_ip
  );

  select legal_accepted -> p_doc_key into v_prev from public.profiles where id = v_uid;
  if v_prev is null or jsonb_typeof(v_prev) <> 'array' then
    v_prev := '[]'::jsonb;
  end if;

  -- De-dup: non riaccodare la stessa versione nella stessa lingua se e' gia' l'ultima.
  if jsonb_array_length(v_prev) > 0 then
    v_last := v_prev -> (jsonb_array_length(v_prev) - 1);
    if v_last ->> 'v' = v_version and v_last ->> 'lang' = p_lang then
      return v_prev;
    end if;
  end if;

  update public.profiles
  set legal_accepted = jsonb_set(
        coalesce(legal_accepted, '{}'::jsonb),
        array[p_doc_key],
        v_prev || jsonb_build_array(v_entry),
        true
      )
  where id = v_uid
  returning legal_accepted -> p_doc_key into v_result;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'record_legal_acceptance: profilo % inesistente, accettazione NON registrata', v_uid
      using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

comment on function public.record_legal_acceptance(text, text, text) is
  'Registra in profiles.legal_accepted[doc_key] una accettazione append-only. Versione, timestamp e IP timbrati dal server; p_shown_version (opzionale) deve coincidere con la versione in DB, altrimenti errore. Solleva eccezione se il profilo non esiste.';

grant execute on function public.record_legal_acceptance(text, text, text) to authenticated;

-- La vecchia firma a 2 argomenti non serve piu': il chiamante passa sempre la versione mostrata.
drop function if exists public.record_legal_acceptance(text, text);
