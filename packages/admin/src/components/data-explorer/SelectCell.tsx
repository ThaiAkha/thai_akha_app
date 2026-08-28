import React from 'react';
import { TableCell } from '../ui/table';
import Checkbox from '../form/input/Checkbox';

interface SelectCellProps {
    checked: boolean;
    onToggle: (checked: boolean) => void;
    /**
     * Padding/larghezza della cella: nessun default, cosi' ogni tabella
     * conserva il suo (Db e News 'px-4 w-10', Inventory 'px-4 py-3').
     */
    className?: string;
}

const SelectCell: React.FC<SelectCellProps> = ({ checked, onToggle, className }) => {
    return (
        <TableCell className={className} onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={checked} onChange={onToggle} />
        </TableCell>
    );
};

export default SelectCell;
