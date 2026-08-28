import React from 'react';
import { TableHeader, TableRow } from '../ui/table';
import { cn } from '@thaiakha/shared/lib/utils';

// Thead sticky del data explorer: 7 occorrenze identiche in 6 file.
const STICKY_HEAD = 'sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800';

interface DataTableHeadProps {
    /** Le HeaderCell della riga di intestazione. */
    children: React.ReactNode;
    className?: string;
}

const DataTableHead: React.FC<DataTableHeadProps> = ({ children, className }) => {
    return (
        <TableHeader className={cn(STICKY_HEAD, className)}>
            <TableRow>{children}</TableRow>
        </TableHeader>
    );
};

export default DataTableHead;
