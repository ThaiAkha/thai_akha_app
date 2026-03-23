import React, { useMemo, useState } from 'react';
import { Trash2, Image as ImageIcon, Volume2, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import Badge from '../../../components/ui/badge/Badge';
import { cn } from '@thaiakha/shared/lib/utils';
import { NEWS_READ_ONLY_COLUMNS } from '../../../hooks/useAdminNews';
import { useMediaResolver } from '../../../hooks/useMediaResolver';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type FieldCategory = 'cover' | 'title' | 'content' | 'audio' | 'gallery' | 'boolean' | 'meta' | 'system';


function categorizeField(key: string, value: any): FieldCategory {
    const k = key.toLowerCase();

    if (NEWS_READ_ONLY_COLUMNS.includes(key)) return 'system';

    // Single cover image
    if (['image_url', 'cover_image', 'thumbnail_url', 'hero_image_url', 'catalog_image_url', 'photo_url', 'img_url', 'avatar_url'].includes(k)
        || (k.endsWith('_image') && !k.includes('gallery') && !k.includes('images'))) return 'cover';

    // Audio
    if (k.includes('audio') || k === 'sound_url'
        || (typeof value === 'string' && /\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(value))) return 'audio';

    // Gallery — arrays or gallery-named fields
    if (k === 'gallery' || k === 'gallery_images' || k === 'images' || k === 'photos'
        || k.endsWith('_gallery') || k.endsWith('_images')
        || Array.isArray(value)) return 'gallery';

    // Boolean
    if (typeof value === 'boolean') return 'boolean';

    // Title / identifier
    if (['title', 'name', 'thai_name', 'label', 'slug', 'page_slug', 'category',
        'section_id', 'asset_id', 'file_name', 'display_order'].includes(k)) return 'title';

    // Content / long text
    if (k.includes('content') || k.includes('body') || k.includes('description')
        || k.includes('transcript') || k.includes('text') || k === 'subtitle' || k === 'caption'
        || (typeof value === 'string' && value.length > 80)) return 'content';

    return 'meta';
}


function parseGallery(value: any): string[] {
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string');
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.filter(v => typeof v === 'string');
        } catch { /* not JSON */ }
    }
    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({ label, isReadOnly = false }: { label: string; isReadOnly?: boolean }) {
    return (
        <div className="flex justify-between items-center mb-1.5">
            <SectionHeader title={label.replace(/_/g, ' ')} />
            {isReadOnly && (
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    READ ONLY
                </span>
            )}
        </div>
    );
}

function CoverImageField({ fieldKey, value, isEditing, onChange }: {
    fieldKey: string; value: any; isEditing: boolean; onChange: (v: string) => void;
}) {
    const rawValue = typeof value === 'string' ? value : '';
    const { urls: resolvedUrl, loading } = useMediaResolver(rawValue);
    const [imgError, setImgError] = useState(false);

    // Use resolved URL if available, otherwise fall back to raw value (in case it's already a full URL)
    const displayUrl = (typeof resolvedUrl === 'string' ? resolvedUrl : null) || rawValue;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <SectionHeader title={fieldKey.replace(/_/g, ' ')} />
                {loading && <span className="text-[8px] text-gray-400">resolving...</span>}
                {displayUrl && <span className="text-[8px] text-gray-400 font-mono truncate">{displayUrl.substring(0, 30)}...</span>}
            </div>
            {displayUrl && !imgError && !loading ? (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
                    <img
                        src={displayUrl}
                        alt={fieldKey}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.error(`[Image Error] ${fieldKey}:`, displayUrl, e);
                            setImgError(true);
                        }}
                    />
                </div>
            ) : (
                <div className="rounded-xl bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center flex-col gap-2">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                    {!loading && displayUrl && imgError && (
                        <p className="text-[9px] text-gray-400 font-mono text-center px-2">
                            Failed to load
                        </p>
                    )}
                    {loading && (
                        <p className="text-[9px] text-gray-400">Loading...</p>
                    )}
                </div>
            )}
            {isEditing && (
                <Input
                    type="text"
                    value={rawValue}
                    onChange={e => { setImgError(false); onChange(e.target.value); }}
                    placeholder="Media ID or URL"
                    className="text-xs font-mono bg-white dark:bg-gray-800 h-9 px-3 rounded-lg shadow-sm"
                />
            )}
        </div>
    );
}

