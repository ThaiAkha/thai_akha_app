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
