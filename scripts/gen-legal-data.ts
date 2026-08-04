/**
 * gen-legal-data.ts - genera i file legali di packages/shared/src/data/legal/
 * a partire dalla tabella Supabase legal_documents (+ legal_documents_translations).
 *
 * Uso:  pnpm gen-legal
 *
 * Perche' esiste: il DATABASE e' la fonte di authoring dei 4 documenti legali (i master
 * vivono nel brain e vengono pubblicati in legal_documents). I file .ts sono uno SPECCHIO
 * generato, letto da Cherry (RAG locale, zero query a runtime) e dal modale legale admin.
 * Non si editano a mano: si aggiorna il DB e si rilancia questo script.
 *
 * Legge con la SERVICE ROLE KEY perche' i documenti sono ancora is_published = false e
 * la RLS pubblica non li restituirebbe.
 *
 * REGOLA CRITICA SULLE TRADUZIONI: se per un documento non esiste una traduzione
 * PUBBLICATA, il file *TH esporta `null`, mai una copia dell'inglese. Un alias
 * all'inglese servirebbe a un utente thai un testo che non puo' leggere e glielo
 * farebbe accettare: `null` dice la verita', l'app fa fallback esplicito con `??`.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[gen-legal] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono obbligatorie (usa --env-file=.env).');
  process.exit(1);
}

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../packages/shared/src/data/legal');

/** I 4 documenti e il file/export che generano. */
const DOCS = [
  { docKey: 'front_terms', file: 'legalFrontTerms.ts', exportName: 'TERMS_OF_SERVICE' },
  { docKey: 'front_policy', file: 'legalFrontPolicy.ts', exportName: 'PRIVACY_POLICY' },
  { docKey: 'agency_terms', file: 'legalAgencyTerms.ts', exportName: 'AGENCY_TERMS' },
  { docKey: 'agency_policy', file: 'legalAgencyPolicy.ts', exportName: 'AGENCY_PRIVACY' },
] as const;

/**
 * Le traduzioni previste, una voce per ogni coppia (doc_key, lang).
 *
 * Lista STATICA di proposito: se il database pubblica una traduzione che non e'
 * qui, il generatore ABORTA (vedi l'invariante in main). Meglio fermarsi che
 * scrivere nel vuoto una traduzione che nessuna app servirebbe.
 *
 * Stato al 2026-07-30: tutte e sei sono pubblicate e complete (13/13 sezioni),
 * quindi nessuno di questi file deve uscire a null. Se succede, il generatore
 * non sta leggendo la riga: e' un bug, non lo stato normale.
 */
const TRANSLATIONS = [
  { docKey: 'agency_terms', lang: 'th', file: 'legalAgencyTermsTH.ts', exportName: 'AGENCY_TERMS_TH' },
  { docKey: 'agency_policy', lang: 'th', file: 'legalAgencyPolicyTH.ts', exportName: 'AGENCY_PRIVACY_TH' },
  { docKey: 'agency_terms', lang: 'zh', file: 'legalAgencyTermsZH.ts', exportName: 'AGENCY_TERMS_ZH' },
  { docKey: 'agency_policy', lang: 'zh', file: 'legalAgencyPolicyZH.ts', exportName: 'AGENCY_PRIVACY_ZH' },
  { docKey: 'agency_terms', lang: 'es', file: 'legalAgencyTermsES.ts', exportName: 'AGENCY_TERMS_ES' },
  { docKey: 'agency_policy', lang: 'es', file: 'legalAgencyPolicyES.ts', exportName: 'AGENCY_PRIVACY_ES' },
] as const;

interface DbBlock { type?: string; text?: string; title?: string }
interface DbSection {
  section_order: number;
  heading: string;
  anchor: string | null;
  body: DbBlock[];
}

/**
 * DB -> forma LegalDocument usata dai renderer.
 * Copia VERBATIM: markdown (**bold**, *italic*, [label](/path)) e bullet "• " restano
 * come sono. Normalizzare qui vorrebbe dire riscrivere un testo legale.
 */
function toSections(body: DbSection[]) {
  return (body ?? []).map((s) => {
    const blocks = s.body ?? [];
    const paragraphs = blocks.filter((b) => (b.type ?? 'paragraph') === 'paragraph').map((b) => b.text ?? '');
    const subsections = blocks
      .filter((b) => b.type === 'subsection')
      .map((b) => ({ title: b.title ?? '', content: b.text ?? '' }));
    const notes = blocks.filter((b) => b.type === 'note').map((b) => b.text ?? '');

    return {
      title: s.heading,
      ...(s.anchor ? { anchor: s.anchor } : {}),
      ...(paragraphs.length ? { content: paragraphs.length === 1 ? paragraphs[0] : paragraphs } : {}),
      ...(subsections.length ? { subsections } : {}),
      ...(notes.length ? { notes } : {}),
    };
  });
}

