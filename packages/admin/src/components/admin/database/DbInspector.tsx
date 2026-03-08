import { Trash2 } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import { cn } from '../../../lib/utils';
import { READ_ONLY_COLUMNS } from '../../../hooks/useAdminDatabase';

interface DbInspectorProps {
    selectedRow: any;
    onRowChange: (row: any) => void;
    allColumns: string[];
    isEditing: boolean;
    showDeleteConfirm: boolean;
    onShowDeleteConfirm: (show: boolean) => void;
    onDelete: () => void;
}

const DbInspector: React.FC<DbInspectorProps> = ({
    selectedRow,
    onRowChange,
    allColumns,
    isEditing,
    showDeleteConfirm,
    onShowDeleteConfirm,
    onDelete
}) => {
    if (!selectedRow) return null;

    return (
        <div className="flex-1 overflow-auto no-scrollbar">
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
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
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
                                            "w-full text-sm font-medium bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 resize-none shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all",
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
                                            "text-sm font-medium bg-white dark:bg-gray-800 h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all",
                                            (isReadOnly || !isEditing) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                    {(allColumns.length === 0 && Object.keys(selectedRow).length === 0) && (
                        <p className="col-span-2 text-center text-gray-400 text-sm uppercase font-black py-12">No schema data available.</p>
                    )}
                </div>
            </div>

            {/* Delete Zone */}
            {isEditing && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0">
                    {(selectedRow.id || selectedRow.internal_id) && (
                        <div className="flex flex-col gap-2 max-w-sm mx-auto">
                            {!showDeleteConfirm ? (
                                <Button
                                    type="button"
                                    variant="olive"
                                    size="md"
                                    className="w-full justify-center h-11 text-[11px] font-black border-none uppercase tracking-widest shadow-lg shadow-red-500/20"
                                    startIcon={<Trash2 className="w-5 h-5 text-white" />}
                                    onClick={() => onShowDeleteConfirm(true)}
                                >
                                    DELETE RECORD
                                </Button>
                            ) : (
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        className="flex-1 justify-center h-11 text-[11px] font-black border-none uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1 shadow-lg shadow-red-500/20"
                                        onClick={onDelete}
                                    >
                                        CONFIRM
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 justify-center h-11 text-[11px] font-black text-gray-500 uppercase tracking-widest border-gray-200 dark:border-gray-700 bg-white"
                                        onClick={() => onShowDeleteConfirm(false)}
                                    >
                                        CANCEL
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DbInspector;
