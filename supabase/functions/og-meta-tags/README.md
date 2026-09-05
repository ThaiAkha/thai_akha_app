# 🥥 Edge Function: og-meta-tags

## 🎯 Scopo
Questa funzione gestisce la **Generazione Dinamica di Meta Tag SEO e Social** (OpenGraph). È il motore che permette a Facebook, Twitter e ai motori di ricerca di visualizzare anteprime personalizzate per ogni pagina della App Thai Akha.

## 🛠 Funzionamento
- **Bot Detection**: La funzione rileva se la richiesta proviene da un bot (es: Googlebot, FacebookBot).
- **SEO Dinamico**: Se è un bot, interroga il DB Supabase (tabelle `content_categories`, `culture_sections`, `site_metadata`) per estrarre titoli, descrizioni e immagini personalizzate.
- **Redirect**: Se la richiesta proviene da un utente reale, la funzione effettua un **302 Redirect** alla pagina dell'App React.
- **Cache**: Il TTL dei meta tag generati è di **1 ora** (Headers: `Cache-Control: public, max-age=3600`).

## 📥 Input (URL Params)
- `path`: Il path completo della pagina (es: `/recipes/category/soups` o `/history/akha-history`).

## 📥 Tabelle Interrogate
- `content_categories` (per Ricette, Blog, Quiz)
- `culture_sections` (per Storia e Cultura)
- `site_metadata` (per pagine statiche come Home o About)
- `media_assets` (per risolvere gli ID degli asset in URL reali)

## 🔑 Secret Richiesti (Supabase)
- `SUPABASE_URL`: Il tuo endpoint Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chiave admin per bypassare le RLS nelle query SEO.

---
*Ultimo aggiornamento: Aprile 2026 (Unified Schema Alignment)*

## Multilingua (2026-09-05)

La lingua entra dal prefisso URL (`?path=/es/...`, inoltrato dal Worker) e governa
`<html lang>`, `og:locale`, canonical e hreflang. Le lingue attive sono una LISTA
nel secret `I18N_LANGS` ('es' | 'es,fr'; vuoto = solo inglese), letta per richiesta
da `../_shared/langPerimeter.ts` - stesso parser di `shared/lib/i18n.ts` e del Worker.
Il vecchio booleano `I18N_ROUTES_ENABLED` non e' piu' letto.

TUTTE le sei fetcher (site_metadata, culture, ingredient, ingredient-category,
recipe, news) ricevono `lang` e leggono il sidecar `*_translations` nella stessa
round-trip della madre, fuso PER CAMPO con `../_shared/sidecar.ts` (copia
generata di `packages/shared/src/lib/mergeTranslation.ts`: `pnpm check-sidecar`
ferma la CI se diverge, `pnpm sync-sidecar` la rigenera). Prima del 05/09 lo
faceva solo site_metadata: 273 URL entita' uscivano con `<html lang="es">` e
title/description/JSON-LD inglesi.

JSON-LD fuori dall'inglese: i `json_ld` del DB sono inglesi per dottrina (si
generano dai campi tradotti, non si memorizzano tradotti). La edge sovrascrive
headline/name/description sui nodi di contenuto con i campi fusi, aggiunge
`inLanguage` e sposta gli `url` che puntavano alla pagina inglese sul canonical
localizzato - la stessa fonte del `<link rel="canonical">`.

Verifica: `curl -A Googlebot 'https://www.thaiakha.com/es/<slug-es>'` deve dare
`<html lang="es">`, title nella lingua, canonical `/es/`, hreflang en+es+x-default
e JSON-LD con `inLanguage: "es"` e `url` `/es/`.
