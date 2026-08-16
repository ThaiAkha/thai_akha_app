import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Clickable card for the center column of a report hub: a title + amount on the
 * first line and a meta row (count + status badge) below. Selected state mirrors
 * the inspector. Replaces renderWeekCard / renderRunCard (and future month/day cards).
 */
interface ReportListCardProps {
    title: React.ReactNode;
    /** Right-aligned amount on the title line (already formatted). */
    amount?: React.ReactNode;
    amountSuffix?: React.ReactNode;
    /** Meta row content (e.g. "12 items" + a <ReportStatusBadge/>). */
    meta?: React.ReactNode;
    selected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
}

const ReportListCard: React.FC<ReportListCardProps> = ({ title, amount, amountSuffix = '฿', meta, selected, onClick, className }) => (
    <button
        onClick={onClick}
        className={cn(
            'w-full text-left p-4 rounded-2xl border bg-white dark:bg-gray-900 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            selected ? 'border-primary-500 shadow-sm' : 'border-gray-100 dark:border-gray-800',
            className,
        )}
    >
        <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-bold text-gray-900 dark:text-white min-w-0 truncate">{title}</div>
            {amount != null && (
                <span className="font-mono text-lg font-black text-primary-600 dark:text-primary-400 shrink-0">{amount} {amountSuffix}</span>
            )}
        </div>
        {meta != null && <div className="mt-1.5 flex items-center gap-2">{meta}</div>}
    </button>
);

export default ReportListCard;
