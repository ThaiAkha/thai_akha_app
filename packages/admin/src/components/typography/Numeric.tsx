import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Numeric — uniform number styling for the admin (KPIs, prices, totals, counts).
 * One of three roles, so numbers look identical everywhere. Color is left to the
 * caller (e.g. `text-primary-600` for money, default inherits) — only the
 * mono/weight/size are standardized.
 *
 *   stat   → big KPI / headline figure        (font-mono black 2xl)
 *   value  → inline price / total             (font-mono black lg)
 *   meta   → small count / secondary figure   (font-mono bold sm)
 */
export type NumericVariant = 'stat' | 'value' | 'meta';

const VARIANTS: Record<NumericVariant, string> = {
    stat: 'font-mono font-black text-2xl tabular-nums',
    value: 'font-mono font-black text-lg tabular-nums',
    meta: 'font-mono font-bold text-sm tabular-nums',
};

interface NumericProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: NumericVariant;
    children: React.ReactNode;
}

const Numeric: React.FC<NumericProps> = ({ variant = 'value', className, children, ...props }) => (
    <span className={cn(VARIANTS[variant], className)} {...props}>{children}</span>
);

export default Numeric;
