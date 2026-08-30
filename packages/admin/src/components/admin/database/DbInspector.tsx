import SectionHeader from '../../ui/SectionHeader';
import Input from '../../../components/form/input/InputField';
import { SectionTitle } from '../../typography';
import { InspectorDeleteZone } from '../../ui/inspector';
import { cn } from '@thaiakha/shared/lib/utils';
import { READ_ONLY_COLUMNS } from '../../../hooks/useAdminDatabase';

interface DbInspectorProps {
    selectedRow: Record<string, unknown> | null;
    onRowChange: (row: Record<string, unknown>) => void;
    allColumns: string[];
    isEditing: boolean;
    /**
     * Ignorate da #93 B3: lo stato del 2-step (DELETE -> CONFIRM / CANCEL) vive dentro
     * InspectorDeleteZone. Restano nel tipo perche' AdminDatabase le passa ancora.
     */
    showDeleteConfirm?: boolean;
    onShowDeleteConfirm?: (show: boolean) => void;
    onDelete: () => void;
}

/**
 * Corpo dell'inspector Database: vive dentro il Body di DataExplorerInspector, che e'
 * l'unico proprietario dello scroll (#93 B3). Niente contenitore scrollabile annidato.
 */
const DbInspector: React.FC<DbInspectorProps> = ({
    selectedRow,
    onRowChange,
    allColumns,
    isEditing,
    onDelete
}) => {
    if (!selectedRow) return null;

    return (
        <>
            {/* Form Content - 2 COLUMNS GRID */}
            <div className="px-6 py-6 bg-gray-50/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {(allColumns.length > 0 ? allColumns : Object.keys(selectedRow)).map(col => {
                        const isReadOnly = READ_ONLY_COLUMNS.includes(col);
                        const value = selectedRow[col] === null ? '' : typeof selectedRow[col] === 'object' ? JSON.stringify(selectedRow[col]) : selectedRow[col];
                        const stringValue = String(value);
                        const isLongText = stringValue.length > 100 || stringValue.includes('\n') ||
                            col.includes('description') || col.includes('note') ||
                            col.includes('content') || col.includes('text');
                        const rows = Math.min(Math.max(3, Math.ceil(stringValue.length / 80)), 10);

                        return (
                            <div key={col} className={cn(
                                "space-y-1.5",
                                isLongText && "md:col-span-2"
                            )}>
                                <div className="flex justify-between items-center">
                                    <SectionHeader title={col.replace(/_/g, ' ')} />
                                    {isReadOnly && (
                                        <span className="text-xs font-black text-sub uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                            READ ONLY
                                        </span>
                                    )}
                                </div>
                                {isLongText ? (
                                    <textarea
                                        disabled={isReadOnly || !isEditing}
                                        value={stringValue}
                                        onChange={e => onRowChange({ ...selectedRow, [col]: e.target.value })}
                                        rows={rows}
                                        className={cn(
                                            "w-full text-sm font-medium bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 resize-none shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                            (isReadOnly || !isEditing) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                        )}
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        disabled={isReadOnly || !isEditing}
                                        value={stringValue}
                                        onChange={e => onRowChange({ ...selectedRow, [col]: e.target.value })}
                                        className={cn(
                                            "text-sm font-medium bg-white dark:bg-gray-800 h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                            (isReadOnly || !isEditing) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                    {(allColumns.length === 0 && Object.keys(selectedRow).length === 0) && (
                        <SectionTitle tone="sub" className="col-span-2 text-center py-12">No schema data available.</SectionTitle>
                    )}
                </div>
            </div>

            {/* Delete Zone: etichette EN letterali come prima (le chiavi common esistono, adottarle e' una scelta i18n a parte) */}
            {isEditing && (
                (selectedRow.id || selectedRow.internal_id) ? (
                    <InspectorDeleteZone
                        onDelete={onDelete}
                        label="DELETE RECORD"
                        confirmLabel="CONFIRM"
                        cancelLabel="CANCEL"
                    />
                ) : (
                    // Riga nuova senza chiave: il chrome del footer restava vuoto sotto il form.
                    // Tenuto per invarianza; toglierlo e' una modifica visibile da decidere a parte.
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0" />
                )
            )}
        </>
    );
};

export default DbInspector;
