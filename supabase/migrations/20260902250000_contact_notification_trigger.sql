-- #120: notifica email su nuovo messaggio dal contact form
-- AFTER INSERT su contact_messages -> edge send-contact-notification (Resend, CONTACT_NOTIFY_TO)
-- Applicata in prod il 2026-09-02 via MCP (apply_migration contact_notification_trigger_120);
-- questo file e' la copia versionata.
-- Nota: Authorization nell'argomento HEADERS del http_request. Il trigger gemello
-- send-booking-email la passava nel 4o argomento (i query params): cosi' non autentica.
create trigger "send-contact-notification"
after insert on public.contact_messages
for each row
execute function supabase_functions.http_request(
  'https://mtqullobcsypkqgdkaob.supabase.co/functions/v1/send-contact-notification',
  'POST',
  '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io"}',
  '{}',
  '5000'
);
