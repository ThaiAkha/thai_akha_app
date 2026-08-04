import React from 'react';
import AgencyLegalPage from './AgencyLegalPage';

/**
 * agency-privacy - Privacy Policy per i partner agenzia (doc_key agency_policy).
 * Distinta dalla privacy consumer: destinatario, obblighi e base giuridica diversi.
 * Lo slug NON va rinominato: il testo pubblicato del 6141 ci punta (sezioni 3 e 12).
 */
const AgencyPrivacy: React.FC = () => (
  <AgencyLegalPage docKey="agency_policy" pageSlug="agency-privacy" />
);

export default AgencyPrivacy;
