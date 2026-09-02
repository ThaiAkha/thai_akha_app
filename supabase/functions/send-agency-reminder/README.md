# send-agency-reminder (#122)

> ✅ LIVE dal 2026-09-02. Test end-to-end riuscito (tick manuale -> POST con
> secret -> email -> write-back `reminder_sent_at`, riga di prova cancellata).

Reminder all'agenzia ~24h prima della classe (template 1421_31).

## Flusso

```
pg_cron "agency-reminder-24h" (minuto 10 di ogni ora)
  -> private.agency_reminder_tick()  [SECURITY DEFINER]
     legge private.agency_reminder_config (enabled, edge_url, cron_secret)
     seleziona bookings agency confermati, reminder_sent_at null,
       classe tra 12 e 24 ore (ora Bangkok, booking_date + class_sessions.start_time)
  -> net.http_post qui { booking_ids: [...] } con header x-agency-cron-secret
  -> per ogni booking: email 1421_31 all'agenzia + write-back reminder_sent_at
```

- Auth SOLO canale cron: header `x-agency-cron-secret` == secret
  `AGENCY_REMINDER_CRON_SECRET` (verify_jwt=false, registrato in config.toml).
  Il valore vive anche in `private.agency_reminder_config.cron_secret`:
  cambiarlo = aggiornare ENTRAMBI (secrets set + update sulla config) + redeploy.
- Finestra 12-24h larga apposta: un tick perso non perde il reminder,
  l'idempotenza e' per riga su `reminder_sent_at`.
- Spegnere il flusso: `update private.agency_reminder_config set enabled=false where id;`
- Migration (config, tick, cron): `20260902260000_agency_emails_122.sql`.
- Write-back fallito dopo invio = failure esplicita nella risposta, mai ingoiata.
