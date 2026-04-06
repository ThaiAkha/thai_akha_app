import React from 'react';
import { Music, Video, Grid, Check, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    DataExplorerContent,
    GridCard,
    DataExplorerRow,
    DataCardContent
} from '../../../components/data-explorer';
import Badge from '../../../components/ui/badge/Badge';
import Checkbox from '../../../components/form/input/Checkbox';
import { type MediaAsset } from '@thaiakha/shared';

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
    const { t } = useTranslation('media');

    const isSelected = (id: string) => selectedIds.has(id);

    return (
        <DataExplorerContent
            loading={loading && filteredAssets.length === 0}
            emptyIcon={<Grid className="w-12 h-12 opacity-10" />}
            emptyMessage={t('content.emptyMessage')}
        >
            {filteredAssets.length > 0 && viewMode === 'grid' && (
                <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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
                                    renderFields={(a: any) => (
                                        <DataCardContent
                                            title={a.file_name}
                                            subtitle={a.asset_id || a.folder_path || 'general'}
                                            badges={
                                                <>
                                                    <Badge color="light" size="sm" className="text-[9px] font-bold uppercase tracking-widest bg-gray-100 border-gray-200">
                                                        {a.mime_type?.split('/')[1] || 'asset'}
                                                    </Badge>
                                                    {a.is_ai_generated && (
                                                        <Badge color="primary" size="sm" className="text-[9px] font-black uppercase tracking-widest">
                                                            AI GEN
                                                        </Badge>
                                                    )}
                                                </>
                                            }
                                            footerLeft={
                                                <p className="text-[9px] font-mono font-bold text-gray-400 tracking-tighter uppercase truncate max-w-[100px]">
                                                    {a.asset_id || 'NO-DB-SLUG'} {/* intentional technical fallback, not translated */}
                                                </p>
                                            }
                                            footerRight={
                                                <button
                                                    className={`size-6 rounded-md border flex items-center justify-center transition-all
                                                        ${isSelected(String(a.id)) ? 'bg-primary-500 border-primary-500' : 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-600'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleSelectRow(a);
                                                    }}
                                                >
                                                    {isSelected(String(a.id)) && <Check className="w-3.5 h-3.5 text-white" />}
                                                </button>
                                            }
                                        />
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {filteredAssets.length > 0 && viewMode === 'table' && (
                <div className="w-full text-xs font-sans overflow-hidden">
                    {/* CUSTOM GRID HEADER */}
                    <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 grid grid-cols-[1.8fr_3.2fr_2fr_5fr] items-center">
                        <div className="px-5 py-3 flex items-center gap-4 border-r border-gray-100 dark:border-gray-900/50 h-full">
                            <Checkbox
                                checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0}
                                onChange={onToggleSelectAll}
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('content.table.colMedia')}</span>
                        </div>
                        <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-r border-gray-100 dark:border-gray-900/50">
                            {t('content.table.colIdentity')}
                        </div>
                        <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-r border-gray-100 dark:border-gray-900/50">
                            {t('content.table.colSpecs')}
                        </div>
                        <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
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
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Asset ID: {asset.asset_id || 'NOT_SET'}</span>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1 truncate max-w-[200px]">
                                                {asset.file_name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate max-w-[200px]">
                                                {asset.title || t('content.table.untitledReference')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 items-center mt-1">
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                                /{asset.folder_path || 'root'}
                                            </span>
                                            <span className="text-[8px] font-mono font-bold text-gray-400 uppercase tracking-tighter">
                                                {asset.mime_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column 3: Tech Metrics */}
                                    <div className="px-5 py-4 flex flex-col gap-2 h-full border-r border-gray-100/50 dark:border-white/5 justify-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 italic">{asset.size_kb || 0} KB</span>
                                            <span className="text-[8px] text-gray-400">|</span>
                                            <span className="text-[10px] font-bold text-gray-500">{(asset as any).width || '?'} × {(asset as any).height || '?'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">
                                                © {(asset as any).copyright || 'Thai Akha'}
                                            </p>
                                            {(asset as any).tags?.length > 0 && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {(asset as any).tags.slice(0, 2).map((t: string) => (
                                                        <span key={t} className="text-[7px] font-black bg-gray-100 dark:bg-white/5 px-1 rounded text-gray-400 uppercase">#{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 4: Context & Actions (+20%) */}
                                    <div className="px-5 py-4 text-right flex items-center justify-end gap-6 h-full">
                                        <div className="hidden xl:flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-gray-400 uppercase">Created:</span>
                                                <span className="text-[9px] font-mono text-gray-500">{asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            {asset.is_ai_generated && (
                                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/10 flex items-center gap-1">
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
                                                className="group/btn relative inline-flex p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:scale-110 transition-all duration-500 shadow-xl shadow-gray-200/20 dark:shadow-none"
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
