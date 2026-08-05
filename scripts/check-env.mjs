#!/usr/bin/env node
// Ferma la build se mancano le env VITE_ senza cui il bundle nasce rotto.
//
// Perche' esiste (2026-08-05): l'admin e' stato buildato da un git worktree.
// Gli .env sono gitignorati, quindi in un worktree non ci sono. Vite non ha avuto
// niente da inlinare, il build e' passato, il tsc e' passato, e l'app e' esplosa
// in produzione al primo createClient con "supabaseKey is required". Il guasto
// non era visibile in nessun check: gli hash dei bundle erano regolari.
//
// Gira PRIMA di vite (vedi package.json), non come plugin: cosi' non dipende dai
// tipi di vite, che da qui alla radice del monorepo tsc non risolve.
//
// Uso: node scripts/check-env.mjs <dir-del-package> [MODE]
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

const pkgDir = process.argv[2];
const mode = process.argv[3] ?? 'production';
if (!pkgDir) {
  console.error('check-env: manca la directory del package.');
  process.exit(2);
}

// Stesso ordine di precedenza di Vite: le piu' specifiche vincono.
const files = ['.env', `.env.${mode}`, '.env.local', `.env.${mode}.local`];

/** Parser .env minimo: KEY=VALUE, salta commenti e righe vuote, toglie le virgolette. */
const parse = (text) => {
  const out = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
};

const env = {};
for (const f of files) {
  const p = join(pkgDir, f);
  if (existsSync(p)) Object.assign(env, parse(readFileSync(p, 'utf8')));
}
// Le env di processo battono i file (CI, shell).
for (const k of REQUIRED) if (process.env[k]) env[k] = process.env[k];

const missing = REQUIRED.filter((k) => !env[k]);
if (missing.length === 0) process.exit(0);

console.error(`
[thaiakha] Build interrotta: mancano ${missing.length} variabili d'ambiente.

${missing.map((k) => `  - ${k}`).join('\n')}

Cercate in ${pkgDir} (${files.join(', ')}) e nelle env di processo.

Gli .env sono gitignorati: se stai buildando da un git worktree o da un clone
fresco vanno copiati a mano dalla working copy principale.

Senza queste variabili il bundle compila lo stesso, ma va in errore nel browser
("supabaseKey is required"). Meglio fermarsi qui.
`);
process.exit(1);
