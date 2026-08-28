/**
 * 🏠 KITCHEN HOME
 *
 * Guscio condiviso: <HomeDashboard> (components/dashboard). Qui restano solo
 * il ruolo che filtra le card e lo slug dei metadata.
 */
import React from 'react';
import HomeDashboard from '../../components/dashboard/HomeDashboard';

const KitchenHome: React.FC = () => <HomeDashboard role="kitchen" metaSlug="kitchen-home" />;

export default KitchenHome;
