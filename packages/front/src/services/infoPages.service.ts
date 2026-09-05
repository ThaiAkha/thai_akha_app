/**
 * infoPages.service — fonte DB per le pagine info pubbliche (FAQ, Terms, Privacy).
 * Ritorna le STESSE forme UI già usate dalle pagine (FAQCategory[] / LegalDocument)
 * → il render non cambia. RLS lettura pubblica attiva (anon key). Colonne esplicite.
 *
 * Tabelle tipizzate in database.types.ts (faq_*, info_page*); i dati sono mappati
 * sui tipi dominio manuali di @thaiakha/shared (FaqCategoryRow & co.).
 */
import { supabase } from '@thaiakha/shared/lib/supabase';
import { sidecarJoin, sidecarFilter, mergeSidecarRows } from '@thaiakha/shared/lib/mergeTranslation';
import { normalizeLangTag } from '@thaiakha/shared/lib/i18n';
import type { FAQLink, FAQCta } from '@thaiakha/shared/types';
import type {
  LegalDocument,
  LegalDocumentSection,
  FaqCategoryRow,
  FaqCategoryUI,
  FaqQuestionRow,
  FaqCardUI,
  InfoPageSectionRow,
  InfoPageBlock,
} from '@thaiakha/shared';

/** Campi di CONTENUTO dei sidecar usati qui: il resto della riga e' struttura. */
const FAQ_CATEGORY_T_FIELDS = ['title'] as const;
const FAQ_QUESTION_T_FIELDS = ['question', 'answer', 'cta'] as const;
const INFO_SECTION_T_FIELDS = ['heading', 'body'] as const;

// ─── FAQ ──────────────────────────────────────────────────────────────────────
// Categorie universali + domande della LIBRERIA CONDIVISA (entity_type IS NULL):
// le page-specific (entity_type='page') vivono SOLO sulle loro pagine via
// faq_refs e NON entrano nell'accordion hub (duplicerebbero le condivise).
// Selettore hub = entity_type IS NULL AND audience @> {ROLE}: future-proof per
// l'hub agency cambiando solo il ruolo. Ordinate per category.display_order
// poi question.display_order. Forma = FaqCategoryUI[].
// links: la colonna DB è stata unificata dentro cta.links → la forma UI
// (FAQItem.links) resta identica per i renderer (FAQRichAnswer/FAQPage).
export async function getFaqData(lang = 'en'): Promise<FaqCategoryUI[]> {
  const l = normalizeLangTag(lang);
  let catsQuery = supabase
    .from('faq_categories')
    .select('id, category_key, title, image_asset_id, section_id, display_order'
      + sidecarJoin('faq_categories_translations', FAQ_CATEGORY_T_FIELDS, l))
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  let qsQuery = supabase
    .from('faq_questions')
    .select('category_id, question, answer, cta, display_order'
      + sidecarJoin('faq_questions_translations', FAQ_QUESTION_T_FIELDS, l))
    .eq('is_active', true)
    .is('entity_type', null)
    .contains('audience', ['front'])
    .order('display_order', { ascending: true });
  catsQuery = sidecarFilter(catsQuery, l);
  qsQuery = sidecarFilter(qsQuery, l);
  const [{ data: catsData, error: cErr }, { data: qsData, error: qErr }] = await Promise.all([catsQuery, qsQuery]);

  if (cErr || qErr || !catsData || !qsData) {
    console.error('[infoPages] getFaqData:', cErr || qErr);
    return [];
  }

  const cats = mergeSidecarRows<Pick<FaqCategoryRow, 'id' | 'category_key' | 'title' | 'image_asset_id' | 'section_id' | 'display_order'>>(catsData, l);
  const qs = mergeSidecarRows<Pick<FaqQuestionRow, 'category_id' | 'question' | 'answer' | 'cta' | 'display_order'>>(qsData, l);

  return cats.map(c => ({
    id: c.category_key,
    categoryTitle: c.title,
    imageAssetId: c.image_asset_id ?? undefined,
    sectionId: c.section_id ?? undefined,
    items: qs
      .filter(q => q.category_id === c.id)
      .map(q => {
        const cta = (q.cta ?? undefined) as FAQCta | undefined;
        return {
          question: q.question,
          answer: q.answer,
          // Forma UI invariata: i link inline arrivano da cta.links.
          links: (cta?.links ?? undefined) as FAQLink[] | undefined,
          // Il bottone CTA esiste solo se il payload ha label+page.
          cta: cta?.label && cta?.page ? cta : undefined,
        };
      }),
  }));
}

