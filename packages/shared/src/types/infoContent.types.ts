/**
 * 🗄️ INFO CONTENT DB TYPES
 * Righe delle tabelle Supabase per i contenuti delle pagine info pubbliche
 * (FAQ, Terms, Privacy). Manuali perché non ancora in database.types.ts.
 * Le PAGINE consumano le forme UI esistenti (FAQCategory[] / LegalDocument),
 * mappate dal service front (infoPages.service.ts).
 */
import type { FAQCta, FAQCategory } from './faq.types';

// ── faq_categories ──────────────────────────────────────────────────────────
export interface FaqCategoryRow {
  id: string;
  category_key: string;
  title: string;
  image_asset_id: string | null;
  avatar_asset_id: string | null;
  icon: string | null;
  color_theme: string | null;
  /** Header della categoria nella FAQ page: page_sections.section_id (faq-0X). */
  section_id: string | null;
  display_order: number;
  is_active: boolean;
}

/** Forma UI FAQ arricchita con foto categoria e header section (DB-driven, no mappe hardcoded). */
export type FaqCategoryUI = FAQCategory & { imageAssetId?: string; sectionId?: string };

// ── faq_questions ───────────────────────────────────────────────────────────
// category_id è NULL per le FAQ page-specific (entity_type='page'): non
// appartengono alle 6 categorie universali. Popolato solo per le universali.
// 2026-07: colonna links DROPPATA (unificata dentro cta.links); aggiunte le
// colonne del riordino centrale: faq_style ('long' | 'rich') e audience.
export interface FaqQuestionRow {
  id: string;
  category_id: string | null;
  faq_key: string | null;
  question: string;
  answer: string;
  cta: FAQCta | null;
  entity_type: string | null;
  entity_slug: string | null;
  tags: string[] | null;
  display_order: number;
  is_active: boolean;
  avatar_asset_id: string | null;
  faq_style: string;
  audience: string[];
}

/** Card FAQ (FaqBottomPage): domanda + answer HTML + avatar frozen.
 *  Enriched (migrazione centrale 2026-07): key/order/style/cta dalla riga
 *  faq_questions — opzionali perché il fallback legacy non li possiede. */
export interface FaqCardUI {
  name: string;
  answerHtml: string;
  avatarAssetId?: string;
  key?: string;
  order?: number;
  style?: string;
  cta?: FAQCta;
}

// ── info_pages ────────────────────────────────────────────────────────────────
// Schema pulito: SOLO corpo + meta. Head/cover/SEO/nav → site_metadata (join slug).
export interface InfoPageRow {
  id: string;
  slug: string;
  page_type: string;
  doc_version: string | null;
  effective_date: string | null;
  last_updated: string | null;
  content: unknown | null;
  is_published: boolean;
  display_order: number;
}

// ── info_page_sections.body[] ───────────────────────────────────────────────
// 'note' = testo in corsivo controllato da DB (unico italic del documento).
export type InfoPageBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subsection'; title: string; text: string }
  | { type: 'note'; text: string };

export interface InfoPageSectionRow {
  id: string;
  /** DEPRECATO: FK verso info_pages (tabella in dismissione). Usare page_slug. */
  page_id: string;
  /** Slug pagina (= site_metadata.page_slug) — aggancio diretto, niente join. */
  page_slug: string | null;
  section_order: number;
  heading: string;
  body: InfoPageBlock[];
  /** Stable short anchor id for deep-linking (e.g. 'cancellations'). NULL → fallback slugify(heading). */
  anchor?: string | null;
}
