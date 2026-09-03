# send-front-welcome (#172)

> ⏳ **Codice pronto, NON deployata** (2026-09-03). Il master `welcome_front_en/th.html`
> (brain 148/1481_02) esisteva dal 05/08 senza nessuna edge che lo mandasse (audit #54).

Welcome email brandizzata (EN/TH) alla registrazione di un cliente sul front thaiakha.com.
Specchio di `send-admin-welcome`: `templates.ts` e' la copia dei due HTML del master
(generata con uno script, markup intatto), `renderEmail` sostituisce `{{user_name}}` e `{{cta_url}}`.

## Flusso

```
front/services/auth.service.ts signUp()  (AuthForm e useBookingSubmit passano di qui)
  -> authCoreService.signUpWithProfile (profilo guest + preferred_language dalla lingua del sito)
  -> functions.invoke('send-front-welcome', { user_name, lang, cta_url })   fire-and-forget
  -> la edge legge l'utente dal JWT e manda SOLO a lui (il body non sceglie il destinatario)
```

- Lingua: `lang` = lingua reale del sito (12 lingue); TH ha il suo template, le altre ricadono su EN.
- CTA: `cta_url` accettato solo se l'origin e' in allowlist (`_shared/edgeGuard.ts`), altrimenti
  `https://www.thaiakha.com/thai-cooking-classes-chiang-mai`.
- Rate limit 2/ora per utente; nessun service-role client.
- Subject: EN "Welcome to Thai Akha Kitchen" · TH "ยินดีต้อนรับสู่ Thai Akha Kitchen".
- Chi prenota registrandosi riceve prima la welcome e poi la conferma del booking: sono due
  email diverse, voluto.

## Runbook (esegue l'umano, su GO)

```
supabase functions deploy send-front-welcome      # nessun secret nuovo (RESEND_API_KEY c'e' gia')
# test: registrazione di prova dal front (lingua EN e poi TH) -> due welcome ricevute -> cancellare l'utente di prova
```
Il front chiama la edge gia' dal prossimo deploy di main: finche' la edge non e' deployata la
chiamata fallisce in silenzio (console.error) e la registrazione non ne risente.