// ─── ENTITY FAQ (faq_questions per entity_type + entity_slug) ───────────────────
// Binding 1:1 per i contenuti (recipe | news | culture | ingredient | category):
// le FAQ della singola entità, ORDER BY display_order. Pronto per TUTTI gli
// entity_type; oggi renderizzato da recipe/news/culture (ingredient e category
// sono wired-but-not-rendered: le loro pagine arriveranno con le campagne future).
export async function getEntityFaqs(
  entityType: string,
  entitySlug: string,
  lang = 'en',
): Promise<FaqCardUI[]> {
  const l = normalizeLangTag(lang);
  const query = sidecarFilter(supabase
    .from('faq_questions')
    .select('faq_key, question, answer, avatar_asset_id, faq_style, display_order, cta'
      + sidecarJoin('faq_questions_translations', FAQ_QUESTION_T_FIELDS, l))
    .eq('entity_type', entityType)
    .eq('entity_slug', entitySlug)
    .eq('is_active', true)
    .contains('audience', ['front'])
    .order('display_order', { ascending: true }), l);
  const { data, error } = await query;

  if (error || !data) {
    console.error('[infoPages] getEntityFaqs:', error);
    return [];
  }
  const rows = mergeSidecarRows<Pick<FaqQuestionRow, 'faq_key' | 'question' | 'answer' | 'avatar_asset_id' | 'faq_style' | 'display_order' | 'cta'>>(data, l);
  return rows.map(r => ({
    name: r.question,
    answerHtml: r.answer,
    avatarAssetId: r.avatar_asset_id ?? undefined,
    key: r.faq_key ?? undefined,
    order: r.display_order,
    style: r.faq_style,
    cta: (r.cta ?? undefined) as FAQCta | undefined,
  }));
}

// ─── PAGE FAQ (site_metadata.faq_refs → faq_questions per faq_key) ──────────────
// Le FAQ mostrate da una pagina sono referenziate per faq_key nell'array ordinato
// site_metadata.faq_refs (N-a-N: la stessa FAQ è riusabile su più pagine, l'ordine
// dell'array = ordine di presentazione). entity_type/entity_slug NON sono più il
// collante pagina↔FAQ. I refs arrivano dal data layer (#86: `useSiteMetadata`),
// qui si risolvono in card. Ritorna [] se non ci sono refs.
// audience: come getFaqData/getEntityFaqs, il front rende solo audience 'front'
// (#58): un ref curato verso una FAQ staff/agency non deve comparire in pagina.
export async function getFaqsByRefs(refs: readonly string[], lang = 'en'): Promise<FaqCardUI[]> {
  if (!Array.isArray(refs) || refs.length === 0) return [];

  const l = normalizeLangTag(lang);
  const query = sidecarFilter(supabase
    .from('faq_questions')
    .select('faq_key, question, answer, avatar_asset_id, faq_style, cta'
      + sidecarJoin('faq_questions_translations', FAQ_QUESTION_T_FIELDS, l))
    .in('faq_key', refs)
    .eq('is_active', true)
    .contains('audience', ['front']), l);
  const { data, error } = await query;

  if (error || !data) {
    console.error('[infoPages] getFaqsByRefs:', error);
    return [];
  }
  const rows = mergeSidecarRows<Pick<FaqQuestionRow, 'faq_key' | 'question' | 'answer' | 'avatar_asset_id' | 'faq_style' | 'cta'>>(data, l);
  const byKey = new Map(rows.map(r => [r.faq_key ?? '', r]));

  // Ordine = ordine dell'array faq_refs; chiavi mancanti/inattive → saltate.
  // Enriched: key/order/style/cta dalla centrale (order = posizione nei refs).
  return refs
    .map(key => byKey.get(key))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r, idx) => ({
      name: r.question,
      answerHtml: r.answer,
      avatarAssetId: r.avatar_asset_id ?? undefined,
      key: r.faq_key ?? undefined,
      order: idx,
      style: r.faq_style,
      cta: (r.cta ?? undefined) as FAQCta | undefined,
    }));
}


