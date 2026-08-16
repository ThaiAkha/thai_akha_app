/**
 * 📋 LEGAL DOCUMENT TYPES
 * Structures for Terms of Service and Privacy Policy documents
 */

export interface LegalDocumentSection {
  title: string;
  /** Stable short anchor id for deep-linking (from info_page_sections.anchor). Falls back to slugify(title). */
  anchor?: string | null;
  content?: string | string[];
  subsections?: {
    title: string;
    content: string | string[];
  }[];
  /** Blocchi {type:'note'} dal DB — resi in corsivo (caption), unico italic del documento. */
  notes?: string[];
}

export interface LegalDocument {
  id: string;
  version: string;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  supersedes?: string;
  sections: LegalDocumentSection[];
}

export interface TermsAcceptance {
  agencyId: string;
  documentId: string;
  version: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

// Legacy alias for backwards compatibility
export type LegalSection = LegalDocumentSection;
