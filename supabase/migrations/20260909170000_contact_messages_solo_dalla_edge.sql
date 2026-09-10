-- 20260909170000_contact_messages_solo_dalla_edge.sql
-- /database · 2026-09-09 · A4 dell'audit, lato database.
-- ⛔ STATO: PROPOSTA. NON APPLICARE PRIMA DEL DEPLOY della edge `submit-contact` e del form nuovo.
-- Applicata prima, il modulo contatti smette di funzionare: e' l'unica porta che oggi lo fa
-- scrivere. Il gate e' il deploy verificato, non il GO. Su GO dopo il deploy:
-- `supabase db query --linked -f <file>` + `migration repair --status applied 20260909170000`.
--
-- PERCHE'. Oggi `ContactForm.tsx:44` fa un INSERT DIRETTO in `contact_messages` con la chiave
-- anon (che sta nel bundle per disegno), e la policy `anon can insert` controlla soltanto le
-- LUNGHEZZE dei campi. Un trigger AFTER INSERT chiama la edge che manda l'email all'ufficio.
-- Quindi un ciclo di POST sull'API REST = una email per riga, sullo stesso dominio da cui partono
-- conferme di prenotazione e reimpostazioni di password.
--
-- 🔴 IL PUNTO CHE DECIDE TUTTO: **finche' questa policy esiste, il captcha e' decorativo.**
-- Un captcha si verifica su un server, e il server puo' rifiutare solo se e' l'unico modo di
-- entrare. Se la porta diretta resta aperta, chi vuole abusare la usa e non passa mai dal
-- widget. Aggiungere Turnstile senza questa migration non protegge niente.
--
-- COSA FA: toglie la policy che permette la scrittura anonima diretta. Dopo, sulla tabella
-- scrivera' SOLO la edge `submit-contact` con il service_role, che avra' gia' verificato il
-- gettone Turnstile presso `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
-- La lettura e la gestione da parte dello staff (`staff can read`, `staff can update`) non si
-- toccano, e il trigger dell'email resta com'e': cambia CHI puo' far nascere la riga.
--
-- ⚠️ DA PORTARE NELLA EDGE, perche' qui sparisce: la validazione delle lunghezze che oggi vive
-- nella policy e che dopo non varra' piu' per il service_role (la RLS non lo riguarda):
--   name    1..200      email 3..320 e deve contenere '@' dopo il primo carattere
--   topic   1..200      message 1..8000
-- Vanno ricontrollate nella edge PRIMA dell'insert, altrimenti si perde un controllo che c'e'.
--
-- ROLLBACK, se il modulo si rompe: ricreare la policy con la definizione qui sotto, che e' la
-- copia esatta di quella attuale letta da pg_policies il 2026-09-09.
--   create policy "anon can insert" on public.contact_messages for insert to anon, authenticated
--   with check (char_length(name) >= 1 and char_length(name) <= 200
--     and char_length(email) >= 3 and char_length(email) <= 320 and position('@' in email) > 1
--     and char_length(topic) >= 1 and char_length(topic) <= 200
--     and char_length(message) >= 1 and char_length(message) <= 8000);

drop policy if exists "anon can insert" on public.contact_messages;

comment on table public.contact_messages is
  'Messaggi del form Contact Us. Dal 2026-09-09 NESSUNA scrittura anonima diretta: si entra solo dalla edge `submit-contact`, che verifica il gettone Cloudflare Turnstile e poi scrive col service_role. La validazione delle lunghezze vive nella edge, non piu'' in una policy. Lo staff legge e gestisce (policy staff can read / staff can update); il trigger send-contact-notification manda la notifica.';

-- VERIFICA DOPO (attesi):
-- begin; set local role anon;
--   insert into public.contact_messages (name,email,topic,message,status,source)
--   values ('x','x@y.z','t','m','new','test');   -> ERROR 42501 (nessuna policy lo permette)
-- rollback;
-- Il modulo sul sito, compilato davvero, deve continuare a inviare (passa dalla edge).
-- select policyname from pg_policies where tablename='contact_messages';  -> staff can read, staff can update
-- salute A-G -> 0 (F: la tabella conserva 2 policy, quindi non e' "RLS senza policy")
