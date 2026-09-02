# send-contact-notification (#120)

Un INSERT in `contact_messages` (contact form di thaiakha.com) produce un'email
alla casella operativa. Prima di questa funzione il messaggio finiva in tabella
e nessuno lo leggeva.

## Flusso

```
ContactForm.tsx (anon INSERT)
  -> trigger AFTER INSERT "send-contact-notification" su contact_messages
     (supabase_functions.http_request, stesso pattern del trigger booking)
  -> POST /functions/v1/send-contact-notification  { record: { id, ... } }
  -> la funzione rilegge la riga via service-role e invia con Resend
```

- **Destinatario**: secret `CONTACT_NOTIFY_TO` (lo decide l'owner, mai hardcoded).
- **Reply-To**: l'email del visitatore, per rispondere con un semplice Reply.
- **From**: `Thai Akha Kitchen <office@thaiakhakitchen.com>` (dominio verificato Resend).
- La funzione non si fida del payload del webhook: usa solo `record.id` e rilegge la riga.
- L'email non blocca mai l'utente: l'INSERT riesce anche se la notifica fallisce
  (trigger asincrono via pg_net, il form non aspetta).

## Config richiesta (esegue l'umano)

1. Secret: `supabase secrets set CONTACT_NOTIFY_TO=<casella scelta dall'owner>`
   (`RESEND_API_KEY` e' gia' impostata: la usano le altre 5 funzioni email).
2. Deploy: `supabase functions deploy send-contact-notification`
   (verify_jwt resta true: il trigger manda l'anon key nell'header Authorization).
3. Trigger SQL (su GO, poi salvarlo come migration):

```sql
-- #120: notifica email su nuovo messaggio dal contact form
create trigger "send-contact-notification"
after insert on public.contact_messages
for each row
execute function supabase_functions.http_request(
  'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-contact-notification',
  'POST',
  '{"Content-type":"application/json"}',
  '{"Authorization":"Bearer <ANON_KEY>"}',
  '5000'
);
```

`<ANON_KEY>` = anon key del progetto (e' pubblica, sta gia' nel bundle front e
nel trigger gemello `send-booking-email` su bookings). Timeout 5000ms: la
chiamata Resend sta dentro comodamente, il 1000ms del trigger booking e' tirato.

## Test (dopo deploy + trigger)

```sql
insert into public.contact_messages (name, email, topic, message)
values ('Test 120', 'test@thaiakha.com', 'other', 'Riga di prova notifica contact form, da cancellare.');
```

Attesa: email a `CONTACT_NOTIFY_TO` entro 1 minuto. Poi:

```sql
delete from public.contact_messages where name = 'Test 120';
```

## RLS (verificata 2026-09-02, gia' corretta)

- `anon can insert`: INSERT only, con vincoli di lunghezza su name/email/topic/message.
- `staff can read` / `staff can update`: solo admin/manager.
- Nessuna SELECT pubblica. Nessun fix necessario.

## Nota a margine (trovata durante la #120)

Il trigger `send-booking-email` su `bookings` punta a
`/functions/v1/send-booking-confirmation`, che NON esiste piu' tra le funzioni
deployate: ogni booking spara una POST verso un endpoint morto. Non e' compito
di questa funzione, ma va segnalato a /booking + /email (riparare o rimuovere).
