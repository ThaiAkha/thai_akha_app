-- #172: email B2C del booking cliente - conferma (+ notifica staff) e promemoria 24h.
-- ⚠️ NON ANCORA APPLICATA IN PROD (2026-09-03): si applica su GO dell'owner, dopo il deploy
-- delle edge send-booking-confirmation e send-booking-reminder (runbook nei README).
-- Gemella di 20260902260000_agency_emails_122.sql: stesso pattern, stessa anon key.
-- La riga di private.booking_reminder_config (edge_url + cron_secret) va inserita a parte:
-- il secret NON sta nel repo.

-- 1) conferma automatica al cliente su INSERT non-agency confermato
--    (agency ha la sua edge; staff_internal = prenotazioni interne di test, niente email)
drop trigger if exists "send-booking-confirmation" on public.bookings;
create trigger "send-booking-confirmation"
after insert on public.bookings
for each row
when (new.status = 'confirmed' and coalesce(new.booking_source, '') not in ('agency', 'staff_internal'))
execute function supabase_functions.http_request(
  'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-booking-confirmation',
  'POST',
  '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io"}',
  '{}',
  '5000'
);

-- 2) promemoria 24h: config + tick (pattern gemello di private.agency_reminder_config)
create table if not exists private.booking_reminder_config (
  id boolean primary key default true check (id),
  enabled boolean not null default true,
  edge_url text not null default '',
  cron_secret text not null default ''
);

create or replace function private.booking_reminder_tick()
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare cfg private.booking_reminder_config; ids uuid[];
begin
  select * into cfg from private.booking_reminder_config where id;
  if not found or not cfg.enabled or cfg.edge_url = '' or cfg.cron_secret = '' then return; end if;
  -- classe tra 12 e 24 ore (ora di Bangkok): finestra larga, un tick perso non perde il reminder;
  -- l'idempotenza per riga (reminder_sent_at, condivisa col reminder agenzia) evita i doppi invii
  select array_agg(b.internal_id) into ids
  from public.bookings b
  join public.class_sessions cs on cs.id = b.session_id
  where coalesce(b.booking_source, '') not in ('agency', 'staff_internal')
    and b.status = 'confirmed' and b.reminder_sent_at is null
    and (b.booking_date + cs.start_time) - (now() at time zone 'Asia/Bangkok')
        between interval '12 hours' and interval '24 hours';
  if ids is null then return; end if;
  perform net.http_post(
    url := cfg.edge_url,
    headers := jsonb_build_object('Content-Type','application/json','x-booking-cron-secret', cfg.cron_secret),
    body := jsonb_build_object('booking_ids', to_jsonb(ids)));
end $$;

comment on function private.booking_reminder_tick() is '#172: ogni ora seleziona i booking cliente (non agency) con classe tra 12 e 24 ore e chiama send-booking-reminder';

-- 3) cron orario (minuto 20: quello agenzie gira al 10)
select cron.schedule('booking-reminder-24h', '20 * * * *', 'select private.booking_reminder_tick()');
