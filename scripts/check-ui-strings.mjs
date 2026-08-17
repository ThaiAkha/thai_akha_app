#!/usr/bin/env node
/**
 * check-ui-strings — la rete di sicurezza del multilingua UI (front).
 *
 * L'INGLESE È LO SCHEMA. Per ogni altra lingua in locales/ verifica, per ogni
 * namespace:
 *   · chiavi EXTRA (esistono nella lingua ma non in EN)        → errore
 *   · placeholder {{x}} presenti in EN e assenti nella traduzione → errore
 *   · placeholder inventati (nella traduzione ma non in EN)       → errore
 *   · valore vuoto ''                                             → errore (si omette la chiave: fallback su EN)
 *   · chiavi MANCANTI                                             → conteggio (ammesse: fallback per chiave)
 * Verifica anche che NAMESPACES (i18n/index.ts) e la cartella en/ coincidano.
 *
 * Esce 1 se ci sono errori. Uso: pnpm check-ui-strings  [--lang es]
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LOC = join(ROOT, 'packages/front/src/i18n/locales');
const onlyLang = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : null;

const flat = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out[key] = v;
  }
  return out;
};
const placeholders = (s) => new Set(String(s).match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []);
const readNs = (lang, ns) => { const f = join(LOC, lang, `${ns}.json`); return existsSync(f) ? flat(JSON.parse(readFileSync(f, 'utf8'))) : null; };

const enNs = readdirSync(join(LOC, 'en')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
const idx = readFileSync(join(ROOT, 'packages/front/src/i18n/index.ts'), 'utf8');
const declared = [...idx.matchAll(/'([a-zA-Z]+)'/g)].map(m => m[1]).filter(n => enNs.includes(n) || /^[a-z]+$/.test(n));
const missingDecl = enNs.filter(n => !idx.includes(`'${n}'`));
let errors = 0;
if (missingDecl.length) { console.error(`❌ namespace in locales/en ma NON in NAMESPACES (i18n/index.ts): ${missingDecl.join(', ')}`); errors++; }

const langs = readdirSync(LOC).filter(d => d !== 'en' && existsSync(join(LOC, d)) && (!onlyLang || d === onlyLang)).sort();
if (!langs.length) console.log(`(solo en/ presente: ${enNs.length} namespace, ${enNs.reduce((n, ns) => n + Object.keys(readNs('en', ns)).length, 0)} chiavi)`);

for (const lang of langs) {
  let missing = 0, total = 0; const errs = [];
  for (const ns of enNs) {
    const en = readNs('en', ns); const tr = readNs(lang, ns);
    total += Object.keys(en).length;
    if (!tr) { missing += Object.keys(en).length; continue; }
    for (const [k, v] of Object.entries(tr)) {
      if (!(k in en)) { errs.push(`${ns}:${k} — chiave EXTRA (non esiste in EN)`); continue; }
      if (v === '' || v === null) { errs.push(`${ns}:${k} — valore vuoto (ometti la chiave: fallback EN)`); continue; }
      const pe = placeholders(en[k]), pt = placeholders(v);
      for (const p of pe) if (!pt.has(p)) errs.push(`${ns}:${k} — manca placeholder ${p}`);
      for (const p of pt) if (!pe.has(p)) errs.push(`${ns}:${k} — placeholder inventato ${p}`);
    }
    for (const k of Object.keys(en)) if (!(k in tr)) missing++;
  }
  const pct = Math.round(((total - missing) / total) * 100);
  console.log(`${errs.length ? '❌' : '✓'} ${lang}: ${total - missing}/${total} chiavi (${pct}%)${missing ? `, ${missing} mancanti → fallback EN` : ''}${errs.length ? `, ${errs.length} ERRORI` : ''}`);
  for (const e of errs) console.log(`    ${e}`);
  errors += errs.length;
}
process.exit(errors ? 1 : 0);
