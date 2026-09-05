import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { LegalDocument, LegalDocumentSection } from '../types/legal.types';
import { mergeLegalTranslation, type MergedLegalDocument } from '../lib/mergeLegalTranslation';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '../lib/mergeTranslation';

/**
 * useLegalDocument — legge un documento legale dalla centrale `legal_documents`.
 *
 * DUAL-READ (temporaneo, una sola release): finche' i documenti hanno
 * is_published = false la RLS pubblica non restituisce nulla, quindi si ricade su
 * `info_page_sections` (la vecchia sorgente, ancora is_active = true) e la pagina
 * continua a funzionare identica. Quando /terms pubblichera' i documenti, il primo
 * ramo iniziera' a rispondere da solo; il fallback si rimuove in una PR successiva.
 *
 * La forma restituita e' sempre LegalDocument: i renderer non cambiano.
 */

type Source = 'legal_documents' | 'info_page_sections' | null;

interface DbBlock { type?: string; text?: string; title?: string }
interface DbSection {
  section_order: number;
  heading: string;
  anchor: string | null;
  body: DbBlock[];
}

/** DB -> LegalDocumentSection[]. Copia verbatim: nessuna normalizzazione del testo. */
function toSections(body: DbSection[]): LegalDocumentSection[] {
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

/** Ramo nuovo: la centrale. Ritorna null se la riga non c'e' o non e' pubblicata (RLS). */
async function fromLegalDocuments(docKey: string): Promise<LegalDocument | null> {
  const { data, error } = await supabase
    .from('legal_documents')
    .select('doc_key, title, legal_version, date_published, date_modified, body')
    .eq('doc_key', docKey)
    .maybeSingle();

  if (error || !data) return null;
  const sections = toSections(data.body as unknown as DbSection[]);
  if (sections.length === 0) return null;

  return {
    id: data.doc_key,
    version: data.legal_version ?? '',
    title: data.title ?? '',
    effectiveDate: data.date_published ?? '',
    lastUpdated: data.date_modified ?? '',
    sections,
  };
}

/** Ramo legacy: info_page_sections + meta da site_metadata (come faceva getInfoPage). */
async function fromInfoPageSections(pageSlug: string, lang = 'en'): Promise<LegalDocument | null> {
  // Anche il ramo legacy legge tradotto: finche' i documenti della centrale non sono
  // pubblicati, e' QUESTO che serve le pagine Terms/Privacy, e lasciarlo inglese
  // significherebbe legale in inglese sotto ogni prefisso lingua.
  const sectionsQuery = sidecarFilter(supabase
    .from('info_page_sections')
    .select('heading, body, section_order, anchor'
      + sidecarJoin('info_page_sections_translations', ['heading', 'body'], lang))
    .eq('page_slug', pageSlug)
    .eq('is_active', true)
    .order('section_order', { ascending: true }), lang);
  const [meta, sectionsRes] = await Promise.all([
    supabase
      .from('site_metadata')
      .select('legal_version, date_published, date_modified')
      .eq('page_slug', pageSlug)
      .maybeSingle(),
    sectionsQuery,
  ]);

  if (sectionsRes.error || !sectionsRes.data) return null;
  const sections = toSections(
    mergeSidecarRows<DbSection>(sectionsRes.data, lang),
  );
  if (sections.length === 0) return null;

  return {
    id: pageSlug,
    version: meta.data?.legal_version ?? '',
    title: '',
    effectiveDate: meta.data?.date_published ?? '',
    lastUpdated: meta.data?.date_modified ?? '',
    sections,
  };
}

/**
 * Traduzione PUBBLICATA per un documento. Ritorna null se non esiste (o RLS la nasconde).
 * Nota: la policy richiede is_published = true sia sulla traduzione sia sul documento padre.
 */
async function fromTranslation(docKey: string, lang: string): Promise<LegalDocument | null> {
  const { data, error } = await supabase
    .from('legal_documents_translations')
    .select('lang, title, body, source_version, legal_documents!inner(doc_key)')
    .eq('lang', lang)
    .eq('is_published', true)
    .eq('legal_documents.doc_key', docKey)
    .maybeSingle();

  if (error || !data) return null;
  const sections = toSections(data.body as unknown as DbSection[]);
  if (sections.length === 0) return null;

  return {
    id: `${docKey}_${lang}`,
    version: data.source_version ?? '',
    title: data.title ?? '',
    effectiveDate: '',
    lastUpdated: '',
    sections,
  };
}

export interface UseLegalDocumentResult {
  /** Documento gia' FUSO con la traduzione: sempre completo, mai con sezioni mancanti. */
  doc: MergedLegalDocument | null;
  loading: boolean;
  /** Da quale sorgente arriva il documento mostrato: utile per verificare il cutover. */
  source: Source;
}

export interface UseLegalDocumentOptions {
  /**
   * Slug legacy in info_page_sections per il DUAL-READ. Serve SOLO ai documenti front
   * (rollback finche' il cutover non e' verificato). Gli agency non hanno sorgente
   * legacy: omettendolo, niente fallback.
   */
  fallbackPageSlug?: string;
  /** Lingua desiderata (es. 'th'). Se assente o senza traduzione si mostra l'originale. */
  lang?: string | null;
}

export function useLegalDocument(
  docKey: string,
  options: UseLegalDocumentOptions = {},
): UseLegalDocumentResult {
  const { fallbackPageSlug, lang } = options;
  const [doc, setDoc] = useState<MergedLegalDocument | null>(null);
  const [source, setSource] = useState<Source>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      // La traduzione si chiede solo se serve davvero: per l'inglese e' una query in meno.
      const wantsTranslation = Boolean(lang && lang !== 'en');
      const [fresh, translation] = await Promise.all([
        fromLegalDocuments(docKey),
        wantsTranslation ? fromTranslation(docKey, lang as string) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      if (fresh) {
        setDoc(mergeLegalTranslation(fresh, translation, wantsTranslation ? lang : null));
        setSource('legal_documents');
        setLoading(false);
        return;
      }

      // Fallback legacy solo se la pagina ne ha uno (documenti front).
      const legacy = fallbackPageSlug ? await fromInfoPageSections(fallbackPageSlug, lang ?? 'en') : null;
      if (cancelled) return;
      setDoc(legacy ? mergeLegalTranslation(legacy, null, null) : null);
      setSource(legacy ? 'info_page_sections' : null);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [docKey, fallbackPageSlug, lang]);

  return { doc, loading, source };
}

export default useLegalDocument;
