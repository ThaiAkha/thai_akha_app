#!/usr/bin/env node
// Cherry prompt files: the MASTER lives in the brain (not versioned), the repo keeps
// tracked COPIES so CI/Firebase can build (symlinks to /Users/... never resolve on GitHub).
//   pnpm sync-prompts          → copy brain → repo (run before committing a prompt change)
//   pnpm sync-prompts --check  → exit 1 if a repo copy differs from its brain master
//                                (skips silently when the brain is not on this machine, e.g. CI)
// Rule 12 (CLAUDE.md): edit the master in the brain, never the copy.
import { cpSync, existsSync, readFileSync, readdirSync, statSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BRAIN = process.env.THAI_AKHA_BRAIN
  ?? resolve(ROOT, '..', 'thai_akha_brain', '000_Core_Agents', '030_Cherry', '033_App_Prompts');

// master (relative to BRAIN) → copy (relative to ROOT)
const MAP = [
  ['800_Admin/adminAgents.ts',  'packages/admin/src/prompts/adminAgents.ts'],
  ['800_Admin/adminPrompt.ts',  'packages/admin/src/prompts/adminPrompt.ts'],
  ['801_Front/cherryPrompt.ts', 'packages/front/src/prompts/cherryPrompt.ts'],
  ['801_Front/subagents',       'packages/front/src/prompts/subagents'],
];
const SKIP = (name) => name === '.DS_Store' || name.endsWith('.md');

const check = process.argv.includes('--check');

if (!existsSync(BRAIN)) {
  console.log(`[sync-prompts] brain not found at ${BRAIN} → ${check ? 'check skipped' : 'nothing to sync'}`);
  process.exit(0);
}

const hash = (p) => createHash('sha1').update(readFileSync(p)).digest('hex');
const listFiles = (p) => statSync(p).isDirectory()
  ? readdirSync(p).filter((n) => !SKIP(n)).flatMap((n) => listFiles(join(p, n)))
  : [p];

let diverged = 0;
for (const [src, dst] of MAP) {
  const a = join(BRAIN, src), b = join(ROOT, dst);
  if (!existsSync(a)) { console.error(`[sync-prompts] master missing: ${a}`); process.exit(1); }
  if (check) {
    const rel = (base, f) => f.slice(base.length);
    const A = new Map(listFiles(a).map((f) => [rel(a, f), hash(f)]));
    const B = existsSync(b) ? new Map(listFiles(b).map((f) => [rel(b, f), hash(f)])) : new Map();
    const keys = new Set([...A.keys(), ...B.keys()]);
    for (const k of keys) if (A.get(k) !== B.get(k)) { diverged++; console.error(`[sync-prompts] DIVERGED ${dst}${k}`); }
  } else {
    if (existsSync(b)) rmSync(b, { recursive: true, force: true });
    mkdirSync(dirname(b), { recursive: true });
    cpSync(a, b, { recursive: true, filter: (s) => !SKIP(s.split('/').pop()) });
    console.log(`[sync-prompts] ${src} → ${dst}`);
  }
}
if (check) {
  if (diverged) { console.error(`[sync-prompts] ${diverged} file(s) differ from the brain master. Run: pnpm sync-prompts`); process.exit(1); }
  console.log('[sync-prompts] copies match the brain masters');
}
