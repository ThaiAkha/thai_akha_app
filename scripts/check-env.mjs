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
import { basename, join, resolve } from 'node:path';

const REQUIRED_BASE = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

// Richieste solo da un package. La chiave Maps la usa solo il front:
// index.html la inlina via %VITE_GOOGLE_MAPS_API_KEY%; se manca, Vite lascia
// il placeholder LETTERALE nell'HTML e la mappa pickup muore in silenzio.
// (Nota: questo guard ferma la chiave ASSENTE. Una chiave presente ma scaduta
// in Cloud Console - ExpiredKeyMapError, 2026-08-31 - da qui non si vede.)
const REQUIRED_BY_PKG = {
  front: ['VITE_GOOGLE_MAPS_API_KEY'],
};

// Guard segreti (audit 2026-08, P2): tutto cio' che si chiama VITE_* finisce nel
// bundle browser appena qualcuno scrive `import.meta.env.VITE_X`. Le chiavi a
// pagamento (Gemini, OpenAI, Resend, Zoho, service_role...) NON devono mai avere
// quel prefisso: vivono solo come secret delle edge function. Qui blocchiamo il
// build se una VITE_* con nome sensibile compare negli .env o nelle env di processo.
// Allowlist = chiavi PENSATE per il browser (pubbliche per design, ristrette per referrer).
const VITE_PUBLIC_ALLOWLIST = new Set([
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_RECAPTCHA_SITE_KEY',
]);
const VITE_SENSITIVE_WORDS = /(SERVICE_ROLE|SECRET|PRIVATE|GEMINI|OPENAI|ANTHROPIC|RESEND|ZOHO|REFRESH_TOKEN|ACCESS_TOKEN|PASSWORD)/i;
const VITE_KEY_LIKE = /(_KEY|_TOKEN|_SECRET)$/i;

const pkgDir = process.argv[2];
const mode = process.argv[3] ?? 'production';
if (!pkgDir) {
  console.error('check-env: manca la directory del package.');
  process.exit(2);
}

// Il package si riconosce dal nome della cartella (lo script riceve "." dal
// build script di ciascun package, quindi si risolve al path assoluto).
const REQUIRED = [
  ...REQUIRED_BASE,
  ...(REQUIRED_BY_PKG[basename(resolve(pkgDir))] ?? []),
];

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

// --- Guard segreti: nomi VITE_* sensibili (file + processo) ---
const viteNames = new Set([
  ...Object.keys(env),
  ...Object.keys(process.env),
].filter((k) => k.startsWith('VITE_')));
const leaks = [...viteNames].filter(
  (k) => !VITE_PUBLIC_ALLOWLIST.has(k) && (VITE_SENSITIVE_WORDS.test(k) || VITE_KEY_LIKE.test(k)),
);
if (leaks.length > 0) {
  console.error(`
[thaiakha] Build interrotta: ${leaks.length} variabili VITE_* con nome sensibile.

${leaks.map((k) => `  - ${k}`).join('\n')}

Tutto cio' che inizia per VITE_ e' destinato al bundle browser: una chiave a pagamento
o un segreto con quel prefisso diventa pubblico appena qualcuno scrive
\`import.meta.env.<NOME>\`. Rinominala senza VITE_ e tienila solo come secret delle
edge function (supabase secrets set). Se e' davvero una chiave pubblica per design,
aggiungila a VITE_PUBLIC_ALLOWLIST in scripts/check-env.mjs.
`);
  process.exit(1);
}

// --- Interruttore multilingua a LISTA (VITE_I18N_LANGS) ----------------------------
// I nomi ritirati fanno rumore: un vecchio 'true' non deve accendere nulla in silenzio.
const RETIRED_I18N = ['VITE_I18N_ROUTES', 'I18N_ROUTES_ENABLED'];
const retiredI18n = RETIRED_I18N.filter((k) => k in env || k in process.env);
if (retiredI18n.length) {
  console.error(`
[thaiakha] Build interrotta: variabile ritirata ${retiredI18n.join(', ')}.
L'interruttore multilingua e' a LISTA: VITE_I18N_LANGS ('es' | 'es,fr' | vuota = solo inglese).
`);
  process.exit(1);
}
// Codici validati contro SUPPORTED_LANGS di shared/lib/i18n.ts. Fail-closed: se la
// lista non si trova nel file, il build si ferma invece di validare a vuoto.
const rawLangs = (process.env.VITE_I18N_LANGS ?? env.VITE_I18N_LANGS ?? '').trim().toLowerCase();
const i18nSrc = readFileSync(new URL('../packages/shared/src/lib/i18n.ts', import.meta.url), 'utf8');
const langsMatch = i18nSrc.match(/export const SUPPORTED_LANGS\s*=\s*\[([\s\S]*?)\]\s*as const/);
if (!langsMatch) {
  console.error('[thaiakha] check-env: SUPPORTED_LANGS non trovata in packages/shared/src/lib/i18n.ts, build interrotta.');
  process.exit(1);
}
const supportedLangs = [...langsMatch[1].matchAll(/'([a-z]{2})'/g)].map((m) => m[1]);
const wantedLangs = rawLangs ? rawLangs.split(',').map((s) => s.trim()).filter(Boolean) : [];
const unknownLangs = wantedLangs.filter((l) => !supportedLangs.includes(l));
if (unknownLangs.length) {
  console.error(`
[thaiakha] Build interrotta: VITE_I18N_LANGS contiene codici fuori perimetro: ${unknownLangs.join(', ')}
Ammessi: ${supportedLangs.join(', ')}
`);
  process.exit(1);
}
const activeLangs = supportedLangs.filter((l) => l === 'en' || wantedLangs.includes(l));
// Sempre stampata: nel log di CI si legge cosa e' acceso senza cercare nel bundle.
console.log(`[check-env] VITE_I18N_LANGS="${rawLangs}" -> lingue attive: ${activeLangs.join(',')} (${basename(resolve(pkgDir))})`);

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
