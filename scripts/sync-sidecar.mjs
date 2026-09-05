#!/usr/bin/env node
// Il merge dei sidecar *_translations ha UNA sorgente: packages/shared/src/lib/mergeTranslation.ts.
// Le edge function girano su Deno e non importano da @thaiakha/shared, quindi
// supabase/functions/_shared/sidecar.ts e' una COPIA (prima riga = marcatore).
//   pnpm sync-sidecar          -> rigenera la copia dalla sorgente
//   pnpm check-sidecar         -> exit 1 se la copia diverge (gira anche in CI: entrambi i file sono nel repo)
// Stesso patto di sync-prompts (regola 12) e delle skill copiate (CLAUDE.md, "una copia che
// ha smesso di essere una copia e' peggio di un file mancante").
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'packages/shared/src/lib/mergeTranslation.ts');
const DST = resolve(ROOT, 'supabase/functions/_shared/sidecar.ts');
const HEADER = '// COPIA GENERATA da packages/shared/src/lib/mergeTranslation.ts - NON editare qui: `pnpm sync-sidecar` (controllo: `pnpm check-sidecar`).\n';

const check = process.argv.includes('--check');
if (!existsSync(SRC)) { console.error(`[sync-sidecar] sorgente mancante: ${SRC}`); process.exit(1); }
const expected = HEADER + readFileSync(SRC, 'utf8');

if (check) {
  const actual = existsSync(DST) ? readFileSync(DST, 'utf8') : '';
  if (actual !== expected) {
    console.error('[sync-sidecar] DIVERGED supabase/functions/_shared/sidecar.ts differisce da shared/lib/mergeTranslation.ts. Esegui: pnpm sync-sidecar');
    process.exit(1);
  }
  console.log('[sync-sidecar] la copia Deno coincide con la sorgente');
} else {
  writeFileSync(DST, expected);
  console.log('[sync-sidecar] packages/shared/src/lib/mergeTranslation.ts -> supabase/functions/_shared/sidecar.ts');
}
