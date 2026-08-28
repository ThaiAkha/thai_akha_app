import React from 'react';
import { TableCell } from '../ui/table';
import Checkbox from '../form/input/Checkbox';
import { cn } from '@thaiakha/shared/lib/utils';

// Tipografia dell'intestazione di colonna: 21 occorrenze identiche nei sei
// *Content (Hotels 10, Inventory 5, Storage 4, Db 1, News 1).
const HEADER_CELL_BASE = 'px-4 py-3 text-xs font-black uppercase tracking-widest text-sub';

// Cella di sola spaziatura (checkbox select-all): nessuna tipografia.
const HEADER_CELL_PLAIN = 'px-4 py-3';

const ALIGN_CLASS = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const;

interface HeaderCellProps {
    /** Etichetta della colonna. Ignorata quando c'e' selectAll. */
    label?: React.ReactNode;
    /** Omesso = nessuna classe di allineamento (il th resta al default del browser). */
    align?: 'left' | 'center' | 'right';
    /** Classe di larghezza, es. 'w-10'. */
    width?: string;
    /** Se presente, la cella rende la checkbox select-all al posto dell'etichetta. */
    selectAll?: { checked: boolean; onToggle: (checked: boolean) => void };
    className?: string;
}

const HeaderCell: React.FC<HeaderCellProps> = ({
    label,
    align,
    width,
    selectAll,
    className,
}) => {
    return (
        <TableCell
            isHeader
            className={cn(
                selectAll ? HEADER_CELL_PLAIN : HEADER_CELL_BASE,
                align && ALIGN_CLASS[align],
                width,
                className
            )}
        >
            {selectAll ? (
                <Checkbox checked={selectAll.checked} onChange={selectAll.onToggle} />
            ) : (
                label
            )}
        </TableCell>
    );
};

export default HeaderCell;
