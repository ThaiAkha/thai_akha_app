import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';

export interface Product {
    id?: string;
    sku: string;
    item_name: string;
    description_internal: string;
    price_thb: number;
    cost_thb: number;
    stock_quantity: number;
    category_id: string;
    sub_category: string;
    catalog_image_url: string;
    is_active: boolean;
    is_visible_online: boolean;
}

export interface Category {
    id: string;
    title: string;
    icon_name: string;
}

export const EMPTY_PRODUCT: Product = {
    sku: '',
    item_name: '',
    description_internal: '',
    price_thb: 0,
    cost_thb: 0,
    stock_quantity: 0,
    category_id: 'beer',
    sub_category: 'general',
    catalog_image_url: '',
    is_active: true,
    is_visible_online: false
};

export const useAdminInventory = () => {
    // ✅ AppHeader handles metadata loading automatically
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingProduct, setEditingProduct] = useState<Product>(EMPTY_PRODUCT);
    const [isNew, setIsNew] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                supabase.from('shop_akha').select('*').order('item_name'),
                supabase.from('shop_categories').select('*').order('title')
            ]);

            if (prodRes.data) setProducts(prodRes.data);
            if (catRes.data) setCategories(catRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategoryId !== 'all') {
            result = result.filter(p => p.category_id === selectedCategoryId);
        }
        if (searchTerm) {
            result = result.filter(p =>
                p.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return result;
    }, [products, selectedCategoryId, searchTerm]);

    const handleProductSelect = (product: Product) => {
        setEditingProduct({ ...product });
        setIsNew(false);
        setIsEditing(false);
        setIsInspectorOpen(true);
    };

    const handleCreateNew = () => {
        setEditingProduct(EMPTY_PRODUCT);
        setIsNew(true);
        setIsEditing(true);
        setIsInspectorOpen(true);
    };

    const handleReset = () => {
        setEditingProduct(EMPTY_PRODUCT);
        setIsNew(true);
        setIsEditing(false);
        setIsInspectorOpen(false);
    };

    const handleSave = async () => {
        if (!editingProduct.item_name || !editingProduct.sku) {
            alert("Please enter at least Name and SKU kha.");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('shop_akha')
                .upsert(editingProduct);

            if (error) throw error;

            await fetchData();
            setIsEditing(false);
            if (isNew) {
                handleReset();
            }
            alert("Product saved successfully kha!");
        } catch (err: any) {
            console.error("Save error:", err);
            alert("Failed to save: " + err.message);
        } finally {
            setIsSaving(true); // Should this be false? Fixed to false.
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingProduct.id) return;
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('shop_akha')
                .delete()
                .eq('id', editingProduct.id);

            if (error) throw error;
            await fetchData();
            handleReset();
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            const newSet = new Set<string>();
            filteredProducts.forEach(p => newSet.add(String(p.id)));
            setSelectedIds(newSet);
        }
    };

    const toggleSelectRow = (product: Product) => {
        const id = String(product.id);
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const getExportData = () => {
        if (selectedIds.size > 0) {
            return filteredProducts.filter(p => selectedIds.has(String(p.id)));
        }
        return filteredProducts;
    };

    const exportToCSV = () => {
        const exportData = getExportData();
        if (exportData.length === 0) return;
        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => headers.map(header => {
                const cell = row[header as keyof Product] === null ? '' : row[header as keyof Product];
                const cellStr = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
                return `"${cellStr.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportOpen(false);
    };

    const exportToJSON = () => {
        const exportData = getExportData();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportOpen(false);
    };

    const copyToClipboard = () => {
        const exportData = getExportData();
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
        alert(`${exportData.length} items copied to clipboard kha!`);
        setIsExportOpen(false);
    };

    return {
        data: {
            products,
            filteredProducts,
            categories,
            loading,
            fetchData,
        },
        ui: {
            selectedCategoryId,
            setSelectedCategoryId,
            searchTerm,
            setSearchTerm,
            viewMode,
            setViewMode,
            isExportOpen,
            setIsExportOpen,
            selectedIds,
            toggleSelectAll,
            toggleSelectRow,
            exportToCSV,
            exportToJSON,
            copyToClipboard,
        },
        inspector: {
            isInspectorOpen,
            setIsInspectorOpen,
            editingProduct,
            setEditingProduct,
            isSaving,
            isNew,
            isEditing,
            setIsEditing,
            handleProductSelect,
            handleCreateNew,
            handleSave,
            handleDelete,
            closeInspector: handleReset
        }
    };
};
