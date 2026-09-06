-- Due trigger AFTER INSERT su chat_messages con lo stesso corpo (last_activity =
-- now(), message_count + 1): ogni messaggio contava doppio e la soglia del
-- riassunto di Cherry (20) scattava a 10. Resta on_chat_message_inserted →
-- handle_new_chat_message (nome coerente con handle_new_user). Verificato sul
-- database vivo il 2026-09-07: i due corpi coincidono, la funzione tolta non
-- e' usata da nessun altro trigger. Idempotente.
DROP TRIGGER IF EXISTS on_new_chat_message ON public.chat_messages;
DROP FUNCTION IF EXISTS public.sync_chat_session_activity();