function header(docKey: string, version: string, generatedAt: string) {
  return [
    '// GENERATO DA legal_documents - NON EDITARE A MANO',
    `// doc_key: ${docKey} | versione: ${version} | generato: ${generatedAt}`,
    '// Per cambiare il testo: aggiorna il DB (master nel brain), poi `pnpm gen-legal`.',
    '',
  ].join('\n');
}

function renderDocFile(exportName: string, docKey: string, version: string, doc: unknown, generatedAt: string) {
  return [
    header(docKey, version, generatedAt),
    "import type { LegalDocument } from '../../types/legal.types';",
    '',
    `export const ${exportName}: LegalDocument = ${JSON.stringify(doc, null, 2)};`,
    '',
  ].join('\n');
}

function renderNullTranslationFile(exportName: string, docKey: string, lang: string, generatedAt: string) {
  // Il nome dell'export inglese si ricava dal docKey: cosi' il commento cita sempre
  // la coppia giusta, invece di una fissata a mano che diverge dal file che la contiene.
  const baseExport = DOCS.find((d) => d.docKey === docKey)?.exportName ?? 'il documento inglese';
  return [
    '// GENERATO DA legal_documents_translations - NON EDITARE A MANO',
    `// doc_key: ${docKey} | lang: ${lang} | generato: ${generatedAt}`,
    `// Nessuna traduzione ${lang.toUpperCase()} PUBBLICATA: si esporta null, NON una copia`,
    `// dell'inglese. L'app passa questo null a mergeLegalTranslation, che rende`,
    `// ${baseExport} per intero: servire l inglese spacciandolo per traduzione`,
    `// farebbe accettare a un utente ${lang} un testo che non puo leggere.`,
    '',
    "import type { LegalDocument } from '../../types/legal.types';",
    '',
    `export const ${exportName}: LegalDocument | null = null;`,
    '',
  ].join('\n');
}

