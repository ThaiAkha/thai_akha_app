import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

// Wrapper della griglia di card: 6 occorrenze nei *Content, identiche a meno
// di padding (4 o 5), gap (3 o 4) e del numero di colonne xl in Media.
const GRID_COLS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

const PADDING_CLASS = { 4: 'p-4', 5: 'p-5' } as const;
const GAP_CLASS = { 3: 'gap-3', 4: 'gap-4' } as const;

interface CardGridProps {
    /** 4 = Db, News, Storage, Hotels; 5 = Inventory, Media. */
    padding?: 4 | 5;
    /** 3 = Db, News, Storage, Hotels; 4 = Inventory, Media. */
    gap?: 3 | 4;
    /** Override sulla griglia interna, es. 'xl:grid-cols-4' per Media. */
    className?: string;
    children: React.ReactNode;
}

const CardGrid: React.FC<CardGridProps> = ({
    padding = 4,
    gap = 3,
    className,
    children,
}) => {
    return (
        <div className={PADDING_CLASS[padding]}>
            <div className={cn(GRID_COLS, GAP_CLASS[gap], className)}>
                {children}
            </div>
        </div>
    );
};

export default CardGrid;
