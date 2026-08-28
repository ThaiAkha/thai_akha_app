/**
 * 🏠 DRIVER HOME
 *
 * Guscio condiviso: <HomeDashboard> (components/dashboard). Qui restano solo
 * il ruolo che filtra le card e lo slug dei metadata.
 */
import React from 'react';
import HomeDashboard from '../../components/dashboard/HomeDashboard';

const DriverHome: React.FC = () => <HomeDashboard role="driver" metaSlug="driver-home" className="pb-[max(48px,env(safe-area-inset-bottom))]" />;

export default DriverHome;
