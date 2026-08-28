/**
 * 🏠 AGENCY HOME
 *
 * Guscio condiviso: <HomeDashboard> (components/dashboard). Qui restano solo
 * il ruolo che filtra le card e lo slug dei metadata.
 */
import React from 'react';
import HomeDashboard from '../../components/dashboard/HomeDashboard';

const AgencyHome: React.FC = () => <HomeDashboard role="agency" metaSlug="agency-home" />;

export default AgencyHome;
