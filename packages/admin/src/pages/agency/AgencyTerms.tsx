import React from 'react';
import AgencyLegalPage from './AgencyLegalPage';

/**
 * agency-terms - Terms of Service per i partner agenzia (doc_key agency_terms).
 * Testo e traduzione arrivano dal DATABASE: zero legale hardcoded, zero rebuild
 * quando la traduzione thai viene completata.
 */
const AgencyTerms: React.FC = () => (
  <AgencyLegalPage docKey="agency_terms" pageSlug="agency-terms" />
);

export default AgencyTerms;
