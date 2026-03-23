import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import {
    AlertTriangle, Users, Calendar, Package, Settings, CreditCard, Image, MapPin, Music
} from 'lucide-react';

// --- CONFIG ---
// Note: akha_news, culture_sections, ethnic_groups, page_sections → moved to AdminNews
export const SYSTEM_TABLES = [
    { id: 'allergy_knowledge', label: 'Allergy Knowledge', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'audio_assets', label: 'Audio Assets', icon: <Music className="w-5 h-5" /> },
    { id: 'booking_participants', label: 'Booking Participants', icon: <Users className="w-5 h-5" /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
    { id: 'class_calendar_overrides', label: 'Calendar Overrides', icon: <Calendar className="w-5 h-5" /> },
    { id: 'class_sessions', label: 'Class Sessions', icon: <Calendar className="w-5 h-5" /> },
    { id: 'cooking_classes', label: 'Cooking Classes', icon: <Package className="w-5 h-5" /> },
    { id: 'dietary_profiles', label: 'Dietary Profiles', icon: <Users className="w-5 h-5" /> },
    { id: 'dietary_substitutions', label: 'Dietary Substitutions', icon: <Package className="w-5 h-5" /> },
    { id: 'driver_payments', label: 'Driver Payments', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'driver_payout_tiers', label: 'Driver Payout Tiers', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'gallery_items', label: 'Gallery Items', icon: <Package className="w-5 h-5" /> },
    { id: 'home_cards', label: 'Home Cards', icon: <Package className="w-5 h-5" /> },
    { id: 'home_cards_front', label: 'Home Cards (Front)', icon: <Package className="w-5 h-5" /> },
    { id: 'home_cards_translations', label: 'Home Cards Translations', icon: <Package className="w-5 h-5" /> },
    { id: 'hotel_locations', label: 'Hotel Locations', icon: <Package className="w-5 h-5" /> },
    { id: 'hotel_pickup_rules', label: 'Hotel Pickup Rules', icon: <MapPin className="w-5 h-5" /> },
    { id: 'ingredient_categories', label: 'Ingredient Categories', icon: <Package className="w-5 h-5" /> },
    { id: 'ingredients_library', label: 'Ingredients Library', icon: <Package className="w-5 h-5" /> },
    { id: 'market_runs', label: 'Market Runs', icon: <Package className="w-5 h-5" /> },
    { id: 'media_assets', label: 'Media Assets', icon: <Image className="w-5 h-5" /> },
    { id: 'meeting_points', label: 'Meeting Points', icon: <Package className="w-5 h-5" /> },
    { id: 'menu_selections', label: 'Menu Selections', icon: <Package className="w-5 h-5" /> },
    { id: 'pickup_zones', label: 'Pickup Zones', icon: <Package className="w-5 h-5" /> },
    { id: 'profiles', label: 'Profiles', icon: <Users className="w-5 h-5" /> },
    { id: 'quiz_levels', label: 'Quiz Levels', icon: <Package className="w-5 h-5" /> },
    { id: 'quiz_modules', label: 'Quiz Modules', icon: <Package className="w-5 h-5" /> },
    { id: 'quiz_questions', label: 'Quiz Questions', icon: <Package className="w-5 h-5" /> },
    { id: 'quiz_rewards', label: 'Quiz Rewards', icon: <Package className="w-5 h-5" /> },
    { id: 'recipe_categories', label: 'Recipe Categories', icon: <Package className="w-5 h-5" /> },
    { id: 'recipe_composition', label: 'Recipe Composition', icon: <Package className="w-5 h-5" /> },
    { id: 'recipe_key_ingredients', label: 'Recipe Key Ingredients', icon: <Package className="w-5 h-5" /> },
    { id: 'recipe_selection_categories', label: 'Recipe Selection Categories', icon: <Package className="w-5 h-5" /> },
    { id: 'recipe_selections', label: 'Recipe Selections', icon: <Package className="w-5 h-5" /> },
    { id: 'recipes', label: 'Recipes', icon: <Package className="w-5 h-5" /> },
    { id: 'shop_akha', label: 'Shop Akha', icon: <Package className="w-5 h-5" /> },
    { id: 'shop_categories', label: 'Shop Categories', icon: <Package className="w-5 h-5" /> },
    { id: 'shop_contacts', label: 'Shop Contacts', icon: <Users className="w-5 h-5" /> },
    { id: 'shop_orders', label: 'Shop Orders', icon: <Package className="w-5 h-5" /> },
    { id: 'shop_storefront', label: 'Shop Storefront', icon: <Package className="w-5 h-5" /> },
    { id: 'site_metadata', label: 'Site Metadata (Public)', icon: <Settings className="w-5 h-5" /> },
    { id: 'site_metadata_admin', label: 'Site Metadata (Admin)', icon: <Settings className="w-5 h-5" /> },
    { id: 'site_metadata_admin_translations', label: 'Admin Translations', icon: <Settings className="w-5 h-5" /> },
    { id: 'spiciness_levels', label: 'Spiciness Levels', icon: <Package className="w-5 h-5" /> }
];

export const READ_ONLY_COLUMNS = ['id', 'created_at', 'updated_at', 'internal_id', 'uid'];

export const PRIMARY_KEY_MAP: Record<string, string> = {
    allergy_knowledge: 'allergy_key',
    bookings: 'internal_id',
    page_sections: 'section_id',
    shop_contacts: 'shop_name',
};

export const COLUMN_ORDER_CONFIG: Record<string, string[]> = {
    bookings: [
        'user_id', 'booking_date', 'session_type', 'status', 'created_at', 'internal_id',
        'booking_source', 'hotel_name', 'reservation_id_agency', 'email_reference',
        'session_id', 'pickup_zone', 'pickup_time', 'pax_count', 'total_price',
        'special_requests', 'phone_number', 'phone_prefix', 'agency_note',
        'customer_note', 'route_order', 'payment_method', 'payment_status',
        'applied_commission_rate', 'pickup_lat', 'pickup_lng', 'pickup_driver_uid',
        'pickup_sequence', 'dropoff_driver_uid', 'dropoff_sequence', 'dropoff_hotel',
        'dropoff_zone', 'requires_dropoff', 'dropoff_lat', 'dropoff_lng',
        'transport_status', 'actual_pickup_time', 'actual_dropoff_time', 'booking_ref'
    ],
    profiles: [
        'id', 'full_name', 'email', 'dietary_profile', 'allergies', 'updated_at',
        'role', 'preferred_spiciness_id', 'avatar_url', 'agency_commission_rate',
        'agency_company_name', 'agency_tax_id', 'agency_phone', 'agency_address',
        'agency_city', 'agency_province', 'agency_country', 'agency_postal_code'
    ],
    class_sessions: [
        'id', 'display_name', 'price_thb', 'duration_hours', 'has_market_tour',
        'start_time', 'end_time', 'schedule_config', 'meeting_points', 'active',
        'created_at', 'max_capacity'
    ],
    pickup_zones: [
        'id', 'name', 'color_code', 'morning_pickup_time', 'evening_pickup_time',
        'description', 'created_at', 'display_order', 'morning_pickup_end', 'evening_pickup_end'
    ],
    recipes: [
        'id', 'name', 'thai_name', 'description', 'is_vegan', 'is_vegetarian',
        'category', 'has_peanuts', 'has_shellfish', 'has_gluten', 'has_soy',
        'image', 'spiciness', 'color_theme', 'health_benefits', 'is_signature',
        'is_fixed_dish', 'created_at', 'updated_at', 'dietary_variants', 'gallery_images'
    ],
    site_metadata: [
        'id', 'page_slug', 'header_title_main', 'header_title_highlight', 'header_badge',
        'header_icon', 'page_description', 'hero_image_url', 'created_at',
        'show_in_menu', 'menu_order', 'menu_label', 'access_level'
    ],
    site_metadata_admin_translations: [
        'id', 'page_id', 'language', 'title', 'subtitle', 'description', 'menu_label', 'created_at'
    ],
    shop_akha: [
        'id', 'sku', 'item_name', 'description_internal', 'price_thb', 'cost_thb',
        'account_category', 'purchase_account', 'product_type', 'stock_quantity',
        'reorder_point', 'is_active', 'category_id', 'is_visible_online', 'tax_code',
        'created_at', 'updated_at', 'catalog_image_url', 'sub_category'
    ],
    audio_assets: [
        'id', 'asset_id', 'title', 'audio_url', 'transcript', 'duration_seconds',
        'file_name', 'folder_path', 'mime_type', 'size_kb', 'uploaded_by', 'created_at'
    ],
    page_sections: [
        'id', 'page_slug', 'section_id', 'title', 'subtitle', 'content_body',
        'image_url', 'display_order', 'is_active', 'created_at'
    ]
};

export const GRID_PRIMARY_FIELDS: Record<string, { title: string; subtitle?: string; badge?: string }> = {
    profiles: { title: 'full_name', subtitle: 'email', badge: 'role' },
    bookings: { title: 'hotel_name', subtitle: 'booking_date', badge: 'status' },
    recipes: { title: 'name', subtitle: 'thai_name', badge: 'category' },
    class_sessions: { title: 'display_name', subtitle: 'start_time', badge: 'active' },
    pickup_zones: { title: 'name', subtitle: 'description', badge: 'color_code' },
    shop_akha: { title: 'item_name', subtitle: 'sku', badge: 'product_type' },
    site_metadata: { title: 'page_slug', subtitle: 'header_title_main', badge: 'access_level' },
    site_metadata_admin: { title: 'page_slug', subtitle: 'header_title_main', badge: 'access_level' },
    site_metadata_admin_translations: { title: 'page_id', subtitle: 'language', badge: 'title' },
    akha_news: { title: 'title', subtitle: 'created_at', badge: 'category' },
    audio_assets: { title: 'title', subtitle: 'asset_id', badge: 'mime_type' },
    page_sections: { title: 'title', subtitle: 'page_slug', badge: 'section_id' },
};

export const useAdminDatabase = () => {
    // ✅ AppHeader handles metadata loading automatically
    const [selectedTable, setSelectedTable] = useState('profiles');
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
            READ_ONLY_COLUMNS.forEach(col => delete payload[col]);

            let error;
            if (isNew) {
                const { error: insertError } = await supabase.from(selectedTable).insert(payload);
                error = insertError;
            } else {
                const idField = PRIMARY_KEY_MAP[selectedTable] || (selectedRow.id ? 'id' : 'internal_id');
                const idValue = selectedRow[idField];

                if (!idValue) {
                    throw new Error(`Primary key ${idField} not found in row data.`);
                }

                const { error: updateError } = await supabase
                    .from(selectedTable)
                    .update(payload)
                    .eq(idField, idValue);
                error = updateError;
            }

            if (error) throw error;
            alert('Data saved successfully kha! 🙏');
            setIsEditing(false);
            fetchTableData(selectedTable);
        } catch (err: any) {
            console.error('Save error:', err);
            alert(`Save failed: ${err.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        try {
            const idField = PRIMARY_KEY_MAP[selectedTable] || (selectedRow.id ? 'id' : 'internal_id');
            const idValue = selectedRow[idField];

            if (!idValue) {
                throw new Error(`Primary key ${idField} not found in row data.`);
            }

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
        const config = COLUMN_ORDER_CONFIG[table];
        if (!config) return cols;
        return [...cols].sort((a, b) => {
            const indexA = config.indexOf(a);
            const indexB = config.indexOf(b);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, []);

    const columns = useMemo(() => {
        if (data.length === 0) return [];
        const baseCols = Object.keys(data[0]).filter(col => !READ_ONLY_COLUMNS.includes(col));
        return sortColumns(baseCols, selectedTable);
    }, [data, selectedTable, sortColumns]);

    const allColumns = useMemo(() => {
        if (data.length === 0) return [];
        const baseCols = Object.keys(data[0]);
        return sortColumns(baseCols, selectedTable);
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
            const newSet = new Set<string>();
            filteredData.forEach(row => newSet.add(getRowId(row)));
            setSelectedIds(newSet);
        }
    };

    const toggleSelectRow = (row: any) => {
        const id = getRowId(row);
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const getExportData = () => {
        if (selectedIds.size === 0) return filteredData;
        return data.filter(row => selectedIds.has(getRowId(row)));
    };

    const exportToJSON = () => {
        const exportData = getExportData();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportOpen(false);
    };

    const exportToCSV = () => {
        const exportData = getExportData();
        if (exportData.length === 0) return;
        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => headers.map(header => {
                const cell = row[header] === null ? '' : row[header];
                const cellStr = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
                return `"${cellStr.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.csv`;
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
            data,
            loading,
            selectedTable,
            fetchTableData,
            filteredData,
            columns,
            allColumns,
        },
        ui: {
            setSelectedTable,
            searchTerm,
            setSearchTerm,
            isExportOpen,
            setIsExportOpen,
            selectedIds,
            viewMode,
            setViewMode,
            toggleSelectAll,
            toggleSelectRow,
            exportToJSON,
            exportToCSV,
            copyToClipboard,
        },
        inspector: {
            selectedRow,
            setSelectedRow,
            isSaving,
            isEditing,
            setIsEditing,
            showDeleteConfirm,
            setShowDeleteConfirm,
            handleSave,
            handleDelete,
            closeInspector: () => setSelectedRow(null)
        }
    };
};
