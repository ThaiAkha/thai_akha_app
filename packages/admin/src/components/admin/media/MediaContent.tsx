import React from 'react';
import { Music, Video, Grid, Check, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    DataExplorerContent,
    GridCard,
    DataExplorerRow,
    DataCardContent,
    CardGrid
} from '../../../components/data-explorer';
import Badge from '../../../components/ui/badge/Badge';
import Checkbox from '../../../components/form/input/Checkbox';
import { Paragraph, SectionTitle } from '../../typography';
import { type MediaAsset } from '@thaiakha/shared';
import { getLocaleCode } from '../../../lib/dateFormatter';

// Locale da sorgente unica: copre tutte e 4 le lingue (en/th/es/zh).
const getLocale = getLocaleCode;

interface MediaContentProps {
    loading: boolean;
    viewMode: 'grid' | 'table';
    filteredAssets: MediaAsset[];
    editingAsset: MediaAsset;
    onAssetSelect: (asset: MediaAsset) => void;
    selectedIds: Set<string>;
    onToggleSelectAll: () => void;
    onToggleSelectRow: (asset: MediaAsset) => void;
}

const MediaContent: React.FC<MediaContentProps> = ({
    loading,
    viewMode,
    filteredAssets,
    editingAsset,
    onAssetSelect,
    selectedIds,
    onToggleSelectAll,
    onToggleSelectRow
}) => {
    const { t, i18n } = useTranslation('media');

    const isSelected = (id: string) => selectedIds.has(id);

    return (
        <DataExplorerContent
            loading={loading && filteredAssets.length === 0}
            isEmpty={filteredAssets.length === 0}
            emptyIcon={<Grid className="w-12 h-12 opacity-10" />}
            emptyMessage={t('content.emptyMessage')}
        >
            {viewMode === 'grid' && (
                <CardGrid padding={5} gap={4} className="xl:grid-cols-4">
                    {filteredAssets.map((asset) => {
                        const isAudio = asset.mime_type?.includes('audio') || asset.folder_path?.includes('audio');
                        const isVideo = asset.mime_type?.includes('video');

                        return (
                            <GridCard
                                key={asset.id}
                                item={asset}
                                selected={editingAsset?.id === asset.id}
                                onClick={() => onAssetSelect(asset)}
                                aspectClassName="aspect-video"
                                imageUrl={!isAudio && !isVideo ? asset.image_url : undefined}
                                imageIcon={
                                    isAudio ? <Music className="w-8 h-8 text-blue-500" /> :
                                        isVideo ? <Video className="w-8 h-8 text-purple-500" /> :
                                            undefined
                                }
                                renderFields={() => (
                                    <DataCardContent
                                        title={asset.file_name}
                                        subtitle={asset.asset_id || asset.folder_path || 'general'}
                                        badges={
                                            <>
                                                <Badge color="light" size="sm" className="text-xs font-bold uppercase tracking-widest bg-gray-100 border-gray-200">
                                                    {asset.mime_type?.split('/')[1] || 'asset'}
                                                </Badge>
                                                {asset.is_ai_generated && (
                                                    <Badge color="primary" size="sm" className="text-xs font-black uppercase tracking-widest">
                                                        AI GEN
                                                    </Badge>
                                                )}
                                            </>
                                        }
                                        footerLeft={
                                            <SectionTitle tone="sub" className="font-mono tracking-tighter truncate max-w-[100px]">
                                                {asset.asset_id || 'NO-DB-SLUG'} {/* intentional technical fallback, not translated */}
                                            </SectionTitle>
                                        }
                                        footerRight={
                                            <button
                                                className={`size-6 rounded-md border flex items-center justify-center transition-all
                                                    ${isSelected(String(asset.id)) ? 'bg-primary-500 border-primary-500' : 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-600'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleSelectRow(asset);
                                                }}
                                            >
                                                {isSelected(String(asset.id)) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                        }
                                    />
                                )}
                            />
                        );
                    })}
                </CardGrid>
            )}

            {viewMode === 'table' && (
                <div className="w-full text-xs font-sans overflow-hidden">
                    {/* CUSTOM GRID HEADER */}
                    <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 grid grid-cols-[1.8fr_3.2fr_2fr_5fr] items-center">
                        <div className="px-5 py-3 flex items-center gap-4 border-r border-gray-100 dark:border-gray-900/50 h-full">
                            <Checkbox
                                checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0}
                                onChange={onToggleSelectAll}
                            />
                            <span className="text-xs font-black uppercase tracking-widest text-sub">{t('content.table.colMedia')}</span>
                        </div>
                        <div className="px-5 py-3 text-xs font-black uppercase tracking-widest text-sub border-r border-gray-100 dark:border-gray-900/50">
                            {t('content.table.colIdentity')}
                        </div>
                        <div className="px-5 py-3 text-xs font-black uppercase tracking-widest text-sub border-r border-gray-100 dark:border-gray-900/50">
                            {t('content.table.colSpecs')}
                        </div>
                        <div className="px-5 py-3 text-xs font-black uppercase tracking-widest text-sub text-right">
                            {t('content.table.colContext')}
                        </div>
                    </div>

                    {/* CUSTOM GRID BODY */}
                    <div className="flex flex-col">
                        {filteredAssets.map((asset, idx) => {
                            const isAudio = asset.mime_type?.includes('audio') || asset.folder_path?.includes('audio');
                            const isVideo = asset.mime_type?.includes('video');

                            return (
                                <DataExplorerRow
                                    key={asset.id}
                                    idx={idx}
                                    selected={editingAsset?.id === asset.id}
                                    onClick={() => onAssetSelect(asset)}
                                    className="grid grid-cols-[1.8fr_3.2fr_2fr_5fr] items-stretch border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group h-auto min-h-[120px]"
                                >
                                    {/* Column 1: Visual Base (100px 16:9) */}
                                    <div className="px-5 py-4 flex items-center gap-4 h-full border-r border-gray-100/50 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={isSelected(String(asset.id))}
                                            onChange={() => onToggleSelectRow(asset)}
                                        />
                                        <div className="h-[90px] aspect-[16/9] rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 shrink-0">
                                            {isAudio ? <Music className="w-8 h-8 text-blue-500" /> :
                                                isVideo ? <Video className="w-8 h-8 text-purple-500" /> :
                                                    <img src={asset.image_url} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                    </div>

                                    {/* Column 2: Identity Stack */}
                                    <div className="px-5 py-4 flex flex-col gap-1.5 h-full border-r border-gray-100/50 dark:border-white/5 justify-center">
                                        <span className="text-xs font-black text-primary-500 uppercase tracking-widest">Asset ID: {asset.asset_id || 'NOT_SET'}</span>
                                        <div className="flex flex-col">
                                            <Paragraph size="xs" className="tracking-tight mb-1 truncate max-w-[200px] text-title font-black">
                                                {asset.file_name}
                                            </Paragraph>
                                            <SectionTitle tone="sub" className="tracking-tighter truncate max-w-[200px]">
                                                {asset.title || t('content.table.untitledReference')}
                                            </SectionTitle>
                                        </div>
                                        <div className="flex gap-2 items-center mt-1">
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs font-black text-emerald-600 uppercase tracking-widest">
                                                /{asset.folder_path || 'root'}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-sub uppercase tracking-tighter">
                                                {asset.mime_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column 3: Tech Metrics */}
                                    <div className="px-5 py-4 flex flex-col gap-2 h-full border-r border-gray-100/50 dark:border-white/5 justify-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-sub italic">{asset.size_kb || 0} KB</span>
                                            <span className="text-xs text-sub">|</span>
                                            <span className="text-xs font-bold text-sub">{asset.width || '?'} × {asset.height || '?'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <SectionTitle tone="sub" className="tracking-widest truncate max-w-[150px]">
                                                © {asset.copyright || 'Thai Akha'}
                                            </SectionTitle>
                                            {asset.tags && asset.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {asset.tags.slice(0, 2).map((t: string) => (
                                                        <span key={t} className="text-xs font-black bg-gray-100 dark:bg-white/5 px-1 rounded text-sub uppercase">#{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 4: Context & Actions (+20%) */}
                                    <div className="px-5 py-4 text-right flex items-center justify-end gap-6 h-full">
                                        <div className="hidden xl:flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-black text-sub uppercase">Created:</span>
                                                <span className="text-xs font-mono text-sub">{asset.created_at ? new Date(asset.created_at).toLocaleDateString(getLocale(i18n.language)) : 'N/A'}</span>
                                            </div>
                                            {asset.is_ai_generated && (
                                                <span className="text-xs font-black text-warning uppercase tracking-tighter bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10 flex items-center gap-1">
                                                    AI: {asset.ai_tool || 'GENERIC'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (asset.image_url) {
                                                        window.open(asset.image_url, '_blank', 'noopener,noreferrer');
                                                    } else {
                                                        alert(t('content.table.noUrl'));
                                                    }
                                                }}
                                                className="group/btn relative inline-flex p-3.5 rounded-2xl bg-surface border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:scale-110 transition-all duration-500 shadow-xl shadow-gray-200/20 dark:shadow-none"
                                                title={t('content.table.openInNewWindow')}
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </DataExplorerRow>
                            );
                        })}
                    </div>
                </div>
            )}


        </DataExplorerContent>
    );
};

export default MediaContent;
