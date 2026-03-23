import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Newspaper, BookOpen, Globe, Layout } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — fully autonomous, no imports from useAdminDatabase
// ─────────────────────────────────────────────────────────────────────────────

export const NEWS_TABLES = [
    { id: 'akha_news', label: 'Akha News', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'culture_sections', label: 'Culture Sections', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'ethnic_groups', label: 'Ethnic Groups', icon: <Globe className="w-5 h-5" /> },
    { id: 'page_sections', label: 'Page Sections', icon: <Layout className="w-5 h-5" /> },
];

export const NEWS_READ_ONLY_COLUMNS = ['id', 'created_at', 'updated_at', 'internal_id', 'uid'];

export const NEWS_PRIMARY_KEY_MAP: Record<string, string> = {
    page_sections: 'section_id',
};

export const NEWS_COLUMN_ORDER_CONFIG: Record<string, string[]> = {
    akha_news: [
        'title', 'category', 'image_url', 'gallery_images', 'audio_url',
        'content', 'subtitle', 'slug', 'is_active', 'display_order',
        'id', 'created_at', 'updated_at',
    ],
    culture_sections: [
        'title', 'subtitle', 'image_url', 'gallery_images', 'content',
        'content_body', 'display_order', 'is_active',
        'id', 'created_at', 'updated_at',
    ],
    ethnic_groups: [
        'name', 'thai_name', 'image_url', 'gallery_images', 'description',
        'audio_url', 'slug', 'display_order', 'is_active',
        'id', 'created_at', 'updated_at',
    ],
    page_sections: [
        'title', 'subtitle', 'image_url', 'content_body', 'page_slug',
        'section_id', 'display_order', 'is_active',
        'id', 'created_at',
    ],
};

export const NEWS_GRID_PRIMARY_FIELDS: Record<string, { title: string; subtitle?: string; badge?: string }> = {
    akha_news: { title: 'title', subtitle: 'created_at', badge: 'category' },
    culture_sections: { title: 'title', subtitle: 'subtitle', badge: 'id' },
    ethnic_groups: { title: 'name', subtitle: 'thai_name', badge: 'id' },
    page_sections: { title: 'title', subtitle: 'page_slug', badge: 'section_id' },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useAdminNews = () => {
    const [selectedTable, setSelectedTable] = useState('akha_news');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const fetchTableData = useCallback(async (tableName: string) => {
        setLoading(true);
        setSelectedRow(null);
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setSelectedIds(new Set());
        try {
            const { data: tableData, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(100);
            if (error) throw error;
            setData(tableData || []);
        } catch (err) {
            console.error(`Error fetching table ${tableName}:`, err);
            alert(`Failed to load ${tableName} kha!`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTableData(selectedTable);
    }, [selectedTable, fetchTableData]);

    const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (!selectedRow) return;
        setIsSaving(true);
        try {
            const isNew = !selectedRow.id && !selectedRow.internal_id;
            const payload = { ...selectedRow };
            NEWS_READ_ONLY_COLUMNS.forEach(col => delete payload[col]);

            let error;
            if (isNew) {
                const { error: insertError } = await supabase.from(selectedTable).insert(payload);
                error = insertError;
            } else {
                const idField = NEWS_PRIMARY_KEY_MAP[selectedTable] || (selectedRow.id ? 'id' : 'internal_id');
                const idValue = selectedRow[idField];
                if (!idValue) throw new Error(`Primary key ${idField} not found in row data.`);
                const { error: updateError } = await supabase
                    .from(selectedTable)
                    .update(payload)
                    .eq(idField, idValue);
                error = updateError;
            }
            if (error) throw error;
            alert('Saved successfully kha! 🙏');
            setIsEditing(false);
            fetchTableData(selectedTable);
        } catch (err: any) {
            console.error('Save error:', err);
            alert(`Save failed: ${err.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        try {
            const idField = NEWS_PRIMARY_KEY_MAP[selectedTable] || (selectedRow.id ? 'id' : 'internal_id');
            const idValue = selectedRow[idField];
            if (!idValue) throw new Error(`Primary key ${idField} not found.`);
            const { error } = await supabase
                .from(selectedTable)
                .delete()
                .eq(idField, idValue);
            if (error) throw error;
            alert('Deleted successfully. 🙏');
            setShowDeleteConfirm(false);
            fetchTableData(selectedTable);
        } catch (err: any) {
            console.error('Delete error:', err);
            alert(`Delete failed: ${err.message || 'Unknown error'}`);
        }
    };

    const sortColumns = useCallback((cols: string[], table: string) => {
        const config = NEWS_COLUMN_ORDER_CONFIG[table];
        if (!config) return cols;
        return [...cols].sort((a, b) => {
            const ia = config.indexOf(a);
            const ib = config.indexOf(b);
            if (ia === -1 && ib === -1) return 0;
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
    }, []);

    const columns = useMemo(() => {
        if (data.length === 0) return [];
        const base = Object.keys(data[0]).filter(col => !NEWS_READ_ONLY_COLUMNS.includes(col));
        return sortColumns(base, selectedTable);
    }, [data, selectedTable, sortColumns]);

    const allColumns = useMemo(() => {
        if (data.length === 0) return [];
        return sortColumns(Object.keys(data[0]), selectedTable);
    }, [data, selectedTable, sortColumns]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const getRowId = (r: any) => String(r.id ?? r.internal_id ?? JSON.stringify(r));

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredData.length && filteredData.length > 0) {
            setSelectedIds(new Set());
        } else {
            const s = new Set<string>();
            filteredData.forEach(row => s.add(getRowId(row)));
            setSelectedIds(s);
        }
    };

    const toggleSelectRow = (row: any) => {
        const id = getRowId(row);
        const s = new Set(selectedIds);
        if (s.has(id)) s.delete(id); else s.add(id);
        setSelectedIds(s);
    };

    const getExportData = () =>
        selectedIds.size === 0 ? filteredData : data.filter(row => selectedIds.has(getRowId(row)));

    const exportToJSON = () => {
        const blob = new Blob([JSON.stringify(getExportData(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTable}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setIsExportOpen(false);
    };

    const exportToCSV = () => {
        const rows = getExportData();
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map(row => headers.map(h => {
                const cell = row[h] === null ? '' : row[h];
                const s = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
                return `"${s.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setIsExportOpen(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(getExportData(), null, 2));
        alert(`${getExportData().length} items copied kha!`);
        setIsExportOpen(false);
    };

    return {
        data: { data, loading, selectedTable, fetchTableData, filteredData, columns, allColumns },
        ui: {
            setSelectedTable, searchTerm, setSearchTerm,
            isExportOpen, setIsExportOpen,
            selectedIds, viewMode, setViewMode,
            toggleSelectAll, toggleSelectRow,
            exportToJSON, exportToCSV, copyToClipboard,
        },
        inspector: {
            selectedRow, setSelectedRow, isSaving, isEditing, setIsEditing,
            showDeleteConfirm, setShowDeleteConfirm,
            handleSave, handleDelete,
            closeInspector: () => setSelectedRow(null),
        },
    };
};
