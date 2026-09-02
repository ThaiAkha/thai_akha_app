/**
 * News Inspector - campi media della riga: cover (asset id → anteprima), audio, gallery, etichetta.
 * Estratti da NewsInspector.tsx (#16 split monstre) a comportamento invariato.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Volume2, LayoutGrid } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import { Caption, SectionTitle } from '../../typography';
import { useMediaResolver } from '../../../hooks/useMediaResolver';
import { parseGallery } from './newsFieldUtils';

export function FieldLabel({ label, isReadOnly = false }: { label: string; isReadOnly?: boolean }) {
    return (
        <div className="flex justify-between items-center mb-1.5">
            <SectionTitle as="h6" tone="sub" className="mb-2">{label.replace(/_/g, ' ')}</SectionTitle>
            {isReadOnly && (
                <span className="text-xs font-black text-sub uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    READ ONLY
                </span>
            )}
        </div>
    );
}

export function CoverImageField({ fieldKey, value, isEditing, onChange }: {
    fieldKey: string; value: unknown; isEditing: boolean; onChange: (v: string) => void;
}) {
    const { t } = useTranslation('pages');
    const rawValue = typeof value === 'string' ? value : '';
    const { urls: resolvedUrl, loading } = useMediaResolver(rawValue);
    const [imgError, setImgError] = useState(false);

    // Use resolved URL if available, otherwise fall back to raw value (in case it's already a full URL)
    const displayUrl = (typeof resolvedUrl === 'string' ? resolvedUrl : null) || rawValue;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <SectionTitle as="h6" tone="sub" className="mb-2">{fieldKey.replace(/_/g, ' ')}</SectionTitle>
                {loading && <span className="text-xs text-sub">resolving...</span>}
                {displayUrl && <span className="text-xs text-sub font-mono truncate">{displayUrl.substring(0, 30)}...</span>}
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
                        <Caption className="font-mono text-center px-2">
                            Failed to load
                        </Caption>
                    )}
                    {loading && (
                        <Caption>Loading...</Caption>
                    )}
                </div>
            )}
            {isEditing && (
                <Input
                    type="text"
                    value={rawValue}
                    onChange={e => { setImgError(false); onChange(e.target.value); }}
                    placeholder={t('news.placeholderMediaId')}
                    className="text-xs font-mono bg-white dark:bg-gray-800 h-9 px-3 rounded-lg shadow-sm"
                />
            )}
        </div>
    );
}

export function AudioField({ fieldKey, value, isEditing, onChange }: {
    fieldKey: string; value: unknown; isEditing: boolean; onChange: (v: string) => void;
}) {
    const { t } = useTranslation('pages');
    const rawValue = typeof value === 'string' ? value : '';
    const { urls: resolvedUrl, loading } = useMediaResolver(rawValue);
    const displayUrl = (typeof resolvedUrl === 'string' ? resolvedUrl : null) || rawValue;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <SectionTitle as="h6" tone="sub" className="mb-2">{fieldKey.replace(/_/g, ' ')}</SectionTitle>
                {loading && <span className="text-xs text-purple-400">resolving...</span>}
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
                    <span className="text-xs text-sub italic">
                        {loading ? 'Loading audio...' : 'No audio URL set'}
                    </span>
                </div>
            )}
            {isEditing && (
                <Input
                    type="text"
                    value={rawValue}
                    onChange={e => onChange(e.target.value)}
                    placeholder={t('news.placeholderMediaId')}
                    className="text-xs font-mono bg-white dark:bg-gray-800 h-9 px-3 rounded-lg shadow-sm"
                />
            )}
        </div>
    );
}

export function GalleryField({ fieldKey, value, isEditing, onChange }: {
    fieldKey: string; value: unknown; isEditing: boolean; onChange: (v: unknown) => void;
}) {
    const mediaIds = parseGallery(value);
    const { urls: resolvedUrls, loading } = useMediaResolver(mediaIds.length > 0 ? mediaIds : null);
    const rawJson = typeof value === 'string' ? value : JSON.stringify(value ?? [], null, 2);

    // Resolved URLs might be string (single) or array
    const displayUrls = Array.isArray(resolvedUrls) ? resolvedUrls : (resolvedUrls ? [resolvedUrls] : mediaIds);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="w-4 h-4 text-info" />
                <SectionTitle as="h6" tone="sub" className="mb-2">{fieldKey.replace(/_/g, ' ')}</SectionTitle>
                {loading && <span className="text-xs text-info">resolving...</span>}
                {displayUrls.length > 0 && (
                    <span className="text-xs font-black text-info bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
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
                    <span className="text-xs text-sub italic">
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
//
