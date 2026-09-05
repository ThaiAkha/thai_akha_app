import React, { useEffect } from 'react';
import { useLegalDocument } from '@thaiakha/shared/hooks/useLegalDocument';
import { useLanguage } from '../context/LanguageContext';
import { PageLayout, InfoPageHero, PageEssentials, SiblingInfoSection } from '../components/layout';
import { InfoPageSidebar } from '../components/layout/sidebar-info';
import LegalDocumentStaticViewer from '../components/legal/LegalDocumentStaticViewer';
import LegalMetaBanner from '../components/legal/LegalMetaBanner';
import { FaqBottomPage } from '../components/ui';
import { InfoContentSkeleton } from '../components/skeleton';
import { slugify } from '../components/blog';

interface TermsPageProps {
  onNavigate: (page: string) => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  // Centrale legal_documents, con dual-read su info_page_sections finche' i documenti
  // non sono pubblicati (vedi useLegalDocument). Forma LegalDocument: render invariato.
  // La lingua non veniva passata: il documento legale usciva in inglese anche
  // sotto /it/, sia dalla centrale sia dal ramo legacy.
  const { lang } = useLanguage();
  const { doc, loading } = useLegalDocument('front_terms', { fallbackPageSlug: 'booking-terms-conditions', lang });

  // TOC = sezioni top-level. id ancora = anchor stabile dal DB (fallback slug), come SectionBlock.
  const toc = doc ? doc.sections.map(s => ({ id: s.anchor ?? slugify(s.title), label: s.title })) : [];

  // Deep-link hash → scroll alla sezione. Gira DOPO il load (sezioni montate) e su
  // popstate/hashchange: i link SPA interni fanno pushState+popstate (non hashchange),
  // quindi va ascoltato popstate per gli hash-link sulla stessa pagina Terms.
  useEffect(() => {
    if (loading || !doc) return;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    window.addEventListener('popstate', scrollToHash);
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      window.removeEventListener('popstate', scrollToHash);
    };
  }, [loading, doc]);

  return (
    <PageLayout slug="booking-terms-conditions" showPatterns={false}>
      {/* SEO: driven by SEOHead via site_metadata slug "booking-terms-conditions". No PageSEO. */}
      <div className="flex flex-col [gap:var(--space-fluid-l)] w-full max-w-6xl mx-auto">
        <InfoPageHero
          slug="booking-terms-conditions"
          fallbackIcon="gavel"
          fallbackTitle="Terms of"
          fallbackHighlight="Service"
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
            currentSlug="booking-terms-conditions"
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

        <PageEssentials slug="booking-terms-conditions" accent="ocean" />

        <FaqBottomPage slug="booking-terms-conditions" onNavigate={onNavigate} />
        <SiblingInfoSection currentSlug="booking-terms-conditions" onNavigate={onNavigate} accent="ocean" />
      </div>
    </PageLayout>
  );
};

export default TermsPage;
