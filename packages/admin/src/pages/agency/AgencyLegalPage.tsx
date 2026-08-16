import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeaderWithBadge from '../../components/common/PageHeaderWithBadge';
import PageMeta from '../../components/common/PageMeta';
import LegalDocumentBody from '../../components/legal/LegalDocumentBody';
import LegalTranslationNotices from '../../components/legal/LegalTranslationNotices';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { useI18n } from '../../context/I18nContext';
import { useLegalDocument } from '@thaiakha/shared/hooks/useLegalDocument';

interface AgencyLegalPageProps {
  /** doc_key in legal_documents: 'agency_terms' | 'agency_policy'. */
  docKey: string;
  /** Slug in site_metadata_admin: da' badge, titolo e meta della pagina. */
  pageSlug: string;
}

/**
 * Scheletro condiviso delle pagine legali agency (agency-terms, agency-privacy).
 *
 * Il testo arriva dal DATABASE (legal_documents + legal_documents_translations), non piu'
 * dai file generati: quando /terms completera' le traduzioni la pagina cambia da sola,
 * senza rigenerare file ne' rideployare.
 *
 * Le traduzioni sono PARZIALI: la fusione per sezione (mergeLegalTranslation, dentro
 * useLegalDocument) garantisce che il documento sia sempre completo, con le sezioni non
 * ancora tradotte rese in inglese e dichiarate come tali. Niente buchi silenziosi.
 *
 * Nessun dual-read qui: per gli agency non esiste una sorgente legacy.
 */
const AgencyLegalPage: React.FC<AgencyLegalPageProps> = ({ docKey, pageSlug }) => {
  const { lang } = useI18n();
  const { pageMeta } = usePageMetadata(pageSlug);
  const { doc, loading } = useLegalDocument(docKey, { lang });

  return (
    <PageContainer variant="wide">
      <PageMeta
        title={pageMeta?.seoTitle || doc?.title || ''}
        description={pageMeta?.description || doc?.title || ''}
      />
      <div className="pb-20 space-y-8">
        <PageHeaderWithBadge
          badge={pageMeta?.badge || 'Legal'}
          title={pageMeta?.titleMain || doc?.title || ''}
          titleHighlight={pageMeta?.titleHighlight}
          description={pageMeta?.description}
          alignment="left"
        />

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 sm:p-10 shadow-sm">
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          )}

          {!loading && !doc && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This document is not available right now. Please contact us.
            </p>
          )}

          {!loading && doc && (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-6 mb-6 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Version {doc.version}
                </span>
                {doc.lastUpdated && (
                  <span className="text-xs font-medium text-gray-400">
                    Last updated: {doc.lastUpdated}
                  </span>
                )}
              </div>

              <LegalTranslationNotices document={doc} />

              <LegalDocumentBody document={doc} />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AgencyLegalPage;
