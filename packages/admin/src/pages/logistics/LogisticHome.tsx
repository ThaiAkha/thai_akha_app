/**
 * 🏠 LOGISTICS HOME
 *
 * Guscio condiviso: <HomeDashboard> (components/dashboard). Qui restano solo
 * il ruolo che filtra le card e lo slug dei metadata.
 */
import React from 'react';
import HomeDashboard from '../../components/dashboard/HomeDashboard';

// Attenzione all'asimmetria, e' cosi' a database: ruolo `logistics` (plurale) in
// `home_cards`, slug `logistic-home` (singolare) in `site_metadata_admin`.
const LogisticHome: React.FC = () => <HomeDashboard role="logistics" metaSlug="logistic-home" />;

export default LogisticHome;
