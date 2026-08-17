# i18n front — stringhe UI in 12 lingue

> Motore **i18next** (lo stesso dell'admin) · lingua **dall'URL** (`/es/…` → UI spagnola) · chiavi **tipizzate** dai JSON inglesi · traduttore: **/i18n**

## Struttura

```
i18n/
├── index.ts          init + `t('ns:key')` + `tObj('ns:key')` (array/oggetti) + syncI18nLanguage(lang)
├── types.ts          CustomTypeOptions: le chiavi valide = i JSON di en/ (chiave sbagliata → errore tsc)
├── README.md         questo file
└── locales/
    ├── en/           ← LO SCHEMA. 23 namespace, 565 chiavi. Ogni chiave nasce qui.
    ├── es/ fr/ de/ pt/ it/ ca/ nl/ th/ zh/ ko/ ja/    ← stessi 23 file, prodotti da /i18n
    └── (una lingua nuova = una cartella; l'elenco lingue è @thaiakha/shared/lib/i18n)
```

## I 23 namespace = un file per pagina/dominio

| Namespace | Cosa contiene | Chiavi (array/oggetto = 1) |
|---|---|---|
| `common` | azioni, stati, date, mesi (`monthsShort` = array) | 37 |
| `nav` | sidebar, menu, footer | 13 |
| `errors` | messaggi d'errore generici | 8 |
| `components` | testi di componenti condivisi (modali, player, gallery) | 36 |
| `auth` | login/signup/onboarding (`onboarding.*.cards` = array) | 43 |
| `user` | dashboard utente, passport, profilo | 78 |
| `booking` | wizard prenotazione | 47 |
| `quiz` | quiz, livelli, ricompense | 72 |
| `recipes` · `recipeSingle` | lista ricette · ricetta singola | 16 · 28 |
| `classes` · `menu` | pagine classi · mega-menu | 35 · 9 |
| `history` · `news` · `blog` | cultura · news · card articolo | 19 · 6 · 7 |
| `faq` · `about` · `contact` · `location` · `home` | pagine informative | 11 · 1 · 44 · 20 · 2 |
| `cherry` | Cherry AI (`dietaryMap`, `spicinessMap` = oggetti) | 17 |
| `seo` · `alt` | fallback SEO · alt-text | 13 · 3 |

**Shell eager** (bundlati in inglese, zero flash al primo paint): `common`, `nav`, `errors`, `components`. Tutto il resto è **lazy per lingua+namespace**: il giapponese si scarica solo su `/ja/`.

## Come si usa

```ts
import { t, tObj } from '../i18n';          // path relativo a src/i18n

t('quiz:hint.title')                        // stringa
t('common:welcomeBack', { name })           // interpolazione {{name}}
tObj('common:monthsShort')[m]               // array/oggetto tipizzato (returnObjects)
```
Chi vuole reattività fine può usare `useTranslation()` di react-i18next: stessa istanza. Al cambio lingua il `LanguageProvider` rimonta comunque l'albero.

## Le regole (le stesse dei sidecar DB)

1. **L'inglese è lo schema.** Una chiave nuova nasce in `en/`, poi (eventualmente) nelle altre lingue. Mai una chiave che esiste in `es/` e non in `en/` → il check la boccia.
2. **Fallback per chiave, mai per file.** Se `ja/quiz.json` non ha `hintLabel`, esce l'inglese di quella chiave. Per "non tradotto" si **omette la chiave**, mai `""`.
3. **Placeholder identici**: `{{name}}` in EN ⇒ `{{name}}` nella traduzione. Il check boccia mancanti e inventati.
4. **Logica nel componente, non nella stringa**: una chiave per ramo (`headerDescReady` / `headerDescReadyAllergies`), mai template con `if`.
5. **`pnpm check-ui-strings`** prima di ogni commit che tocca `locales/`: parità chiavi, placeholder, vuoti, namespace ↔ `NAMESPACES`.

## Storia

Migrato il 2026-08-17 da `@thaiakha/shared/lib/ui-strings.ts` (oggetto TS solo-EN, 867 righe, 66 consumatori) con `scripts/gen-ui-strings-json.mts` + `scripts/codemod-ui-strings-to-i18n.mts`. Motivo: 12 lingue richiedono fallback per chiave e un traduttore con validazione meccanica — cose che i18next e /i18n fanno già per l'admin. Un solo motore, un solo formato, un solo traduttore per le due app.
