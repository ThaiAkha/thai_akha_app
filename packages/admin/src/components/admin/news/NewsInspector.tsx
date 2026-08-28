import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import Badge from '../../../components/ui/badge/Badge';
import { InspectorDeleteZone } from '../../ui/inspector';
import { cn } from '@thaiakha/shared/lib/utils';
import { NEWS_READ_ONLY_COLUMNS } from '../../../hooks/useAdminNews';
import { categorizeField, type FieldCategory } from './newsFieldUtils';
import { FieldLabel, CoverImageField, AudioField, GalleryField } from './NewsMediaFields';

interface NewsInspectorProps {
    selectedRow: Record<string, unknown> | null;
    onRowChange: (row: Record<string, unknown>) => void;
    allColumns: string[];
    isEditing: boolean;
    /**
     * Ignorate da #93 B3: lo stato del 2-step (DELETE -> CONFIRM / CANCEL) vive dentro
     * InspectorDeleteZone. Restano nel tipo perche' AdminNews le passa ancora.
     */
    showDeleteConfirm?: boolean;
    onShowDeleteConfirm?: (show: boolean) => void;
    onDelete: () => void;
}

/**
 * Corpo dell'inspector News: vive dentro il Body di DataExplorerInspector, che e'
 * l'unico proprietario dello scroll (#93 B3). Niente contenitore scrollabile annidato.
 */
const NewsInspector: React.FC<NewsInspectorProps> = ({
    selectedRow,
    onRowChange,
    allColumns,
    isEditing,
    onDelete,
}) => {
    const [systemExpanded, setSystemExpanded] = useState(false);

    const grouped = useMemo(() => {
        const keys = allColumns.length > 0 ? allColumns : Object.keys(selectedRow ?? {});
        const groups: Record<FieldCategory, string[]> = {
            cover: [], title: [], content: [], audio: [], gallery: [], boolean: [], meta: [], system: [],
        };
        keys.forEach(k => {
            const cat = categorizeField(k, selectedRow?.[k]);
            groups[cat].push(k);
        });
        return groups;
    }, [allColumns, selectedRow]);

    if (!selectedRow) return null;

    const renderField = (col: string) => {
        const isReadOnly = NEWS_READ_ONLY_COLUMNS.includes(col);
        const value = selectedRow[col] === null ? '' : selectedRow[col];
        const cat = categorizeField(col, value);

        if (cat === 'cover') {
            return (
                <CoverImageField
                    key={col}
                    fieldKey={col}
                    value={value}
                    isEditing={isEditing}
                    onChange={v => onRowChange({ ...selectedRow, [col]: v })}
                />
            );
        }

        if (cat === 'audio') {
            return (
                <AudioField
                    key={col}
                    fieldKey={col}
                    value={value}
                    isEditing={isEditing}
                    onChange={v => onRowChange({ ...selectedRow, [col]: v })}
                />
            );
        }

        if (cat === 'gallery') {
            return (
                <GalleryField
                    key={col}
                    fieldKey={col}
                    value={value}
                    isEditing={isEditing}
                    onChange={v => onRowChange({ ...selectedRow, [col]: v })}
                />
            );
        }

        if (cat === 'boolean') {
            return (
                <div key={col} className="space-y-1">
                    <FieldLabel label={col} />
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={isReadOnly || !isEditing}
                            onClick={() => isEditing && onRowChange({ ...selectedRow, [col]: !value })}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                value ? "bg-lime-500" : "bg-gray-200 dark:bg-gray-700",
                                (isReadOnly || !isEditing) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                value ? "translate-x-6" : "translate-x-1"
                            )} />
                        </button>
                        <Badge color={value ? 'success' : 'light'} size="sm">
                            {String(value).toUpperCase()}
                        </Badge>
                    </div>
                </div>
            );
        }

        // Text / meta / title / content / system
        const stringValue = value === null || value === undefined ? ''
            : typeof value === 'object' ? JSON.stringify(value) : String(value);
        const isLong = stringValue.length > 100 || stringValue.includes('\n')
            || cat === 'content';
        const rows = Math.min(Math.max(3, Math.ceil(stringValue.length / 60)), 12);

        return (
            <div key={col} className="space-y-1">
                <FieldLabel label={col} isReadOnly={isReadOnly} />
                {isLong ? (
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
    };

    return (
        <>
            <div className="px-6 py-6 space-y-8">

                {/* COVER IMAGES */}
                {grouped.cover.length > 0 && (
                    <section className="space-y-4">
                        {grouped.cover.map(col => renderField(col))}
                    </section>
                )}

                {/* TITLE / IDENTIFIERS */}
                {grouped.title.length > 0 && (
                    <section className="space-y-4">
                        <div className="h-px bg-gray-100 dark:bg-gray-800" />
                        <div className="grid grid-cols-1 gap-4">
                            {grouped.title.map(col => renderField(col))}
                        </div>
                    </section>
                )}

                {/* CONTENT / TEXT */}
                {grouped.content.length > 0 && (
                    <section className="space-y-4">
                        <div className="h-px bg-gray-100 dark:bg-gray-800" />
                        {grouped.content.map(col => renderField(col))}
                    </section>
                )}

                {/* AUDIO */}
                {grouped.audio.length > 0 && (
                    <section className="space-y-4">
                        <div className="h-px bg-gray-100 dark:bg-gray-800" />
                        {grouped.audio.map(col => renderField(col))}
                    </section>
                )}

                {/* GALLERY */}
                {grouped.gallery.length > 0 && (
                    <section className="space-y-4">
                        <div className="h-px bg-gray-100 dark:bg-gray-800" />
                        {grouped.gallery.map(col => renderField(col))}
                    </section>
                )}

                {/* BOOLEANS */}
                {grouped.boolean.length > 0 && (
                    <section>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            {grouped.boolean.map(col => renderField(col))}
                        </div>
                    </section>
                )}

                {/* META */}
                {grouped.meta.length > 0 && (
                    <section>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            {grouped.meta.map(col => renderField(col))}
                        </div>
                    </section>
                )}

                {/* SYSTEM (collapsible) */}
                {grouped.system.length > 0 && (
                    <section>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 mb-3" />
                        <button
                            type="button"
                            onClick={() => setSystemExpanded(!systemExpanded)}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sub hover:text-body transition-colors w-full mb-3"
                        >
                            {systemExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            System Fields ({grouped.system.length})
                        </button>
                        {systemExpanded && (
                            <div className="grid grid-cols-1 gap-3">
                                {grouped.system.map(col => renderField(col))}
                            </div>
                        )}
                    </section>
                )}

            </div>

            {/* DELETE ZONE: etichette EN letterali come prima (le chiavi common esistono, adottarle e' una scelta i18n a parte) */}
            {isEditing && Boolean(selectedRow.id || selectedRow.internal_id) && (
                <InspectorDeleteZone
                    onDelete={onDelete}
                    label="DELETE RECORD"
                    confirmLabel="CONFIRM"
                    cancelLabel="CANCEL"
                    contentClassName="flex flex-col gap-2"
                    animate={false}
                />
            )}
        </>
    );
};

export default NewsInspector;
