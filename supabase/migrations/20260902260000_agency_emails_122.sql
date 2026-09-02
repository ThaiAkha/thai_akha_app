-- #122: email agenzie - conferma booking + reminder 24h
-- Applicata in prod il 2026-09-02 via MCP (apply_migration agency_emails_122);
-- questo file e' la copia versionata. La riga di private.agency_reminder_config
-- (edge_url + cron_secret) e' stata inserita a parte: il secret NON sta nel repo.

-- 1) idempotenza reminder
alter table public.bookings add column if not exists reminder_sent_at timestamptz;
comment on column public.bookings.reminder_sent_at is '#122: quando il reminder 24h e'' stato inviato all''agenzia (null = mai)';

-- 2) via il trigger morto: puntava a send-booking-confirmation, edge non piu' deployata
drop trigger if exists "send-booking-email" on public.bookings;

-- 3) conferma automatica all'agenzia su INSERT agency confermato
create trigger "send-agency-booking-confirmation"
after insert on public.bookings
for each row
when (new.booking_source = 'agency' and new.status = 'confirmed')
execute function supabase_functions.http_request(
  'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-agency-booking-confirmation',
  'POST',
  '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io"}',
  '{}',
  '5000'
);

-- 4) reminder 24h: config + tick (pattern gemello di private.market_cron_config)
create table if not exists private.agency_reminder_config (
  id boolean primary key default true check (id),
  enabled boolean not null default true,
  edge_url text not null default '',
  cron_secret text not null default ''
);

create or replace function private.agency_reminder_tick()
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare cfg private.agency_reminder_config; ids uuid[];
begin
  select * into cfg from private.agency_reminder_config where id;
  if not found or not cfg.enabled or cfg.edge_url = '' or cfg.cron_secret = '' then return; end if;
  -- classe tra 12 e 24 ore (ora di Bangkok): finestra larga, un tick perso non perde il reminder;
  -- l'idempotenza per riga (reminder_sent_at) evita i doppi invii
  select array_agg(b.internal_id) into ids
  from public.bookings b
  join public.class_sessions cs on cs.id = b.session_id
  where b.booking_source = 'agency' and b.status = 'confirmed' and b.reminder_sent_at is null
    and (b.booking_date + cs.start_time) - (now() at time zone 'Asia/Bangkok')
        between interval '12 hours' and interval '24 hours';
  if ids is null then return; end if;
  perform net.http_post(
    url := cfg.edge_url,
    headers := jsonb_build_object('Content-Type','application/json','x-agency-cron-secret', cfg.cron_secret),
    body := jsonb_build_object('booking_ids', to_jsonb(ids)));
end $$;

-- 5) cron orario (minuto 10)
select cron.schedule('agency-reminder-24h', '10 * * * *', 'select private.agency_reminder_tick()');
