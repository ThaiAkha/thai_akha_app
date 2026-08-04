import React from 'react';
import { useLegalDocument } from '@thaiakha/shared/hooks/useLegalDocument';
import { PageLayout, InfoPageHero, PageEssentials, SiblingInfoSection } from '../components/layout';
import { InfoPageSidebar } from '../components/layout/sidebar-info';
import LegalDocumentStaticViewer from '../components/legal/LegalDocumentStaticViewer';
import LegalMetaBanner from '../components/legal/LegalMetaBanner';
import { FaqBottomPage } from '../components/ui';
import { InfoContentSkeleton } from '../components/skeleton';
import { slugify } from '../components/blog';

interface PrivacyPageProps {
  onNavigate: (page: string) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  // Centrale legal_documents, con dual-read su info_page_sections finche' i documenti
  // non sono pubblicati (vedi useLegalDocument). Forma LegalDocument: render invariato.
  const { doc, loading } = useLegalDocument('front_policy', { fallbackPageSlug: 'privacy-policy' });

  // TOC = sezioni top-level. id ancora = anchor stabile dal DB (fallback slug), come SectionBlock.
  const toc = doc ? doc.sections.map(s => ({ id: s.anchor ?? slugify(s.title), label: s.title })) : [];

  return (
    <PageLayout slug="privacy-policy" showPatterns={false}>
      {/* SEO: driven by SEOHead via site_metadata slug "privacy-policy". No PageSEO. */}
      <div className="flex flex-col [gap:var(--space-fluid-l)] w-full max-w-5xl mx-auto">
        <InfoPageHero
          slug="privacy-policy"
          fallbackIcon="privacy_tip"
          fallbackTitle="Privacy"
          fallbackHighlight="Policy"
          dividerTheme="block_faq"
          gradientFrom="ocean-blue"
          gradientTo="deep-ocean"
        />

        {/* Barra versione documento (da info_pages: doc_version/effective/last_updated).
            Le date pagina Published/Updated restano nei Key Facts (site_metadata). */}
        {doc && (
          <LegalMetaBanner
            version={doc.version}
            effectiveDate={doc.effectiveDate}
            lastUpdated={doc.lastUpdated}
            accent="ocean"
          />
        )}

        {/* ── 2 colonne: sidebar info-page (18rem, sinistra) + contenuto legale ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_1fr] [gap:var(--space-fluid-l)] items-start">
          <InfoPageSidebar
            currentSlug="privacy-policy"
            onNavigate={onNavigate}
            toc={toc}
            numberedToc
            ctaCardId="sidebar-cta-classes"
            accent="ocean"
            className="hidden lg:flex lg:sticky lg:top-[var(--space-fluid-l)]"
          />
          <div className="min-w-0">
            {loading
              ? <InfoContentSkeleton blocks={6} />
              : doc && <LegalDocumentStaticViewer document={doc} accent="ocean" showMeta={false} />}
          </div>
        </div>

        <PageEssentials slug="privacy-policy" accent="ocean" />

        <FaqBottomPage slug="privacy-policy" onNavigate={onNavigate} />
        <SiblingInfoSection currentSlug="privacy-policy" onNavigate={onNavigate} accent="ocean" />
      </div>
    </PageLayout>
  );
};

export default PrivacyPage;
