import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Standard "leading" media for a ReportLineRow: a tonal rounded box holding either
 * an icon (category/service) or a short badge (e.g. a quantity). One consistent look
 * for every report/POS/expense line. (No photos — icon/badge only, by design.)
 */
export type MediaTone = 'primary' | 'green' | 'blue' | 'amber' | 'gray';

const TONE_BOX: Record<MediaTone, string> = {
    primary: 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-success',
    blue: 'bg-blue-light-50 dark:bg-blue-light-500/10 text-blue-light-700 dark:text-blue-light-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-warning',
    gray: 'bg-gray-100 dark:bg-gray-800 text-sub',
};

interface ReportLineMediaProps {
    /** Icon node (category/service). Ignored if `badge` is set. */
    icon?: React.ReactNode;
    /** Short badge content (e.g. a quantity number). Takes precedence over `icon`. */
    badge?: React.ReactNode;
    tone?: MediaTone;
    size?: 'sm' | 'md';
    className?: string;
}

const ReportLineMedia: React.FC<ReportLineMediaProps> = ({ icon, badge, tone = 'gray', size = 'sm', className }) => (
    <div className={cn(
        // self-center keeps the badge vertically centered in a taller row; sized to match the edit/delete buttons (44px).
        'rounded-xl flex items-center justify-center shrink-0 self-center font-black',
        size === 'sm' ? 'size-11 text-base' : 'size-12 text-lg',
        TONE_BOX[tone],
        className,
    )}>
        {badge ?? icon}
    </div>
);

export default ReportLineMedia;
