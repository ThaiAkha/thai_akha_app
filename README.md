# ThaiAkha Cherry 2026 — Monorepo

Monorepo con due app Vite + React + TypeScript.

> 📖 **Per l'architettura del sistema, i permessi, il routing e le regole di business, consulta [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

## Struttura

```
packages/
├── front/    → www.thaiakha.com      (porta 3000 in dev)
└── admin/    → admin.thaiakha.com    (porta 3001 in dev)
```

## Requisiti

- Node >= 18
- pnpm >= 9 → `npm install -g pnpm`

## Installazione

```bash
pnpm install
```

## Sviluppo

```bash
# Avvia solo il front
pnpm dev:front

# Avvia solo l'admin
pnpm dev:admin

# Apri due terminali e avvia entrambe
pnpm dev:front   # → http://localhost:3000
pnpm dev:admin   # → http://localhost:3001
```

## Build

```bash
# Build entrambe le app
pnpm build

# Build singola
pnpm build:front
pnpm build:admin
```

## Variabili d'Ambiente

Copia `.env.example` in `.env.local` per ogni package:

```bash
cp .env.example packages/front/.env.local
cp .env.example packages/admin/.env.local
```

**Variabili Richieste:**
- `VITE_SUPABASE_URL` - URL del progetto Supabase
- `VITE_SUPABASE_ANON_KEY` - Public API key di Supabase
- `VITE_GEMINI_API_KEY` - API key di Google Gemini (chat assistant)
- `VITE_GOOGLE_MAPS_API_KEY` - API key di Google Maps (front only)
- `VITE_ADMIN_APP_URL` - URL dell'Admin App (per staff redirect: default `http://localhost:3001`)
- `RESEND_API_KEY` - Email API (admin only, per edge functions)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin only, per edge functions)
