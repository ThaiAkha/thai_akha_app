/**
 * 🚗 DRIVER REPORTS — banner + weekly payout summaries ("resoconti").
 * The list lived as the 2nd tab of the payout form; now its own page.
 * Editing a row hands off to the declare form (/driver-payout) via sessionStorage.
 */
import React from 'react';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/layout/PageContainer';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import DriverPayoutDashboard from './DriverPayoutDashboard';
import { type PayoutEditTarget } from './DriverPayoutForm';

const DriverReports: React.FC = () => {
    const navigate = useNavigate();
    const { pageMeta } = usePageMetadata('driver-reports');

    const onEdit = (target: PayoutEditTarget) => {
        sessionStorage.setItem('driver_payout_edit', JSON.stringify(target));
        navigate('/driver-payout');
    };

    return (
        <PageContainer variant="wide">
            <div className="pb-[max(48px,env(safe-area-inset-bottom))]">
                {pageMeta && (
                    <WelcomeHero
                        badge={pageMeta.badge}
                        titleMain={pageMeta.titleMain}
                        titleHighlight={pageMeta.titleHighlight}
                        description={pageMeta.description}
                        imageUrl={pageMeta.imageUrl}
                        icon={pageMeta.icon}
                    />
                )}
                <div className="flex justify-center mt-2">
                    <DriverPayoutDashboard onEdit={onEdit} />
                </div>
            </div>
        </PageContainer>
    );
};

export default DriverReports;
