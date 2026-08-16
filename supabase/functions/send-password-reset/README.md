# send-password-reset

Email **Password Reset** brandizzata (EN/TH) via Resend. Sostituisce l'email di recovery di
default di Supabase: la funzione genera il link con `auth.admin.generateLink` (che **non invia**
nulla) e spedisce l'HTML brandizzato dal dominio verificato.

## Input
```json
{ "email": "user@example.com", "lang": "en|th", "redirectTo": "https://app/reset-password" }
```
- `lang` opzionale (default `en`; `th` se thai; altre lingue → fallback EN finché i template non sono tradotti).
- `redirectTo` opzionale: dove il link riporta dopo il verify (deve essere in **allowlist**).

## Output
`{ ok: true, id }` oppure `{ ok: false, error }`.

## Env / secret (già presenti — NON committare)
- `RESEND_API_KEY` — secret Resend (già configurato per le altre email).
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — **auto-iniettate** nel runtime Edge. Nessun nuovo secret.

## Deploy (da eseguire a mano)
```bash
supabase functions deploy send-password-reset
```

## Prerequisiti Auth (già soddisfatti dal lavoro auth)
- L'URL di redirect (`/reset-password`) deve essere nella **Redirect URLs allowlist**
  (Supabase → Auth → URL Configuration). `generateLink` rispetta l'allowlist.
- **Nessun cambio di config Auth richiesto:** usando `generateLink` (no invio) + Resend parte
  **una sola** email. L'email di recovery di default resta inutilizzata.

## Scadenza link
`RESET_LINK_EXP_MIN = 60` in `index.ts` — costante allineata a mano alla config Auth
`mailer_otp_exp` (OTP/recovery expiry). Se cambi la scadenza in Supabase, aggiorna la costante.

## Template
`templates.ts` — `PASSWORD_RESET_EN_HTML` / `PASSWORD_RESET_TH_HTML`, embeddati verbatim dal brain
`000_Email_Messages_Faq/20_Email_App_Thai_Akha/password_reset_{en,th}.html`. Merge field:
`{{reset_url}}`, `{{expiry_minutes}}` (sostituiti via `renderEmail`).
