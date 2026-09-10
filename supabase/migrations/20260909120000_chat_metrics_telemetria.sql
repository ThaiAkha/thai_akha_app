-- 20260909120000_chat_metrics_telemetria.sql
-- /database · 2026-09-09 · STATO: PROPOSTA, non applicata. Tabella NUOVA, quindi si crea solo
-- su GO esplicito dell'owner (regola d'oro #1: niente tabelle nuove salvo casi motivati).
-- Su GO: `supabase db query --linked -f <file>` + `migration repair --status applied 20260909120000`.
--
-- PERCHE'. I log della piattaforma durano 24 ORE. Oggi (09/09) abbiamo misurato con quei log il
-- ragionamento sceso 39 volte, la latenza scesa del 38% e le risposte allungate del 29%: domani
-- quei numeri non esistono piu'. Senza serie storica ogni domanda su costo, qualita' o uso di
-- Cherry resta un aneddoto. E la domanda che conta oggi e' proprio storica: **6 sessioni su 394
-- hanno ricevuto un messaggio, l'ultimo il 2026-09-02.**
--
-- COSA NON CONTIENE, e non e' un dettaglio: **nessun testo scritto dall'ospite o da Cherry.**
-- Solo lunghezze, lingua, durata, esito, token e strumenti. Le conversazioni hanno gia' la loro
-- casa (`chat_messages`) con la sua RLS per proprietario di sessione; una seconda copia dei testi
-- con regole diverse e' il modo in cui i dati personali sfuggono. Vincolo posto dalla chat codice
-- il 09/09 e fatto proprio qui.
--
-- FORMA. Una riga per RISPOSTA di Cherry, scritta dalla edge col service_role, senza bloccare lo
-- stream (fire-and-forget come `saveMessage`): se l'inserimento fallisce, l'ospite non se ne
-- accorge e si perde una riga di telemetria, che e' il baratto giusto.
--
-- ⚠️ DECISIONE OWNER DEL 2026-09-09, che ridimensiona questa proposta: la prenotazione online
-- resta BLOCCATA a data da definire. Quindi il traffico basso sull'app React e' ATTESO e per
-- costruzione, non e' un'anomalia: nessun audit futuro deve riaprirlo come guasto. Di conseguenza
-- questa tabella non ha urgenza. Ha senso crearla quando la prenotazione riparte, cioe' quando
-- Cherry avra' utenti veri da misurare; crearla adesso registrerebbe soprattutto le nostre prove.
-- Il file resta pronto perche' il disegno e' discusso e concordato, non perche' serva oggi.
--
-- LETTURA GIA' PRONTA per le domande di oggi (esempi in coda al file): costo per giorno, quota di
-- richieste che attivano gli strumenti, durata mediana per ramo, tasso di errore per motivo.

create table if not exists public.chat_metrics (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  -- Nullable e ON DELETE SET NULL: la telemetria sopravvive alla pulizia delle sessioni ospite
  -- (24h) senza trattenere il legame con una conversazione che non c'e' piu'.
  session_id     uuid references public.chat_sessions(id) on delete set null,
  is_guest       boolean not null default true,
  lang           text not null default 'en',
  model          text,
  -- Esito
  success        boolean not null,
  error_reason   text,          -- il messaggio d'errore breve, MAI il contenuto della domanda
  finish_reason  text,          -- STOP, MAX_TOKENS, SAFETY...
  duration_ms    integer,
  -- Volumi: solo NUMERI, mai testo
  message_chars  integer,       -- lunghezza della domanda, non la domanda
  response_chars integer,       -- lunghezza della risposta consegnata (≠ usage.output, che accumula i giri)
  prompt_tokens  integer,
  output_tokens  integer,
  thought_tokens integer,
  -- Percorso
  tools_used     text[] not null default '{}',   -- ['search_content','get_recipe']
  tool_rounds    smallint,
  constraint chat_metrics_lang_chk check (lang = any (public.allowed_langs()))
);

comment on table public.chat_metrics is
  'Telemetria per risposta di Cherry: SOLO misure, mai il testo di domande o risposte (quelli stanno in chat_messages con la sua RLS). Scritta dalla edge col service_role senza bloccare lo stream. Serve la serie storica che i log della piattaforma non danno: durano 24 ore. 2026-09-09.';
comment on column public.chat_metrics.response_chars is
  'Caratteri consegnati all''ospite. NON usare output_tokens per la lunghezza: quello accumula tutti i giri di strumento, preambolo e argomenti delle chiamate compresi.';
comment on column public.chat_metrics.error_reason is
  'Messaggio d''errore breve (es. "empty answer (STOP)"). MAI il testo della domanda dell''ospite.';

create index if not exists chat_metrics_created_at_idx on public.chat_metrics (created_at desc);
create index if not exists chat_metrics_success_idx on public.chat_metrics (success, created_at desc) where not success;

alter table public.chat_metrics enable row level security;

-- Scrive solo la edge (service_role, che bypassa comunque la RLS: la policy e' esplicita perche'
-- una tabella con RLS e ZERO policy e' il controllo F della salute, e non deve mai risultare tale).
create policy "service writes" on public.chat_metrics
  for insert to service_role with check (true);
-- Legge solo lo staff: e' telemetria di esercizio, non contenuto pubblico.
create policy "staff reads" on public.chat_metrics
  for select using (public.is_staff());

revoke all on public.chat_metrics from anon, authenticated;
grant select on public.chat_metrics to authenticated;   -- filtrato dalla policy staff
grant insert on public.chat_metrics to service_role;

-- LETTURE PRONTE (esempi, non parte della migration):
-- Uso reale per giorno, e quante richieste attivano gli strumenti:
--   select created_at::date g, count(*) richieste,
--          count(*) filter (where tools_used <> '{}') con_strumenti,
--          count(*) filter (where not success) fallite
--     from public.chat_metrics group by 1 order by 1 desc;
-- Costo per giorno (token) e latenza mediana per ramo:
--   select created_at::date g, sum(prompt_tokens+output_tokens+thought_tokens) token,
--          percentile_cont(0.5) within group (order by duration_ms) filter (where tools_used = '{}') ms_senza,
--          percentile_cont(0.5) within group (order by duration_ms) filter (where tools_used <> '{}') ms_con
--     from public.chat_metrics group by 1 order by 1 desc;
-- Le risposte si stanno allungando? (la sorveglianza chiesta il 09/09, soglia 1.200)
--   select created_at::date g, round(avg(response_chars)) medi, max(response_chars) massimo
--     from public.chat_metrics group by 1 order by 1 desc;
--
-- VERIFICA DOPO L'APPLICAZIONE:
-- select count(*) from public.chat_metrics;                                        -> 0
-- salute A-F -> 0 (A: RLS attiva · F: due policy, quindi non "RLS senza policy")
-- select conname from pg_constraint where conrelid='public.chat_metrics'::regclass and conname like '%lang%';
--   -> chat_metrics_lang_chk (eredita la lista di allowed_langs(), contratto sidecar del 07/09)
--
-- CRESCITA: una riga per risposta. Al ritmo di oggi (0 messaggi in una settimana) e' nulla; a
-- 500 risposte al giorno sono ~180.000 righe l'anno, poche decine di MB. Se un giorno pesasse,
-- si aggrega per giorno e si cancella il dettaglio oltre i 90 giorni: decisione da prendere
-- quando il problema esiste, non adesso.
