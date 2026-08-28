import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useConfirm, type ConfirmOptions } from '../ui/confirm/ConfirmProvider';

/**
 * A single line inside a report inspector body: optional leading badge/icon, a
 * title + subtitle, a trailing amount and optional actions. `children` render
 * below the line (e.g. an inline editor). Replaces the driver day-row and the
 * market item-row markup.
 */
interface ReportLineRowProps {
    leading?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    amount?: React.ReactNode;
    amountSuffix?: React.ReactNode;
    /** Extra custom action node(s), rendered before the standard edit/delete icons. */
    actions?: React.ReactNode;
    /** Standard edit icon button (Pencil). */
    onEdit?: () => void;
    /** Standard delete/cancel icon button (Trash2). */
    onDelete?: () => void;
    /** When set, the delete button asks for confirmation first. `true` = default copy, or pass custom options. */
    confirmDelete?: boolean | ConfirmOptions;
    children?: React.ReactNode;
    /** 'sm' = compact (POS / draft lists) · 'md' = default (report detail). */
    density?: 'sm' | 'md';
    /** When set, the whole row becomes clickable (cursor + hover highlight). */
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
}

// Large touch targets for iPad: a ~44px square button with a big icon.
const ICON_BTN = 'size-11 rounded-xl flex items-center justify-center text-sub transition-colors focus-visible:outline-none focus-visible:ring-2';

const ReportLineRow: React.FC<ReportLineRowProps> = ({ leading, title, subtitle, amount, amountSuffix = '฿', actions, onEdit, onDelete, confirmDelete, children, density = 'md', onClick, className }) => {
    const sm = density === 'sm';
    const hasTrailing = amount != null || actions || onEdit || onDelete;
    const confirm = useConfirm();
    const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
    const handleDelete = async () => {
        if (!onDelete) return;
        if (confirmDelete) {
            const opts = typeof confirmDelete === 'object' ? confirmDelete : {};
            const ok = await confirm({ title: 'Delete?', message: 'This action cannot be undone.', confirmLabel: 'Delete', tone: 'danger', ...opts });
            if (!ok) return;
        }
        onDelete();
    };
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-stretch bg-gray-50/40 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-all',
                sm ? 'gap-2 p-2.5' : 'gap-3 p-3',
                onClick && 'cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
                className,
            )}
        >
            {leading}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                        <div className={cn('font-bold uppercase text-title truncate', sm ? 'text-base' : 'text-lg')}>{title}</div>
                        {subtitle != null && <div className={cn('text-sub font-medium', sm ? 'text-sm' : 'text-base')}>{subtitle}</div>}
                    </div>
                    {hasTrailing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                            {amount != null && <span className={cn('font-mono font-black text-primary-600 dark:text-primary-400 mr-0.5', sm ? 'text-lg' : 'text-2xl')}>{amount} {amountSuffix}</span>}
                            {actions}
                            {onEdit && (
                                <button type="button" aria-label="Edit" onClick={stop(onEdit)} className={cn(ICON_BTN, 'hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 focus-visible:ring-primary-500')}>
                                    <Pencil className="w-6 h-6" />
                                </button>
                            )}
                            {onDelete && (
                                <button type="button" aria-label="Delete" onClick={stop(handleDelete)} className={cn(ICON_BTN, 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 focus-visible:ring-red-500')}>
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
};

export default ReportLineRow;
