#!/usr/bin/env node
/**
 * sync-ui-strings — l'UNICO ponte fra repo (sorgente) e brain (banco di lavoro)
 * per le stringhe UI del front in 12 lingue.
 *
 *   SORGENTE = repo  packages/front/src/i18n/locales/{lang}/{ns}.json  (tipizzata, tsc, check)
 *   BANCO    = brain 010_ThaiAkha_com/013_Ui_Strings/{LANG}/{ns}.md     (Obsidian, /i18n, gem)
 *
 *   node scripts/sync-ui-strings.mjs --export            repo → brain (EN specchio + scheletri/valori XX)
 *   node scripts/sync-ui-strings.mjs --import es [fr…]   brain → repo, SOLO se check-ui-strings passa
 *   node scripts/sync-ui-strings.mjs --status            copertura per lingua (dal brain)
 *
 * Perché uno script e non un symlink: il brain non è versionato e non ha tsc.
 * Un symlink farebbe entrare in git modifiche fatte da Obsidian senza alcun
 * controllo. Lo script valida PRIMA di scrivere nel repo (stesso principio di
 * dump-tables.mjs per il DB, a rovescio: là il DB è sorgente e il brain specchio
 * in uscita; qui il repo è sorgente e il brain banco in entrata).
 *
 * FORMATO .md nel brain (leggibile in Obsidian, parsabile qui):
 *   frontmatter YAML (namespace, lang, keys, translated, updated, generated_by)
 *   tabella: | chiave | EN | {LANG} | — chiave e colonne fisse; le celle con
 *   `|` o newline sono escapate (\|, ⏎). Le chiavi sono path a punti
 *   (onboarding.chef.cards[0].title): array/oggetti vengono APPIATTITI e
 *   ricostruiti all'import.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const REPO  = new URL('..', import.meta.url).pathname;
const BRAIN_ROOT = '/Users/svevomondino/Desktop/thai_akha_brain/010_ThaiAkha_com';
const NATIVE = { en:'English', es:'Español', fr:'Français', de:'Deutsch', pt:'Português', it:'Italiano', ca:'Català', nl:'Nederlands', th:'ไทย', zh:'中文', ko:'한국어', ja:'日本語' };
const today = new Date().toISOString().slice(0, 10);

/**
 * DUE APP, stesso motore, stesso formato, stesso ponte — perimetri diversi:
 *   front  12 lingue (pubblico)      → brain 013_Ui_Strings
 *   admin   4 lingue (staff/agenzie) → brain 014_Ui_Strings_Admin
 * Le lingue sono quelle di shared/lib/i18n.ts (front) e admin/src/i18n/index.ts
 * (admin): qui la copia va tenuta allineata (una riga per lingua).
 */
const APPS = {
  front: { loc: 'packages/front/src/i18n/locales', brain: '013_Ui_Strings',
           langs: ['en','es','fr','de','pt','it','ca','nl','th','zh','ko','ja'], index: '013_Ui_Strings_Index' },
  admin: { loc: 'packages/admin/src/i18n/locales', brain: '014_Ui_Strings_Admin',
           langs: ['en','es','th','zh'], index: '014_Ui_Strings_Admin_Index' },
};

const args = process.argv.slice(2);
const appName = args.includes('--app') ? args[args.indexOf('--app') + 1] : 'front';
const APP = APPS[appName];
if (!APP) { console.error(`--app deve essere front|admin (dato: ${appName})`); process.exit(1); }
const LOC   = join(REPO, APP.loc);
const BRAIN = join(BRAIN_ROOT, APP.brain);
const LANGS = APP.langs;
const mode = args.filter(a => a.startsWith('--') && a !== '--app').map(a => a.slice(2))[0] ?? 'status';
const targetLangs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--app');