function renderIndexFile(generatedAt: string) {
  const lines = [
    '// GENERATO DA gen-legal-data.ts - NON EDITARE A MANO',
    `// generato: ${generatedAt}`,
    '',
    ...DOCS.map((d) => `export * from './${d.file.replace(/\.ts$/, '')}';`),
    ...TRANSLATIONS.map((t) => `export * from './${t.file.replace(/\.ts$/, '')}';`),
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });
  const generatedAt = new Date().toISOString().slice(0, 10);

  const { data: docs, error: docsErr } = await supabase
    .from('legal_documents')
    .select('doc_key, page_slug, title, legal_version, date_published, date_modified, body');
  if (docsErr) throw new Error(`[gen-legal] lettura legal_documents: ${docsErr.message}`);

  const { data: trans, error: transErr } = await supabase
    .from('legal_documents_translations')
    .select('document_id, lang, title, body, source_version, is_published, legal_documents!inner(doc_key)')
    .eq('is_published', true);
  if (transErr) throw new Error(`[gen-legal] lettura legal_documents_translations: ${transErr.message}`);

  const byKey = new Map((docs ?? []).map((d) => [d.doc_key as string, d]));

  // INVARIANTE: tutti i documenti attesi devono esistere. Meglio fallire che generare a meta'.
  const missing = DOCS.filter((d) => !byKey.has(d.docKey)).map((d) => d.docKey);
  if (missing.length > 0) {
    console.error(`[gen-legal] ABORT: doc_key mancanti in legal_documents: ${missing.join(', ')}`);
    console.error('[gen-legal] Nessun file e stato scritto.');
    process.exit(1);
  }

  // DUE FASI. Prima si rende tutto in memoria e si validano gli invarianti, poi si
  // scrive. Abortire a meta' loop lascerebbe un corpus misto (2 file nuovi + 2 vecchi
  // + index stantio) che compila ma mescola versioni legali diverse.
  const pending: Array<{ path: string; content: string; log: string }> = [];

  for (const d of DOCS) {
    const row = byKey.get(d.docKey)!;
    const sections = toSections(row.body as unknown as DbSection[]);
    if (sections.length === 0) {
      console.error(`[gen-legal] ABORT: ${d.docKey} ha body vuoto. NESSUN file scritto.`);
      process.exit(1);
    }
    const doc = {
      id: row.doc_key,
      version: row.legal_version,
      title: row.title,
      effectiveDate: row.date_published ?? '',
      lastUpdated: row.date_modified ?? '',
      sections,
    };
    pending.push({
      path: resolve(OUT_DIR, d.file),
      content: renderDocFile(d.exportName, d.docKey, row.legal_version as string, doc, generatedAt),
      log: `${d.file}  <- ${d.docKey} v${row.legal_version} (${sections.length} sezioni)`,
    });
  }

  const transByKeyLang = new Map(
    (trans ?? []).map((t) => {
      const parent = t.legal_documents as unknown as { doc_key: string } | null;
      return [`${parent?.doc_key}:${t.lang}`, t];
    }),
  );

  for (const t of TRANSLATIONS) {
    const row = transByKeyLang.get(`${t.docKey}:${t.lang}`);
    if (!row) {
      pending.push({
        path: resolve(OUT_DIR, t.file),
        content: renderNullTranslationFile(t.exportName, t.docKey, t.lang, generatedAt),
        log: `${t.file}  <- nessuna traduzione ${t.lang} pubblicata: export null`,
      });
    } else {
      const sections = toSections(row.body as unknown as DbSection[]);
      if (sections.length === 0) {
        console.error(`[gen-legal] ABORT: traduzione ${t.docKey}/${t.lang} pubblicata ma con body vuoto. NESSUN file scritto.`);
        process.exit(1);
      }
      const parentRow = byKey.get(t.docKey)!;
      const doc = {
        id: `${t.docKey}_${t.lang}`,
        version: row.source_version,
        title: row.title ?? parentRow.title,
        effectiveDate: parentRow.date_published ?? '',
        lastUpdated: parentRow.date_modified ?? '',
        sections,
      };
      pending.push({
        path: resolve(OUT_DIR, t.file),
        content: renderDocFile(t.exportName, `${t.docKey} (${t.lang})`, row.source_version as string, doc, generatedAt),
        log: `${t.file}  <- traduzione ${t.lang} v${row.source_version} (${sections.length} sezioni)`,
      });
    }
  }

  // INVARIANTE: ogni traduzione pubblicata deve corrispondere a un file previsto.
  // Se ne arriva una per un doc_key/lang non mappato, e' una traduzione che nessuno
  // servirebbe: meglio fermarsi che pubblicarla nel vuoto.
  const expected = new Set(TRANSLATIONS.map((t) => `${t.docKey}:${t.lang}`));
  for (const key of transByKeyLang.keys()) {
    if (!expected.has(key)) {
      console.error(`[gen-legal] ABORT: traduzione pubblicata non mappata (${key}). Aggiorna TRANSLATIONS. NESSUN file scritto.`);
      process.exit(1);
    }
  }

  // AVVISI (non bloccanti: il file si genera comunque, ma l'operatore deve saperlo).
  // 1. source_version disallineata dalla legal_version del documento: a runtime
  //    mergeLegalTranslation SCARTA la traduzione e mostra l'inglese. Senza questo
  //    avviso si vedrebbe un `pnpm gen-legal` tutto verde mentre le lingue degradano
  //    silenziosamente - e ora sono sei, non una.
  // 2. ancore non allineate all'originale: quelle mancanti diventano sezioni in
  //    inglese (parziale). E' legittimo, ma non deve passare inosservato.
  for (const t of TRANSLATIONS) {
    const row = transByKeyLang.get(`${t.docKey}:${t.lang}`);
    if (!row) continue;
    const parent = byKey.get(t.docKey)!;

    if (row.source_version !== parent.legal_version) {
      console.warn(
        `[gen-legal] ATTENZIONE: ${t.docKey}/${t.lang} ha source_version ${row.source_version} ` +
        `ma il documento e' alla ${parent.legal_version}. A runtime la traduzione viene SCARTATA ` +
        `e si mostra l'inglese. Va ritradotta o riallineata.`,
      );
    }

    const parentAnchors = new Set(
      ((parent.body ?? []) as unknown as DbSection[]).map((s) => s.anchor).filter(Boolean),
    );
    const trAnchors = new Set(
      ((row.body ?? []) as unknown as DbSection[]).map((s) => s.anchor).filter(Boolean),
    );
    const missing = [...parentAnchors].filter((a) => !trAnchors.has(a));
    const extra = [...trAnchors].filter((a) => !parentAnchors.has(a));
    if (missing.length > 0) {
      console.warn(`[gen-legal] ATTENZIONE: ${t.docKey}/${t.lang} non traduce ${missing.length} sezioni (${missing.join(', ')}): resteranno in inglese.`);
    }
    if (extra.length > 0) {
      console.warn(`[gen-legal] ATTENZIONE: ${t.docKey}/${t.lang} ha ancore che l'originale non ha (${extra.join(', ')}): non verranno mai mostrate.`);
    }
  }

  pending.push({ path: resolve(OUT_DIR, 'index.ts'), content: renderIndexFile(generatedAt), log: 'index.ts' });

  mkdirSync(OUT_DIR, { recursive: true });
  for (const f of pending) {
    writeFileSync(f.path, f.content, 'utf8');
    console.log(`[gen-legal] ${f.log}`);
  }

  console.log(`[gen-legal] Fatto: ${pending.length} file in ${OUT_DIR}`);
  console.log(`[gen-legal] Traduzioni pubblicate trovate: ${trans?.length ?? 0}`);
}

main().catch((e) => {
  console.error('[gen-legal] ERRORE:', e instanceof Error ? e.message : e);
  process.exit(1);
});
