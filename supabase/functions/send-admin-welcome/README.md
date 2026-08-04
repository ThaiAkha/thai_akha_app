# send-admin-welcome

Email **Welcome** brandizzata (EN/TH) per la registrazione di un partner **agency** (admin side).
Invocata via `functions.invoke` da `SignUpForm` dopo signup riuscito, **non-blocking** (un errore
email non blocca la registrazione). Specchio di `send-password-reset` (Resend + `templates.ts`).

## Input
```json
{ "email": "agency@example.com", "user_name": "Mario Rossi", "lang": "en|th", "login_url": "https://admin.../signin" }
```
- `lang` opzionale (default `en`; `th` se thai; altre lingue → fallback EN finché non tradotte).
- `login_url` opzionale (default `https://admin.thaiakha.com/signin`).

## Output
`{ ok: true, id }` oppure `{ ok: false, error }`.

## Env / secret (già presenti — NON committare)
- `RESEND_API_KEY` — già configurato. Nessun nuovo secret.

## Deploy (da eseguire a mano)
```bash
supabase functions deploy send-admin-welcome
```

## Template
`templates.ts` — `WELCOME_ADMIN_EN_HTML` / `WELCOME_ADMIN_TH_HTML`, embeddati verbatim dal brain
`000_Email_Messages_Faq/20_Email_App_Thai_Akha/welcome_admin_{en,th}.html`.
Merge field: `{{user_name}}`, `{{account_email}}`, `{{login_url}}` (via `renderEmail`).

## Nota
Supera (per l'admin) la vecchia `send-welcome-email` (webhook, HTML inline con placeholder
`yourdomain.com`, senza lingua). La welcome **front** (`welcome_front_*`) è un workstream separato.