// ── flatten / unflatten (array → chiave[i]) ────────────────────────────────
const flat = (o, p = '', out = {}) => {
  if (Array.isArray(o)) { o.forEach((v, i) => flat(v, `${p}[${i}]`, out)); return out; }
  if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) flat(v, p ? `${p}.${k}` : k, out); return out; }
  out[p] = o; return out;
};
const unflat = (m) => {
  const root = {};
  for (const [path, v] of Object.entries(m)) {
    const parts = path.split(/\.(?![^\[]*\])/).flatMap(s => { const a = []; s.replace(/([^\[\]]+)|\[(\d+)\]/g, (_, k, i) => { a.push(k !== undefined ? k : Number(i)); }); return a; });
    let cur = root;
    parts.forEach((k, i) => {
      const last = i === parts.length - 1;
      if (last) { cur[k] = v; return; }
      const nextIsIdx = typeof parts[i + 1] === 'number';
      if (cur[k] === undefined) cur[k] = nextIsIdx ? [] : {};
      cur = cur[k];
    });
  }
  return root;
};
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '⏎');
const unesc = s => s.replace(/⏎/g, '\n').replace(/\\\|/g, '|').trim();

const nsList = () => readdirSync(join(LOC, 'en')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
const readJson = (lang, ns) => { const f = join(LOC, lang, `${ns}.json`); return existsSync(f) ? flat(JSON.parse(readFileSync(f, 'utf8'))) : {}; };

// ── EXPORT: repo → brain ───────────────────────────────────────────────────
function renderMd(ns, lang, en, tr) {
  const keys = Object.keys(en);
  const done = keys.filter(k => tr[k] !== undefined && tr[k] !== '').length;
  const L = lang.toUpperCase();
  const isEn = lang === 'en';
  const fm = [
    '---',
    `namespace: ${ns}`, `lang: ${lang}`, `lang_native: "${NATIVE[lang]}"`,
    `keys: ${keys.length}`, `translated: ${isEn ? keys.length : done}`,
    `coverage: ${isEn ? 100 : Math.round(done / keys.length * 100)}`,
    `app: ${appName}`, `source: ${APP.loc}/${lang}/${ns}.json`,
    `updated: ${today}`, 'generated_by: scripts/sync-ui-strings.mjs',
    `type: ui_strings_${appName}`, `status: ${isEn ? 'source' : done === keys.length ? 'complete' : done ? 'partial' : 'todo'}`,
    '---', '',
    `# ${ns} · ${L}`, '',
    isEn
      ? `> ↑ [[${APP.index}]] · **SPECCHIO del repo, sola lettura**: si rigenera con \`--export\`. Per cambiare una stringa EN si edita il JSON nel repo, non questo file.`
      : `> ↑ [[${APP.index}]] · sorgente EN: [[010_ThaiAkha_com/${APP.brain}/EN/${ns}|${ns} EN]] · Traduci la colonna **${L}** (lascia vuoto = fallback EN). Poi: \`node scripts/sync-ui-strings.mjs --app ${appName} --import ${lang}\` (passa \`check-ui-strings\`).`,
    '',
    `> ${isEn ? `${keys.length} chiavi` : `**${done}/${keys.length}** tradotte`} · placeholder \`{{x}}\` vanno lasciati IDENTICI · celle: \`\\|\` = pipe, \`⏎\` = a capo`,
    '',
    isEn ? '| chiave | EN |' : `| chiave | EN | ${L} |`,
    isEn ? '|---|---|' : '|---|---|---|',
  ];
  for (const k of keys) fm.push(isEn ? `| \`${k}\` | ${esc(en[k])} |` : `| \`${k}\` | ${esc(en[k])} | ${esc(tr[k] ?? '')} |`);
  return fm.join('\n') + '\n';
}

function doExport() {
  const nss = nsList(); let n = 0;
  for (const lang of LANGS) {
    const dir = join(BRAIN, lang.toUpperCase()); mkdirSync(dir, { recursive: true });
    for (const ns of nss) {
      const en = readJson('en', ns), tr = lang === 'en' ? en : readJson(lang, ns);
      writeFileSync(join(dir, `${ns}.md`), renderMd(ns, lang, en, tr)); n++;
    }
  }
  console.log(`export [${appName}]: ${n} file (${LANGS.length} lingue × ${nss.length} namespace) → ${BRAIN}`);
}

// ── IMPORT: brain → repo (con check) ───────────────────────────────────────
function parseMd(file) {
  const rows = readFileSync(file, 'utf8').split('\n').filter(l => l.startsWith('| `'));
  const out = {};
  for (const l of rows) {
    const cells = l.slice(1, -1).split(/(?<!\\)\|/).map(c => c.trim());
    const key = cells[0].replace(/^`|`$/g, ''); const val = unesc(cells[2] ?? '');
    if (val !== '') out[key] = val;
  }
  return out;
}
function doImport(langs) {
  if (!langs.length) { console.error('--import richiede almeno una lingua: --import es'); process.exit(1); }
  for (const lang of langs) {
    if (!LANGS.includes(lang) || lang === 'en') { console.error(`lingua non valida: ${lang}`); process.exit(1); }
    const dir = join(BRAIN, lang.toUpperCase());
    if (!existsSync(dir)) { console.error(`manca ${dir} — fai prima --export`); process.exit(1); }
    const outDir = join(LOC, lang); mkdirSync(outDir, { recursive: true });
    let files = 0, keys = 0;
    for (const ns of nsList()) {
      const f = join(dir, `${ns}.md`); if (!existsSync(f)) continue;
      const m = parseMd(f); if (!Object.keys(m).length) continue;
      // ARRAY: tutto o niente. i18next fa fallback per CHIAVE, non per
      // elemento: `monthsShort` con 1 mese su 12 darebbe undefined su [5].
      // Un array parziale viene scartato (resta EN) e segnalato.
      const en = readJson('en', ns);
      const arrays = new Map(); // base → [tutte le chiavi EN dell'array]
      for (const k of Object.keys(en)) { const b = k.match(/^(.*?)\[\d+\]/)?.[1]; if (b) (arrays.get(b) ?? arrays.set(b, []).get(b)).push(k); }
      for (const [base, allKeys] of arrays) {
        const have = allKeys.filter(k => m[k] !== undefined).length;
        if (have > 0 && have < allKeys.length) {
          console.warn(`  ⚠️ ${ns}: array \`${base}\` parziale (${have}/${allKeys.length}) → scartato, resta EN. Traducilo tutto.`);
          for (const k of allKeys) delete m[k];
        }
      }
      if (!Object.keys(m).length) continue;
      writeFileSync(join(outDir, `${ns}.json`), JSON.stringify(unflat(m), null, 2) + '\n');
      files++; keys += Object.keys(m).length;
    }
    console.log(`import ${lang}: ${files} namespace, ${keys} chiavi → ${outDir}`);
    try { execSync(`node scripts/check-ui-strings.mjs --app ${appName} --lang ${lang}`, { cwd: REPO, stdio: 'inherit' }); }
    catch { console.error(`\n❌ check-ui-strings FALLITO per ${lang}: correggi nel brain e rilancia. I JSON scritti NON vanno committati così.`); process.exit(1); }
  }
  console.log('\n✓ import ok. Ora: --export (per riallineare gli specchi) e commit dei JSON.');
}

// ── STATUS ─────────────────────────────────────────────────────────────────
function doStatus() {
  const nss = nsList(); const total = nss.reduce((n, ns) => n + Object.keys(readJson('en', ns)).length, 0);
  console.log(`[${appName}] EN: ${nss.length} namespace, ${total} chiavi\n`);
  for (const lang of LANGS.filter(l => l !== 'en')) {
    const dir = join(BRAIN, lang.toUpperCase()); let done = 0;
    if (existsSync(dir)) for (const ns of nss) { const f = join(dir, `${ns}.md`); if (existsSync(f)) done += Object.keys(parseMd(f)).length; }
    const bar = '█'.repeat(Math.round(done / total * 20)).padEnd(20, '░');
    console.log(`${lang}  ${bar} ${String(done).padStart(4)}/${total} (${Math.round(done / total * 100)}%)`);
  }
}

const run = { export: doExport, import: () => doImport(targetLangs), status: doStatus }[mode];
if (run) run(); else console.error(`modo sconosciuto: --${mode} (usa [--app front|admin] --export | --import <lang…> | --status)`);
