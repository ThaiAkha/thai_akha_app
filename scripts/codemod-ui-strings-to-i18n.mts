/**
 * codemod ui-strings → i18next  (passo 1, one-shot; resta come storia).
 *
 *   t.quiz.hint.title            → t('quiz:hint.title')
 *   t.common.welcomeBack({name}) → t('common:welcomeBack', {name})
 *   t.errors.couldNotLoad('x')   → t('errors:couldNotLoad', { resource: 'x' })   (posizionale → nominato)
 *   import { t } from '@thaiakha/shared/lib/ui-strings'  →  import { t } from '../i18n' (path relativo)
 *
 * Il caso con LOGICA (recipes.headerDescReady) NON viene toccato dal codemod:
 * lo si riscrive a mano nel componente con le due chiavi.
 *
 * Non tocca `t` che non siano quelli importati da ui-strings (es. il `t` tema
 * di StyleColorsTab): lavora SOLO nei file che hanno quell'import.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { relative, dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const FRONT = join(ROOT, 'packages/front/src');
const I18N = join(FRONT, 'i18n');

// Nomi dei parametri posizionali (fn con firma `(x: T) => ...`), dal sorgente.
const src = readFileSync(join(ROOT, 'packages/shared/src/lib/ui-strings.ts'), 'utf8');
const positional = new Map<string, string>(); // "errors.couldNotLoad" → "resource"
{
  const nsRe = /^  ([a-zA-Z]+): \{/gm; let m: RegExpExecArray | null; const nsAt: [number, string][] = [];
  while ((m = nsRe.exec(src))) nsAt.push([m.index, m[1]]);
  const fnRe = /^\s+([a-zA-Z]+): \(([a-zA-Z_$][\w$]*)\s*:\s*[^,)=]+\)\s*=>/gm;
  while ((m = fnRe.exec(src))) {
    const ns = [...nsAt].reverse().find(([i]) => i < m!.index)?.[1];
    if (ns) positional.set(`${ns}.${m[1]}`, m[2]);
  }
}

const files = execSync(`grep -rl "ui-strings" ${FRONT} --include='*.ts' --include='*.tsx'`, { encoding: 'utf8' })
  .trim().split('\n').filter(f => f && !f.includes('/i18n/'));

let total = 0, calls = 0, positionalFixed = 0;
const skipped: string[] = [];

// t.ns.key.sub (opzionale chiamata con parentesi bilanciate a un livello)
const ACCESS = /\bt\.([a-zA-Z]+)((?:\.[a-zA-Z0-9]+)+)(\((?:[^()]|\([^()]*\))*\))?/g;

for (const f of files) {
  let s = readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(ACCESS, (whole, ns: string, rest: string, call?: string) => {
    const path = rest.slice(1); // "hint.title"
    const full = `${ns}.${path}`;
    if (full === 'recipes.headerDescReady') { skipped.push(`${relative(ROOT, f)}: ${whole}`); return whole; }
    total++;
    if (!call) return `t('${ns}:${path}')`;
    calls++;
    const inner = call.slice(1, -1).trim();
    const pos = positional.get(full);
    if (pos && !inner.startsWith('{')) { positionalFixed++; return `t('${ns}:${path}', { ${pos}: ${inner} })`; }
    return `t('${ns}:${path}', ${inner})`;
  });
  // import: path relativo verso src/i18n
  let rel = relative(dirname(f), I18N).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  s = s.replace(/import \{ t \} from '@thaiakha\/shared\/lib\/ui-strings';/, `import { t } from '${rel}';`);
  if (s !== before) writeFileSync(f, s);
}
console.log(`${files.length} file · ${total} accessi convertiti (${calls} con argomenti, ${positionalFixed} posizionali→nominati)`);
if (skipped.length) console.log(`⚠️ da riscrivere a mano (logica):\n  ${skipped.join('\n  ')}`);
