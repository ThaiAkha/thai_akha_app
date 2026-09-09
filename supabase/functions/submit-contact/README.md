# submit-contact

Riceve il form contatti pubblico, verifica il gettone **Cloudflare Turnstile**, rivalida le lunghezze e inserisce in `contact_messages` col service role.

## Perché esiste
Il form scriveva in tabella con la chiave anon: un captcha nel browser sarebbe stato decorativo, perché chi abusa chiama l'API REST e non il form. La porta si chiude togliendo la policy `anon can insert` (migration di /database), **dopo** il deploy di questa funzione e del form.

## Contratto
`POST { name, email, topic, message, token, website? }` → `200 { ok: true }`.
- `token`: il gettone del widget Turnstile.
- `website`: campo esca. Se pieno, la risposta è `200 { ok: true }` e non si scrive niente.
- `400` regole non rispettate · `403` gettone rifiutato · `429` più di 10 messaggi in un'ora dallo stesso IP · `500` scrittura fallita.

Limiti (gli stessi della policy che viene tolta): `name` 1-200 · `email` 3-320 con la chiocciola non in prima né in ultima posizione · `topic` 1-200 · `message` 1-8000.

## Segreti
`TURNSTILE_SECRET_KEY` (secret della edge, mai con prefisso `VITE_`). **Se manca, la funzione risponde `503` con l'indirizzo email**: lo stato senza verifica non si raggiunge per distrazione. Per saltare la verifica di proposito serve un secret esplicito `TURNSTILE_BYPASS=true`, che si vede nell'elenco dei secret e grida.

Se Cloudflare non risponde, la richiesta viene **rifiutata**: un form contatti può aspettare, una porta aperta no.

> Il motivo di questa forma sta in questo repository: `check_chat_rate_limit` porta da mesi il commento «BYPASS TEMPORANEO - rimuovere queste 2 righe» e le due righe sono ancora lì. Un ramo che disattiva una difesa e si giustifica come temporaneo qui è già sopravvissuto una volta.

`verify_jwt = false` in `config.toml`: i visitatori non hanno JWT.

## Standard per i form pubblici
Un form pubblico non scrive mai in tabella. Scrive a una edge che verifica il gettone, valida e inserisce col service role; la tabella non ha nessuna policy di scrittura anonima.
