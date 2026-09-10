-- 20260909190000_chat_limiti_di_dimensione.sql
-- /database · 2026-09-09 · STATO: PROPOSTA, non applicata. Su GO owner. Non urgente: latente.
--
-- IL BUCO. `chat_sessions` e `chat_messages` accettano scritture dal browser di un OSPITE con la
-- chiave anon: la policy pretende che la riga stia sotto una sessione il cui `session_token`
-- combacia con l'intestazione `x-cherry-token` che il chiamante manda. **Non e' identita'** (il
-- token se lo sceglie il client) **ma e' isolamento**: nessuno legge la conversazione di un
-- altro. E' un'eccezione deliberata alla regola "i form pubblici passano da una edge", ed e'
-- difendibile: la conversazione dell'ospite deve sopravvivere al reload, e la edge non e' nel
-- percorso della persistenza. La differenza con `contact_messages`, che stiamo chiudendo, e'
-- reale: li' non c'era nessuna correlazione e ogni riga faceva partire una email.
-- Cio' che manca qui e' un'altra cosa: **nessun limite di DIMENSIONE**. `content`, `node_id`,
-- `type` e `metadata` non hanno nessun CHECK, quindi un ospite con un token inventato puo'
-- scrivere righe grandi a piacere, illimitate. Oggi innocuo: 40 righe, 200 kB in tutto.
--
-- 🔴 PERCHE' LA SOGLIA NON E' 8.000 COME NEI CONTATTI, e questa e' la parte che conta.
-- `content` non contiene una cosa, ne contiene DUE (verificato su `saveMessage`, chiamato con
-- 'user' E con 'assistant' da useCherryChat, useCherryInjection, useGeminiLive):
--   la domanda dell'ospite -> tetto vero, `MAX_MESSAGE_CHARS = 4_000` nella edge;
--   la RISPOSTA di Cherry  -> nessun tetto in caratteri, solo `MAX_OUTPUT_TOKENS = 16_384`.
-- Con 8.000 una risposta lunga verrebbe RIFIUTATA, e il modo in cui fallisce e' il peggiore:
-- `saveMessage` e' fire-and-forget (ritorna void, l'errore finisce in un `console.warn`), quindi
-- **nessuno vede il rifiuto**. Il visitatore legge la risposta sullo schermo, ricarica, e la
-- risposta non c'e' piu'; e poiche' lo storico si ricostruisce DAL DATABASE, Cherry riparte
-- senza la propria ultima risposta e si contraddice. Un guasto che non somiglia alla sua causa.
-- Rilievo della chat codice, verificato riga per riga prima di accettarlo.
--
-- LA SOGLIA, fondata sui numeri e non sull'intuizione (misurati il 2026-09-09):
--   risposta piu' lunga mai registrata nei log ......... 1.253 caratteri
--   risposta piu' lunga presente in tabella ............   546 caratteri
--   media .............................................   466 caratteri
--   tetto del modello .................................. 16.384 token, cioe' ~65.000 caratteri
-- **65.536** sta appena sopra il tetto teorico e ~52 volte sopra il massimo osservato: non puo'
-- rifiutare niente di legittimo, e ferma le righe da megabyte. E' un tappo, non una regola
-- editoriale: se un giorno servisse una soglia STRETTA, l'ordine sarebbe l'inverso e tocca prima
-- al codice (prima il client tronca, poi il DB vincola), perche' qui chi scrive non e' la edge,
-- e' il browser.
--
-- VERIFICATO PRIMA: nessuna riga esistente viola nessuno di questi limiti (content max 546,
-- node_id 12, type 4, metadata 0; sessioni: session_token 42, summary 0, metadata 29).

alter table public.chat_messages
  add constraint chat_messages_content_len_chk check (length(content) <= 65536),
  add constraint chat_messages_node_id_len_chk check (node_id is null or length(node_id) <= 200),
  add constraint chat_messages_type_len_chk    check (length(type) <= 40),
  add constraint chat_messages_metadata_len_chk check (metadata is null or length(metadata::text) <= 16384);

alter table public.chat_sessions
  add constraint chat_sessions_token_len_chk    check (session_token is null or length(session_token) <= 200),
  add constraint chat_sessions_summary_len_chk  check (summary is null or length(summary) <= 65536),
  add constraint chat_sessions_metadata_len_chk check (metadata is null or length(metadata::text) <= 16384);

comment on constraint chat_messages_content_len_chk on public.chat_messages is
  'Tappo anti-abuso, non regola editoriale. 65.536 sta appena sopra il tetto del modello (MAX_OUTPUT_TOKENS 16.384, circa 65.000 caratteri) e circa 52 volte sopra la risposta piu'' lunga mai registrata (1.253). NON 8.000 come nei contatti: questa colonna porta anche le RISPOSTE di Cherry, e saveMessage e'' fire-and-forget, quindi un rifiuto sarebbe invisibile e farebbe sparire dallo storico la risposta che il visitatore ha appena letto. 2026-09-09.';

-- VERIFICA DOPO:
-- select conname from pg_constraint where conrelid in ('public.chat_messages'::regclass,'public.chat_sessions'::regclass) and contype='c' order by 1;
--   -> i 4 nuovi su chat_messages + i 3 su chat_sessions + i 2 preesistenti (sender_role, status)
-- insert di una riga con content di 70.000 caratteri -> ERROR 23514
-- una conversazione vera dal browser -> si salva come prima
