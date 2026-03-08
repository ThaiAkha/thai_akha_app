import React from 'react';
import { TableRow } from '../ui/table';
import { cn } from '../../lib/utils';

interface DataExplorerRowProps {
    children: React.ReactNode;
    selected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    idx?: number;
}

const DataExplorerRow: React.FC<DataExplorerRowProps> = ({
    children,
    selected = false,
    onClick,
    className,
    idx = 0
}) => {
    return (
        <TableRow
            onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
            className={cn(
                // Base styles
                "cursor-pointer relative overflow-hidden",
                "border-b border-gray-100 dark:border-gray-800 last:border-0",

                // Height
                "h-12 md:h-14",

                // Zebra striping with subtle gradient
                idx % 2 === 0
                    ? "bg-white dark:bg-gray-950"
                    : "bg-gradient-to-r from-gray-50/30 to-gray-50/60 dark:from-gray-800/5 dark:to-gray-800/15",

                // Hover state with left bar (orange)
                "hover:bg-gradient-to-r hover:from-orange-50/40 hover:to-orange-50/20 dark:hover:from-orange-500/10 dark:hover:to-transparent",
                "hover:after:absolute hover:after:left-0 hover:after:top-1/2 hover:after:-translate-y-1/2",
                "hover:after:h-8 hover:after:w-[3px] hover:after:bg-orange-500 hover:after:rounded-r",
                "hover:shadow-theme-xs",

                // Selected state with left bar (orange) and gradient
                selected && [
                    "bg-gradient-to-r from-orange-50 to-orange-50/70 dark:from-orange-500/15 dark:to-transparent",
                    "after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2",
                    "after:h-8 after:w-[3px] after:bg-orange-500 after:rounded-r",
                    "after:shadow-[0_0_12px_rgba(251,101,20,0.4)]",
                    "shadow-theme-sm border-l-0",
                ],

                className
            )}
        >
            {children}
        </TableRow>
    );
};

export default DataExplorerRow;