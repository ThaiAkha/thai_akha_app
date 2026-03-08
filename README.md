# ThaiAkha Cherry 2026 — Monorepo

Monorepo con due app Vite + React + TypeScript.

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

## Variabili d'ambiente

- `packages/front/.env.local` → GEMINI_API_KEY
- `packages/admin/.env` → VITE_SUPABASE_URL, VITE_SUPABASE_KEY, ecc.
