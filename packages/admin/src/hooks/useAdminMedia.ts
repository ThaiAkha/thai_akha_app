import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { type MediaAsset } from '@thaiakha/shared';

export type { MediaAsset };

export interface MediaCategory {
    id: string;
    title: string;
    count: number;
}

export function useAdminMedia() {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Inspector state
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('media_assets')
                .select('*')
                .order('asset_id', { ascending: true });

            if (error) throw error;
            setAssets(data || []);
        } catch (err) {
            console.error('Error fetching media:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const categories = useMemo(() => {
        const folders: Record<string, number> = {};
        assets.forEach(asset => {
            const path = asset.folder_path || 'general';
            folders[path] = (folders[path] || 0) + 1;
        });

        return Object.entries(folders).map(([id, count]) => ({
            id,
            title: id.charAt(0).toUpperCase() + id.slice(1),
            count
        }));
    }, [assets]);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchesSearch = 
                asset.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.folder_path?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFolder = selectedFolder === 'all' || asset.folder_path === selectedFolder;

            return matchesSearch && matchesFolder;
        });
    }, [assets, searchTerm, selectedFolder]);

    const handleAssetSelect = (asset: MediaAsset) => {
        setEditingAsset(asset);
        setIsEditing(false);
        setIsNew(false);
        setIsInspectorOpen(true);
    };

    const handleCreateNew = () => {
        setEditingAsset({
            id: crypto.randomUUID(),
            file_name: '',
            folder_path: 'general',
            image_url: '',
            is_ai_generated: false
        } as MediaAsset);
        setIsEditing(true);
        setIsNew(true);
        setIsInspectorOpen(true);
    };

    const handleSave = async () => {
        if (!editingAsset) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('media_assets')
                .upsert(editingAsset);

            if (error) throw error;
            await fetchData();
            setIsEditing(false);
            setIsNew(false);
        } catch (err) {
            console.error('Error saving asset:', err);
            alert('Failed to save asset. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingAsset || !window.confirm('Are you sure you want to delete this database entry? Storage file will remain.')) return;
        
        try {
            const { error } = await supabase
                .from('media_assets')
                .delete()
                .eq('id', editingAsset.id);

            if (error) throw error;
            await fetchData();
            setIsInspectorOpen(false);
            setEditingAsset(null);
        } catch (err) {
            console.error('Error deleting asset:', err);
        }
    };

    const toggleSelectRow = (asset: MediaAsset) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(asset.id)) {
            newSelected.delete(asset.id);
        } else {
            newSelected.add(asset.id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredAssets.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredAssets.map(a => a.id)));
        }
    };

    return {
        data: {
            assets,
            filteredAssets,
            categories,
            loading,
            fetchData
        },
        ui: {
            viewMode,
            setViewMode,
            searchTerm,
            setSearchTerm,
            selectedFolder,
            setSelectedFolder,
            selectedIds,
            toggleSelectRow,
            toggleSelectAll,
            isExportOpen,
            setIsExportOpen
        },
        inspector: {
            isInspectorOpen,
            isEditing,
            isSaving,
            isNew,
            editingAsset: editingAsset || ({} as MediaAsset),
            setEditingAsset: (a: MediaAsset) => setEditingAsset(a),
            setIsEditing,
            closeInspector: () => setIsInspectorOpen(false),
            handleAssetSelect,
            handleCreateNew,
            handleSave,
            handleDelete
        }
    };
}
