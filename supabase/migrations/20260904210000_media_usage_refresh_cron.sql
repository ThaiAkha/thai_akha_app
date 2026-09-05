-- media_usage: rinfresco notturno automatico (gate #184, 2026-09-04).
--
-- PERCHE'. `refresh_media_usage()` esiste dal 04/09 ma nessuno la chiamava: ne'
-- trigger, ne' cron, ne' codice. Senza questo job la tabella torna a essere il
-- backfill una-tantum che #184 ha appena sanato: alla prima cover cambiata o
-- pubblicazione la sitemap immagini ricomincia a mentire, in silenzio, con un
-- Cache-Control di un'ora davanti.
--
-- 19:30 UTC = 02:30 Bangkok, nella stessa fascia degli altri job notturni.
-- La funzione e' plpgsql SECURITY DEFINER: DELETE+INSERT sono atomici, la edge
-- function non vede mai la tabella a meta'. pg_cron gira come postgres, che ha
-- EXECUTE (revocata a PUBLIC/anon/authenticated nella migration 20260904204332).
--
-- Idempotente: si puo' riapplicare senza creare un secondo job omonimo.

do $$
begin
  if exists (select 1 from cron.job where jobname = 'media-usage-refresh-nightly') then
    perform cron.unschedule('media-usage-refresh-nightly');
  end if;
  perform cron.schedule(
    'media-usage-refresh-nightly',
    '30 19 * * *',
    $cron$ select public.refresh_media_usage(); $cron$
  );
end $$;