function AudioField({ fieldKey, value, isEditing, onChange }: {
    fieldKey: string; value: any; isEditing: boolean; onChange: (v: string) => void;
}) {
    const rawValue = typeof value === 'string' ? value : '';
    const { urls: resolvedUrl, loading } = useMediaResolver(rawValue);
    const displayUrl = (typeof resolvedUrl === 'string' ? resolvedUrl : null) || rawValue;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <SectionHeader title={fieldKey.replace(/_/g, ' ')} />
                {loading && <span className="text-[8px] text-purple-400">resolving...</span>}
            </div>
            {displayUrl && !loading ? (
                <div className="rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 p-3">
                    <audio
                        controls
                        src={displayUrl}
                        className="w-full h-10"
                        style={{ colorScheme: 'light' }}
                        onError={(e) => {
                            console.error(`[Audio Error] ${fieldKey}:`, displayUrl, e);
                        }}
                    >
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ) : (
                <div className="rounded-xl bg-purple-50/50 dark:bg-purple-900/5 border border-dashed border-purple-200 dark:border-purple-900/20 p-4 flex items-center gap-3">
                    <Volume2 className="w-6 h-6 text-purple-300" />
                    <span className="text-xs text-gray-400 italic">
                        {loading ? 'Loading audio...' : 'No audio URL set'}
                    </span>
                </div>
            )}
            {isEditing && (
                <Input
                    type="text"
                    value={rawValue}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Media ID or URL"
                    className="text-xs font-mono bg-white dark:bg-gray-800 h-9 px-3 rounded-lg shadow-sm"
                />
            )}
        </div>
    );
}

function GalleryField({ fieldKey, value, isEditing, onChange }: {
    fieldKey: string; value: any; isEditing: boolean; onChange: (v: any) => void;
}) {
    const mediaIds = parseGallery(value);
    const { urls: resolvedUrls, loading } = useMediaResolver(mediaIds.length > 0 ? mediaIds : null);
    const rawJson = typeof value === 'string' ? value : JSON.stringify(value ?? [], null, 2);

    // Resolved URLs might be string (single) or array
    const displayUrls = Array.isArray(resolvedUrls) ? resolvedUrls : (resolvedUrls ? [resolvedUrls] : mediaIds);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <SectionHeader title={fieldKey.replace(/_/g, ' ')} />
                {loading && <span className="text-[8px] text-blue-400">resolving...</span>}
                {displayUrls.length > 0 && (
                    <span className="text-[9px] font-black text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {displayUrls.length} items
                    </span>
                )}
            </div>

            {displayUrls.length > 0 && !loading ? (
                <div className="grid grid-cols-4 gap-1.5">
                    {displayUrls.map((url, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                                src={url}
                                alt={`${fieldKey}[${i}]`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.warn(`[Gallery] Failed to load image ${i}:`, url);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl bg-blue-50/50 dark:bg-blue-900/5 border border-dashed border-blue-200 dark:border-blue-900/20 p-4 flex items-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-blue-300" />
                    <span className="text-xs text-gray-400 italic">
                        {loading ? 'Loading gallery...' : 'Empty gallery'}
                    </span>
                </div>
            )}

            {isEditing && (
                <textarea
                    value={rawJson}
                    onChange={e => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            onChange(parsed);
                        } catch {
                            onChange(e.target.value);
                        }
                    }}
                    rows={4}
                    placeholder='["https://url1.jpg", "https://url2.jpg"]'
                    className="w-full text-xs font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 resize-none shadow-sm focus:ring-2 focus:ring-primary-500/20"
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface NewsInspectorProps {
    selectedRow: any;
    onRowChange: (row: any) => void;
    allColumns: string[];
    isEditing: boolean;
    showDeleteConfirm: boolean;
    onShowDeleteConfirm: (show: boolean) => void;
    onDelete: () => void;
}

const NewsInspector: React.FC<NewsInspectorProps> = ({
    selectedRow,
    onRowChange,
    allColumns,
    isEditing,
    showDeleteConfirm,
    onShowDeleteConfirm,
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
        <div className="flex-1 overflow-auto no-scrollbar">
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
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors w-full mb-3"
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

            {/* DELETE ZONE */}
            {isEditing && (selectedRow.id || selectedRow.internal_id) && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                    <div className="flex flex-col gap-2">
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
                                    className="flex-1 justify-center h-11 text-[11px] font-black border-none uppercase tracking-widest shadow-lg shadow-red-500/20"
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
                </div>
            )}
        </div>
    );
};

export default NewsInspector;
