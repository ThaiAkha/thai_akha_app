/**
 * 🏠 MANAGER HOME
 *
 * Guscio condiviso: <HomeDashboard> (components/dashboard). Qui restano solo
 * il ruolo che filtra le card e lo slug dei metadata.
 */
import React from 'react';
import HomeDashboard from '../../components/dashboard/HomeDashboard';

const ManagerHome: React.FC = () => <HomeDashboard role="manager" metaSlug="manager-home" />;

export default ManagerHome;
