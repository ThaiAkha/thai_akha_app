/**
 * 🚗 DRIVER PAYOUT — declare the pickup service (form only).
 * No banner, no tabs: the weekly payout list ("resoconti") moved to /driver-reports.
 * Editing a payout from Reports preloads the form via sessionStorage.
 * BYPASS-PAYOUT (temporary) — see _temp_driver_payout/.
 */
import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import DriverPayoutForm, { type PayoutEditTarget } from './DriverPayoutForm';

const DriverPayout: React.FC = () => {
    usePageMetadata('driver-payout'); // sets the top page header
    const [editTarget, setEditTarget] = useState<PayoutEditTarget | null>(null);

    // Preload the form when arriving from a Reports "edit" action.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('driver_payout_edit');
            if (raw) { sessionStorage.removeItem('driver_payout_edit'); setEditTarget(JSON.parse(raw)); }
        } catch { /* ignore */ }
    }, []);

    return (
        <PageContainer variant="wide">
            <div className="pb-[max(48px,env(safe-area-inset-bottom))] flex justify-center">
                <DriverPayoutForm editTarget={editTarget} onDone={() => setEditTarget(null)} />
            </div>
        </PageContainer>
    );
};

export default DriverPayout;
