-- 20260909180000_check_chat_rate_limit_dice_il_vero.sql
-- /database · 2026-09-09 · STATO: PROPOSTA, non applicata. Su GO owner.
--
-- IL PROBLEMA: `check_chat_rate_limit` ha in cima al corpo
--   RETURN QUERY SELECT TRUE, 'limits disabled', 999999; RETURN;
-- con il commento "BYPASS TEMPORANEO - rimuovere queste 2 righe per riattivare i limiti".
-- Tutto il resto del corpo (VIP, conteggio messaggi) e' irraggiungibile. E' li' da mesi.
-- La funzione e' SECURITY DEFINER ed e' eseguibile da `anon` (segnalata dall'advisor Supabase,
-- lint 0028): chiunque puo' chiamarla e ricevere "consentito, 999999".
--
-- PERCHE' NON LA DROPPO, pur non avendo quasi piu' chiamanti: **vincolo owner del 2026-08-10,
-- "niente drop, tutto il lavoro resta additivo fino a nuovo ordine"**. Vale ancora. Questa
-- migration toglie la BUGIA senza togliere l'oggetto.
--
-- COSA FA:
-- 1. Revoca EXECUTE a anon e authenticated: la funzione non e' piu' un endpoint pubblico.
--    Chiude anche la segnalazione dell'advisor su una SECURITY DEFINER aperta all'anonimo.
-- 2. Sostituisce il corpo con un rifiuto esplicito: chi la chiama riceve un errore che dice
--    dove vive davvero il tetto, invece di un "consentito" che sembra una risposta.
-- 3. Mette nel commento la verita', cosi' chi legge il catalogo non conclude che un tetto ci sia.
--
-- ⚠️ DIPENDENZA DI CODICE, da fare PRIMA o insieme: `packages/admin/src/hooks/useCherryChat.ts`
-- (riga ~120) chiama ancora `checkRateLimit` via `chatSession.service.ts:162`. La chat del FRONT
-- e la voce hanno gia' smesso (commit 07/09 e b080b8e). Finche' l'admin la chiama, applicare
-- questa migration gli fa comparire un errore. `chatSession.service.ts:176` ha un catch che
-- "allowing by default", quindi non si romperebbe nulla, ma comparirebbe un avviso a ogni
-- messaggio: meglio togliere prima la chiamata dall'admin.
--
-- DOVE STA IL TETTO VERO, verificato leggendo la edge il 2026-09-09
-- (`supabase/functions/gemini-proxy-chat/index.ts`, funzione OMONIMA ma diversa, righe 118-167):
--   utente loggato CON prenotazione confermata futura -> nessun limite (VIP, voluto)
--   utente loggato senza prenotazione                 -> 30 messaggi/giorno, contati su chat_messages
--   OSPITE                                            -> **NESSUN LIMITE**, riga 166:
--                                                        "Guests don't have rate limits per session"
-- Quindi la chat testo un tetto ce l'ha, ma NON per gli ospiti, che sono l'intera popolazione
-- reale (endpoint con verify_jwt = false, e nei log ogni richiesta e' userId 'guest').
-- **Il buco vero e' quel ramo, non questa RPC.** Chiuderlo e' lavoro di codice, non di database.

create or replace function public.check_chat_rate_limit(p_user_id text, p_session_token text)
returns table(allowed boolean, reason text, remaining integer)
language plpgsql security definer set search_path to 'public' as $function$
begin
  -- 2026-09-09: questa funzione non e' mai stata un tetto. Dal suo primo giorno rispondeva
  -- "consentito, 999999" per via di un bypass dichiarato temporaneo, e il codice sotto non
  -- e' mai stato eseguito. Invece di continuare a rispondere una cosa falsa, dice che non
  -- e' lei il posto giusto. Il tetto vero vive nella edge gemini-proxy-chat.
  raise exception
    'check_chat_rate_limit e'' dismessa: non ha mai applicato nessun limite. Il tetto vive nella edge gemini-proxy-chat.'
    using errcode = '42501';
end;
$function$;

comment on function public.check_chat_rate_limit is
  'DISMESSA il 2026-09-09. Dal primo giorno rispondeva sempre "limits disabled / 999999" per un bypass dichiarato temporaneo, quindi non ha MAI applicato un limite: chi la leggeva concludeva a torto che un tetto ci fosse. Non droppata per il vincolo owner del 2026-08-10 (niente drop). Il tetto vero e'' nella edge gemini-proxy-chat, e per gli OSPITI non esiste.';

revoke execute on function public.check_chat_rate_limit(text, text) from public, anon, authenticated;

-- VERIFICA DOPO:
-- select grantee from information_schema.role_routine_grants where routine_name='check_chat_rate_limit';
--   -> postgres, service_role (niente anon, niente authenticated)
-- advisor security: la voce 0028 per questa funzione sparisce
-- salute A-G -> 0