// ─── INFO PAGE META (versione/date) — sorgente per la LegalMetaBanner ───────────
// Da site_metadata (info_pages DISMESSA): legal_version + date_published (effective)
// + date_modified (last updated). Slug = page_slug della pagina.
export async function getInfoPageMeta(
  slug: string,
): Promise<{ version: string; effectiveDate: string; lastUpdated: string } | null> {
  const { data, error } = await supabase
    .from('site_metadata')
    .select('legal_version, date_published, date_modified')
    .eq('page_slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('[infoPages] getInfoPageMeta:', error);
    return null;
  }
  return {
    version: data.legal_version ?? '',
    effectiveDate: data.date_published ?? '',
    lastUpdated: data.date_modified ?? '',
  };
}

// ─── INFO PAGE (Terms / Privacy) ───────────────────────────────────────────────
// info_pages DISMESSA: sezioni da info_page_sections per page_slug (colonna diretta),
// meta doc (versione/date) da site_metadata → mappate in LegalDocument (render invariato).
export async function getInfoPage(slug: string, lang = 'en'): Promise<LegalDocument | null> {
  const l = normalizeLangTag(lang);
  // `anchor` NON si traduce: e' l'ancora dei deep-link legali, e una versione
  // tradotta romperebbe i link che girano nelle email e nei documenti agenzia.
  const sectionsQuery = sidecarFilter(supabase
    .from('info_page_sections')
    .select('heading, body, section_order, anchor'
      + sidecarJoin('info_page_sections_translations', INFO_SECTION_T_FIELDS, l))
    .eq('page_slug', slug)
    .eq('is_active', true)
    .order('section_order', { ascending: true }), l);
  const [meta, { data: sectionsData, error: sErr }] = await Promise.all([
    getInfoPageMeta(slug),
    sectionsQuery,
  ]);

  if (sErr || !sectionsData) {
    console.error('[infoPages] getInfoPage sections:', sErr);
    return null;
  }
  const sections = mergeSidecarRows<Pick<InfoPageSectionRow, 'heading' | 'body' | 'section_order' | 'anchor'>>(sectionsData, l);

  const mapped: LegalDocumentSection[] = sections.map(s => {
    const blocks = (s.body ?? []) as InfoPageBlock[];
    const paragraphs = blocks
      .filter((b): b is Extract<InfoPageBlock, { type: 'paragraph' }> => b.type === 'paragraph')
      .map(b => b.text);
    const subsections = blocks
      .filter((b): b is Extract<InfoPageBlock, { type: 'subsection' }> => b.type === 'subsection')
      .map(b => ({ title: b.title, content: b.text }));
    // 'note' → sezione.notes[]: unico contenuto reso in corsivo dal viewer.
    const notes = blocks
      .filter((b): b is Extract<InfoPageBlock, { type: 'note' }> => b.type === 'note')
      .map(b => b.text);

    return {
      title: s.heading,
      // Ancora stabile per deep-link (fallback slugify(title) nel viewer se assente).
      ...(s.anchor ? { anchor: s.anchor } : {}),
      // Un solo paragrafo → string (come i dati originali); più paragrafi → string[].
      ...(paragraphs.length ? { content: paragraphs.length === 1 ? paragraphs[0] : paragraphs } : {}),
      ...(subsections.length ? { subsections } : {}),
      ...(notes.length ? { notes } : {}),
    };
  });

  return {
    // title/cover in site_metadata (il viewer non usa doc.title).
    id: slug,
    version: meta?.version ?? '',
    title: '',
    effectiveDate: meta?.effectiveDate ?? '',
    lastUpdated: meta?.lastUpdated ?? '',
    sections: mapped,
  };
}
