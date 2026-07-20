/**
 * infoPages.service — fonte DB per le pagine info pubbliche (FAQ, Terms, Privacy).
 * Ritorna le STESSE forme UI già usate dalle pagine (FAQCategory[] / LegalDocument)
 * → il render non cambia. RLS lettura pubblica attiva (anon key). Colonne esplicite.
 *
 * Tabelle tipizzate in database.types.ts (faq_*, info_page*); i dati sono mappati
 * sui tipi dominio manuali di @thaiakha/shared (FaqCategoryRow & co.).
 */
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { FAQLink, FAQCta } from '@thaiakha/shared/data';
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────
// Categorie universali + domande della LIBRERIA CONDIVISA (entity_type IS NULL):
// le page-specific (entity_type='page') vivono SOLO sulle loro pagine via
// faq_refs e NON entrano nell'accordion hub (duplicerebbero le condivise).
// Selettore hub = entity_type IS NULL AND audience @> {ROLE}: future-proof per
// l'hub agency cambiando solo il ruolo. Ordinate per category.display_order
// poi question.display_order. Forma = FaqCategoryUI[].
// links: la colonna DB è stata unificata dentro cta.links → la forma UI
// (FAQItem.links) resta identica per i renderer (FAQRichAnswer/FAQPage).
export async function getFaqData(): Promise<FaqCategoryUI[]> {
  const [{ data: catsData, error: cErr }, { data: qsData, error: qErr }] = await Promise.all([
    supabase
      .from('faq_categories')
      .select('id, category_key, title, image_asset_id, section_id, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('faq_questions')
      .select('category_id, question, answer, cta, display_order')
      .eq('is_active', true)
      .is('entity_type', null)
      .contains('audience', ['front'])
      .order('display_order', { ascending: true }),
  ]);

  if (cErr || qErr || !catsData || !qsData) {
    console.error('[infoPages] getFaqData:', cErr || qErr);
    return [];
  }

  const cats = catsData as unknown as Pick<FaqCategoryRow, 'id' | 'category_key' | 'title' | 'image_asset_id' | 'section_id' | 'display_order'>[];
  const qs = qsData as unknown as Pick<FaqQuestionRow, 'category_id' | 'question' | 'answer' | 'cta' | 'display_order'>[];

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
): Promise<FaqCardUI[]> {
  const { data, error } = await supabase
    .from('faq_questions')
    .select('faq_key, question, answer, avatar_asset_id, faq_style, display_order, cta')
    .eq('entity_type', entityType)
    .eq('entity_slug', entitySlug)
    .eq('is_active', true)
    .contains('audience', ['front'])
    .order('display_order', { ascending: true });

  if (error || !data) {
    console.error('[infoPages] getEntityFaqs:', error);
    return [];
  }
  const rows = data as unknown as Pick<FaqQuestionRow, 'faq_key' | 'question' | 'answer' | 'avatar_asset_id' | 'faq_style' | 'display_order' | 'cta'>[];
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
// collante pagina↔FAQ. Ritorna [] se la pagina non ha refs → fallback JSONB legacy.
export async function getPageFaqs(entitySlug: string): Promise<FaqCardUI[]> {
  const { data: metaData, error: metaErr } = await supabase
    .from('site_metadata')
    .select('faq_refs')
    .eq('page_slug', entitySlug)
    .maybeSingle();

  if (metaErr || !metaData) {
    if (metaErr) console.error('[infoPages] getPageFaqs (refs):', metaErr);
    return [];
  }
  const refs = (metaData.faq_refs ?? []) as string[];
  if (!Array.isArray(refs) || refs.length === 0) return [];

  const { data, error } = await supabase
    .from('faq_questions')
    .select('faq_key, question, answer, avatar_asset_id, faq_style, cta')
    .in('faq_key', refs)
    .eq('is_active', true);

  if (error || !data) {
    console.error('[infoPages] getPageFaqs:', error);
    return [];
  }
  const rows = data as unknown as Pick<FaqQuestionRow, 'faq_key' | 'question' | 'answer' | 'avatar_asset_id' | 'faq_style' | 'cta'>[];
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

// ─── PAGE DATES (site_metadata) — sorgente unica per la riga meta Published/Updated ──
// Vale per QUALSIASI pagina con riga site_metadata (info pages, classi, home…).
// Le date NON vivono più nei page_essentials.facts né in info_pages.
const _datesCache = new Map<string, { published: string | null; modified: string | null }>();

export async function getPageDates(
  pageSlug: string,
): Promise<{ published: string | null; modified: string | null }> {
  const cached = _datesCache.get(pageSlug);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('site_metadata')
    .select('date_published, date_modified')
    .eq('page_slug', pageSlug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[infoPages] getPageDates:', error);
    return { published: null, modified: null };
  }
  const entry = {
    published: data.date_published ?? null,
    modified: data.date_modified ?? null,
  };
  _datesCache.set(pageSlug, entry);
  return entry;
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
export async function getInfoPage(slug: string): Promise<LegalDocument | null> {
  const [meta, { data: sectionsData, error: sErr }] = await Promise.all([
    getInfoPageMeta(slug),
    supabase
      .from('info_page_sections')
      .select('heading, body, section_order')
      .eq('page_slug', slug)
      .eq('is_active', true)
      .order('section_order', { ascending: true }),
  ]);

  if (sErr || !sectionsData) {
    console.error('[infoPages] getInfoPage sections:', sErr);
    return null;
  }
  const sections = sectionsData as unknown as Pick<InfoPageSectionRow, 'heading' | 'body' | 'section_order'>[];

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
