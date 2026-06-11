/**
 * 📊 MANAGER REPORTS
 *
 * Dashboard with analytics, metrics, and operational reports
 * (To be populated with data visualization and statistics)
 */

import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import { Heading } from '../../components/typography';
// BYPASS-PAYOUT (temporaneo) — report payout driver + pagamento/fatturazione Zoho
import ManagerDriverPayouts from './ManagerDriverPayouts';

const ManagerReports: React.FC = () => {
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('manager-reports');

    return (
        <PageContainer variant="wide">
            <div className="pb-[max(48px,env(safe-area-inset-bottom))]">
                {/* HERO SECTION */}
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

                {/* BYPASS-PAYOUT — Report Payout Driver */}
                <section className="mt-[var(--space-fluid-m,1.5rem)]">
                    <Heading level="h3" className="mb-[var(--space-fluid-s,1rem)]">Report Payout Driver</Heading>
                    <ManagerDriverPayouts />
                </section>
            </div>
        </PageContainer>
    );
};

export default ManagerReports;
