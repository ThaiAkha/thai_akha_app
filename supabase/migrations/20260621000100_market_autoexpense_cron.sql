-- Market Ops — auto-generazione spese: tick cron + config privata
-- SICURO da applicare subito: il job parte DISABILITATO (enabled=false) e non fa nulla
-- finché non popoli edge_url + cron_secret e metti enabled=true (vedi in fondo).

create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table if not exists private.market_cron_config (
  id          boolean primary key default true check (id),
  edge_url    text    not null default '',   -- https://<ref>.functions.supabase.co/zoho-create-market-expense
  cron_secret text    not null default '',   -- deve combaciare con MARKET_CRON_SECRET della edge
  enabled     boolean not null default false,
  updated_at  timestamptz not null default now()
);
insert into private.market_cron_config(id) values (true) on conflict (id) do nothing;
revoke all on private.market_cron_config from anon, authenticated;

-- Tick: invoca la edge per ogni gruppo pronto. No-op se non configurato/disabilitato.
create or replace function private.market_autoexpense_tick()
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare
  cfg private.market_cron_config;
  g   record;
begin
  select * into cfg from private.market_cron_config where id;
  if not found or not cfg.enabled or cfg.edge_url = '' or cfg.cron_secret = '' then
    return;
  end if;
  for g in select * from public.get_market_pending_expenses() loop
    perform net.http_post(
      url     := cfg.edge_url,
      headers := jsonb_build_object('Content-Type','application/json','x-market-cron-secret', cfg.cron_secret),
      body    := jsonb_build_object('stream', g.stream, 'run_ids', to_jsonb(g.run_ids))
    );
  end loop;
end
$$;

-- Schedula ogni 15 min (idempotente)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'market-autoexpense') then
    perform cron.unschedule('market-autoexpense');
  end if;
  perform cron.schedule('market-autoexpense', '*/15 * * * *', $cron$ select private.market_autoexpense_tick(); $cron$);
end $$;

-- ATTIVAZIONE (dopo `supabase functions deploy zoho-create-market-expense`
-- e dopo aver impostato il secret MARKET_CRON_SECRET):
--   update private.market_cron_config set
--     edge_url    = 'https://mtqullobcsypkqgdkaob.functions.supabase.co/zoho-create-market-expense',
--     cron_secret = '<lo-stesso-valore-di-MARKET_CRON_SECRET>',
--     enabled     = true,
--     updated_at  = now()
--   where id;
