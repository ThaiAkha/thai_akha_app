/**
 * 📋 LEGAL DOCUMENT TYPES
 * Structures for Terms of Service and Privacy Policy documents
 */

export interface LegalDocumentSection {
  title: string;
  content?: string | string[];
  subsections?: {
    title: string;
    content: string | string[];
  }[];
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
