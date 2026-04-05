import React from 'react';
import { 
    FileText, 
    Link as LinkIcon, 
    Copy,
    Settings,
    Tag,
    Trash2,
    Info,
    Layers,
    Monitor,
    Zap,
    Check,
    Database,
    Clock,
    User
} from 'lucide-react';
import { type MediaAsset } from '@thaiakha/shared';

interface MediaInspectorProps {
    editingAsset: MediaAsset;
    onEditingAssetChange: (asset: MediaAsset) => void;
    isEditing: boolean;
    isNew: boolean;
    onDelete: () => void;
}

const MediaInspector: React.FC<MediaInspectorProps> = ({
    editingAsset,
    onEditingAssetChange,
    isEditing,
    isNew,
    onDelete
}) => {
    
    const handleChange = (field: keyof MediaAsset, value: any) => {
        onEditingAssetChange({ ...editingAsset, [field]: value });
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(editingAsset.image_url);
        alert("URL copied to clipboard kha!");
    };

    return (
        <div className="p-6 space-y-8 pb-20">
            {/* Realtime Preview */}
            {editingAsset.image_url && (
                <div className="relative group">
                    <div className="aspect-video w-full rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5">
                        {editingAsset.mime_type?.includes('audio') || editingAsset.folder_path?.includes('audio') ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/20">
                                <div className="p-6 rounded-full bg-blue-500 text-white shadow-glow-blue animate-pulse">
                                    <Info className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-bold text-blue-500 uppercase tracking-widest italic font-display">Audio Story Mode</p>
                                <audio controls className="w-[80%] opacity-80" src={editingAsset.image_url} />
                            </div>
                        ) : (
                            <img src={editingAsset.image_url} alt="Preview" className="w-full h-full object-contain" />
                        )}
                    </div>
                </div>
            )}

            {/* 1. CORE IDENTITY & HIERARCHY */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
                    <Settings className="w-4 h-4 text-primary-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">Core Identity</h3>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Asset ID (NEW) */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-500 italic">User-Defined Asset ID</label>
                        <input
                            type="text"
                            value={editingAsset.asset_id || ''}
                            onChange={e => handleChange('asset_id', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 bg-primary-500/5 dark:bg-primary-500/10 border-2 border-primary-500/10 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all text-xs font-black text-primary-600 outline-none disabled:opacity-60 placeholder:text-primary-300"
                            placeholder="e.g. hero-recipe-image"
                        />
                    </div>

                    {/* File Name Field */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Storage File Name</label>
                        <input
                            type="text"
                            value={editingAsset.file_name}
                            onChange={e => handleChange('file_name', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all text-xs font-bold font-mono outline-none disabled:opacity-60"
                            placeholder="dish-01.webp"
                        />
                    </div>

                    {/* Folder Path Field */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Organizational Path</label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={editingAsset.folder_path}
                                onChange={e => handleChange('folder_path', e.target.value)}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all text-xs font-bold text-emerald-600 outline-none disabled:opacity-60 italic"
                                placeholder="recipes"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ASSET ACCESS (URL & MIME) */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Access & Format</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Public Access URL</label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={editingAsset.image_url}
                                onChange={e => handleChange('image_url', e.target.value)}
                                disabled={!isEditing}
                                className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all text-[10px] font-bold font-mono outline-none disabled:opacity-60 truncate"
                            />
                            <button 
                                onClick={handleCopyUrl}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white dark:bg-white/10 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Mime Type</label>
                            <input
                                type="text"
                                value={editingAsset.mime_type || ''}
                                onChange={e => handleChange('mime_type', e.target.value)}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[10px] font-mono font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">File Size</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={editingAsset.size_kb || 0}
                                    onChange={e => handleChange('size_kb', parseFloat(e.target.value))}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-bold"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400">KB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. VISUAL DIMENSIONS */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
                    <Monitor className="w-4 h-4 text-purple-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Visual Metrics</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Width (px)</label>
                        <input
                            type="number"
                            value={(editingAsset as any).width || ''}
                            onChange={e => handleChange('width' as any, parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Height (px)</label>
                        <input
                            type="number"
                            value={(editingAsset as any).height || ''}
                            onChange={e => handleChange('height' as any, parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-bold"
                        />
                    </div>
                </div>
            </section>

            {/* 4. SEO, ACCESSIBILITY & CONTENT */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Content & SEO</h3>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Display Title</label>
                        <input
                            type="text"
                            value={editingAsset.title || ''}
                            onChange={e => handleChange('title', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-emerald-500/50 focus:bg-white dark:focus:bg-gray-800 rounded-xl transition-all text-xs font-bold outline-none disabled:opacity-60"
                            placeholder="Beautiful Dish with Akha Herbs"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Description / Caption</label>
                        <textarea
                            value={(editingAsset as any).caption || ''}
                            onChange={e => handleChange('caption' as any, e.target.value)}
                            disabled={!isEditing}
                            rows={2}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-emerald-500/50 rounded-xl transition-all text-xs font-medium outline-none resize-none disabled:opacity-60"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Alt Text (Accessibility)</label>
                        <textarea
                            value={editingAsset.alt_text || ''}
                            onChange={e => handleChange('alt_text', e.target.value)}
                            disabled={!isEditing}
                            rows={2}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-emerald-500/50 rounded-xl transition-all text-xs font-medium outline-none resize-none disabled:opacity-60"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Tags (Comma Separated)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={(editingAsset as any).tags?.join(', ') || ''}
                                onChange={e => handleChange('tags' as any, e.target.value.split(',').map(t => t.trim()))}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-bold outline-none"
                                placeholder="organic, spicy, akha"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Copyright / Source</label>
                        <input
                            type="text"
                            value={(editingAsset as any).copyright || ''}
                            onChange={e => handleChange('copyright' as any, e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-bold outline-none"
                            placeholder="© Thai Akha Kitchen"
                        />
                    </div>
                </div>
            </section>

            {/* 5. AI INTELLIGENCE */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">AI Metadata</h3>
                </div>

                <div className={`p-5 rounded-2xl border transition-all duration-500 
                    ${editingAsset.is_ai_generated ? 'bg-orange-500/5 border-orange-500/20 shadow-glow-orange/5' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-60'}`}
                >
                    <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-orange-600">AI Generated</label>
                            <p className="text-[9px] text-gray-400 italic">Toggle if generated by AI</p>
                            </div>
                            <button
                            onClick={() => isEditing && handleChange('is_ai_generated', !editingAsset.is_ai_generated)}
                            disabled={!isEditing}
                            className={`size-7 rounded-lg border flex items-center justify-center transition-all shadow-sm
                                ${editingAsset.is_ai_generated ? 'bg-orange-500 border-orange-500' : 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-600'}`}
                            >
                            {editingAsset.is_ai_generated && <Check className="w-4 h-4 text-white" />}
                            </button>
                    </div>
                    {editingAsset.is_ai_generated && (
                            <div className="relative">
                            <label className="absolute -top-2 left-2 px-1 bg-orange-100 dark:bg-orange-950 text-[8px] font-black text-orange-600 uppercase rounded">Tool Engine</label>
                            <input
                                type="text"
                                value={editingAsset.ai_tool || ''}
                                onChange={e => handleChange('ai_tool', e.target.value)}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 bg-white dark:bg-black/20 border border-orange-500/20 rounded-lg text-xs font-bold text-orange-600 outline-none"
                                placeholder="e.g. Midjourney"
                            />
                            </div>
                    )}
                </div>
            </section>

            {/* 6. STATIC SYSTEM PROPERTIES (Read-Only) */}
            <section className="space-y-6 opacity-80 group">
                <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
                    <Database className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-primary-600">System Properties</h3>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Info className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">Database UUID</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-gray-500 select-all">{editingAsset.id}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">Uploaded By</span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-500">{(editingAsset as any).uploaded_by || 'System Admin'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">Created</span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-500">{editingAsset.created_at ? new Date(editingAsset.created_at).toLocaleString() : 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">Last Update</span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-500">{(editingAsset as any).updated_at ? new Date((editingAsset as any).updated_at).toLocaleString() : 'Just now'}</span>
                    </div>
                </div>
            </section>

            {/* Dangerous Zone */}
            {!isNew && (
                <div className="pt-10">
                    <button 
                        onClick={onDelete}
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] group"
                    >
                        <Trash2 size={16} className="group-hover:animate-bounce" />
                        De-Index Asset
                    </button>
                    <p className="mt-3 text-[9px] text-gray-400 text-center italic leading-relaxed px-4">
                        Removes database mapping from Thai Akha CDN. <br/>Physical files in storage persist for safety.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MediaInspector;
