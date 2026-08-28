import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Tone-based status pill for report lists/cards. The caller maps a domain status
 * to a tone; this keeps the visual language identical across report pages.
 * Replaces the custom pills in ManagerReports / LogisticReports / MarketRunner.
 */
export type ReportTone = 'green' | 'blue' | 'amber' | 'gray';

const TONES: Record<ReportTone, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 text-success',
    blue: 'bg-blue-light-50 dark:bg-blue-light-500/10 text-blue-light-700 dark:text-blue-light-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-warning',
    gray: 'bg-gray-100 dark:bg-gray-800 text-sub',
};

interface ReportStatusBadgeProps {
    tone: ReportTone;
    children: React.ReactNode;
    className?: string;
}

const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ tone, children, className }) => (
    <span className={cn('text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded', TONES[tone], className)}>
        {children}
    </span>
);

export default ReportStatusBadge;
