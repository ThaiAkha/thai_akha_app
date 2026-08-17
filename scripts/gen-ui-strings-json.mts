/**
 * ⚠️ STORICO — non gira più: la sorgente ui-strings.ts è stata ELIMINATA il
 * 2026-08-17 dopo la migrazione (git: 05bfda9^). I JSON in locales/en/ sono
 * ORA la sorgente e si editano a mano. Resta come documentazione del come.
 *
 * gen-ui-strings-json — passo 1 della migrazione ui-strings → i18next.
 *
 * Legge l'oggetto `t` da packages/shared/src/lib/ui-strings.ts (eseguendolo)
 * e scrive packages/front/src/i18n/locales/en/{namespace}.json — un file per
 * namespace top-level, chiavi annidate identiche all'oggetto.
 *
 * Funzioni con parametri → stringhe con interpolazione i18next:
 *   ({ name }) => `Welcome back, ${name}`   →   "Welcome back, {{name}}"
 * Il nome del parametro lo prendiamo eseguendo la funzione con un Proxy che
 * registra le proprietà lette: zero parsing di sorgente, zero regex fragili.
 *
 * Idempotente. Uso: node --import tsx scripts/gen-ui-strings-json.mts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'packages/front/src/i18n/locales/en');
mkdirSync(OUT, { recursive: true });

const mod = await import(join(ROOT, 'packages/shared/src/lib/ui-strings.ts'));
const t = mod.t as Record<string, unknown>;

/**
 * Esegue una fn di stringa sostituendo i parametri con {{param}}.
 * Due firme nel sorgente:
 *   ({ name }) => `…${name}`      → Proxy: ogni proprietà letta diventa {{prop}}
 *   (resource: string) => `…`     → posizionale: nome dalla firma, valore = "{{resource}}"
 */
function fnToTemplate(fn: (...a: unknown[]) => string): string {
  const src = fn.toString();
  const positional = src.match(/^\(?\s*([a-zA-Z_$][\w$]*)\s*(?::[^,)=]+)?\s*\)?\s*=>/);
  if (positional && !src.trimStart().startsWith('({')) {
    return fn(`{{${positional[1]}}}`);
  }
  // Proxy: ogni proprietà letta diventa il segnaposto. Se il param viene usato
  // come array/oggetto (join, length…) la fn ha LOGICA e non è un template:
  // la marchiamo, il file JSON riceve chiavi esplicite scritte a mano (sotto).
  const proxy = new Proxy({}, { get: (_o, prop) => typeof prop === 'symbol' ? undefined : `{{${prop}}}` });
  try { return fn(proxy); }
  catch { return '__HAS_LOGIC__'; }
}

/**
 * Funzioni con logica (condizionali, join): NON un template unico. Il pattern
 * i18next è "una chiave per ramo", la logica resta nel componente.
 * Chiave → oggetto JSON da emettere al posto della funzione.
 */
const LOGIC_OVERRIDES: Record<string, unknown> = {
  // recipes.headerDescReady({diet, allergies}) → `${diet} menu ready.` [+ ` Allergen-free: a, b.`]
  'recipes.headerDescReady': '{{diet}} menu ready.',
  'recipes.headerDescReadyAllergies': '{{diet}} menu ready. Allergen-free: {{allergies}}.',
};

const logicSeen: string[] = [];
function convert(v: unknown, path = ''): unknown {
  if (typeof v === 'function') {
    const tpl = fnToTemplate(v as (...a: unknown[]) => string);
    if (tpl === '__HAS_LOGIC__') { logicSeen.push(path); return LOGIC_OVERRIDES[path] ?? `__TODO_LOGIC__(${path})`; }
    return tpl;
  }
  if (Array.isArray(v)) return v.map((x, i) => convert(x, `${path}[${i}]`));
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) {
      const child = `${path}${path ? '.' : ''}${k}`;
      out[k] = convert(x, child);
      // chiavi extra degli override (es. headerDescReadyAllergies) accanto alla base
      for (const [ok, ov] of Object.entries(LOGIC_OVERRIDES)) {
        if (ok.startsWith(child) && ok !== child && !ok.slice(child.length + 1).includes('.') && ok.slice(0, child.lastIndexOf('.') + 1) === child.slice(0, child.lastIndexOf('.') + 1)) {
          /* gestito sotto per il namespace */
        }
      }
    }
    return out;
  }
  return v;
}

let files = 0, keys = 0;
const count = (o: unknown): number =>
  Array.isArray(o) ? 1 : o && typeof o === 'object' ? Object.values(o).reduce((n: number, x) => n + count(x), 0) : 1;

for (const [ns, val] of Object.entries(t)) {
  const json = convert(val, ns) as Record<string, unknown>;
  // chiavi override aggiuntive di questo namespace (es. menu.headerDescReadyAllergies)
  for (const [ok, ov] of Object.entries(LOGIC_OVERRIDES)) {
    const [ons, ...rest] = ok.split('.');
    if (ons !== ns) continue;
    let cur = json; for (const seg of rest.slice(0, -1)) cur = (cur[seg] ??= {}) as Record<string, unknown>;
    cur[rest.at(-1)!] = ov;
  }
  writeFileSync(join(OUT, `${ns}.json`), JSON.stringify(json, null, 2) + '\n');
  files++; keys += count(json);
}
console.log(`${files} namespace → ${OUT}  (${keys} chiavi)`);
if (logicSeen.length) console.log(`fn con logica (override esplicito): ${logicSeen.join(', ')}`);
const todo = logicSeen.filter(p => !(p in LOGIC_OVERRIDES));
if (todo.length) { console.error(`❌ senza override: ${todo.join(', ')}`); process.exit(1); }
