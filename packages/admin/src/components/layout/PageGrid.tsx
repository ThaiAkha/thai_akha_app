import React from 'react';
import { cn } from '../../lib/utils';

interface PageGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 1 | 2 | 3 | 4 | 12;
}

const PageGrid: React.FC<PageGridProps> = ({ children, className, columns = 12 }) => {
    return (
        <div className={cn(
            "grid grid-cols-1 gap-6",
            columns === 12 && "lg:grid-cols-12",
            columns === 4 && "md:grid-cols-2 lg:grid-cols-4",
            columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
            columns === 2 && "lg:grid-cols-2",
            className
        )}>
            {children}
        </div>
    );
};

export default PageGrid;
