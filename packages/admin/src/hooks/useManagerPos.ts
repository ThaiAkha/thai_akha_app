import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { SessionType } from '../components/common/ClassPicker';

// --- TYPES ---
export interface Guest {
    internal_id: string;
    full_name: string;
    avatar_url?: string;
    pax_count: number;
    session_name: string;
    session_id: string;
    status: string;
}

export interface Product {
    sku: string;
    name: string;
    price: number;
    category: string;
    sub_category?: string;
    stock: number;
    description?: string;
    image?: string;
}

export interface OrderItem {
    id?: string;
    sku: string;
    name: string;
    price: number;
    quantity: number;
    status: 'new' | 'pending' | 'paid';
}

// Raw Supabase row shapes — internal to this hook, not exported
interface BookingRow {
    internal_id: string;
    guest_name: string;
    pax_count: number;
    status: string;
    session_id: string;
    profiles: { full_name: string; avatar_url?: string }[] | null;
    class_sessions: { display_name: string }[] | null;
}

interface ShopItemRow {
    sku: string;
    item_name: string;
    price_thb: number;
    stock_quantity: number;
    category_id: string;
    sub_category?: string;
    description_internal?: string;
    catalog_image_url?: string;
}

interface OrderRow {
    id: string;
    sku: string;
    quantity: number;
    unit_price_snapshot: number;
    status: 'new' | 'pending' | 'paid';
    shop_akha: { item_name: string }[] | null;
}

export const SUB_LABELS: Record<string, string> = {
    bottle_big: 'Big Bottles',
    bottle_small: 'Small Bottles',
    can: 'Cans',
    import: 'Import / Craft',
    apparel: 'Apparel',
    gear: 'Equipment',
    red: 'Red Wine',
    white: 'White Wine',
    cooler: 'Coolers',
    general: 'General',
    all: 'All'
};

export function useManagerPos() {
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<SessionType>('all');
    const [activeCategory, setActiveCategory] = useState<string>('beer');
    const [activeSubCategory, setActiveSubCategory] = useState<string>('all');

    // Selection & Orders
    const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState<OrderItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [preservedGuestId, setPreservedGuestId] = useState<string | null>(null);
    const [preservedTab, setPreservedTab] = useState<OrderItem[]>([]);

    // ✅ AppHeader handles metadata loading automatically

    // --- DATA LOADING ---
    const initData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: bookings } = await supabase
                .from('bookings')
                .select(`
                    internal_id, guest_name, pax_count, status, session_id,
                    profiles:user_id (full_name, avatar_url),
                    class_sessions (display_name)
                `)
                .eq('booking_date', selectedDate)
                .neq('status', 'cancelled')
                .order('pickup_time', { ascending: true });

            const { data: shopItems } = await supabase
                .from('shop_akha')
                .select('*')
                .eq('is_active', true);

            setGuests(bookings?.map((b: BookingRow) => ({
                internal_id: b.internal_id,
                full_name: b.guest_name || b.profiles?.[0]?.full_name || 'Walk-in Guest',
                avatar_url: b.profiles?.[0]?.avatar_url,
                pax_count: b.pax_count,
                session_name: b.class_sessions?.[0]?.display_name || 'Class',
                session_id: b.session_id,
                status: b.status
            })) || []);

            setProducts(shopItems?.map((p: ShopItemRow) => ({
                sku: p.sku,
                name: p.item_name,
                price: p.price_thb,
                stock: p.stock_quantity,
                category: p.category_id,
                sub_category: p.sub_category || 'general',
                description: p.description_internal,
                image: p.catalog_image_url
            })) || []);
        } catch (err) { console.error("POS Error:", err); }
        finally { setLoading(false); }
    }, [selectedDate]);

    useEffect(() => { initData(); }, [initData]);

    // 🔒 Preserve guest ID and tab data when they're set
    useEffect(() => {
        if (activeGuestId && currentTab.length > 0) {
            setPreservedGuestId(activeGuestId);
            setPreservedTab(currentTab);
        }
    }, [activeGuestId, currentTab]);

    // 🔄 Restore guest ID and tab if unexpectedly cleared
    useEffect(() => {
        if (!activeGuestId && preservedGuestId && preservedTab.length > 0) {
            // Guest was accidentally cleared but we have saved data
            setActiveGuestId(preservedGuestId);
            setCurrentTab(preservedTab);
        }
    }, [activeGuestId, preservedGuestId, preservedTab]);

    useEffect(() => {
        if (!activeGuestId) { setCurrentTab([]); return; }
        const fetchOrders = async () => {
            const { data } = await supabase
                .from('shop_orders')
                .select(`id, sku, quantity, unit_price_snapshot, status, shop_akha(item_name)`)
                .eq('booking_id', activeGuestId);

            setCurrentTab(data?.map((o: OrderRow) => ({
                id: o.id,
                sku: o.sku,
                name: o.shop_akha?.[0]?.item_name || 'Item',
                price: o.unit_price_snapshot,
                quantity: o.quantity,
                status: o.status
            })) || []);
        };
        fetchOrders();
    }, [activeGuestId]);

    // --- ACTIONS ---
    const addToTab = useCallback((product: Product) => {
        if (!activeGuestId) return alert("Select a guest first kha!");
        if (product.stock <= 0) return alert("Out of stock!");

        setCurrentTab(prev => {
            const existingIdx = prev.findIndex(item => item.sku === product.sku && item.status === 'new');
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
                return updated;
            }
            return [...prev, { sku: product.sku, name: product.name, price: product.price, quantity: 1, status: 'new' }];
        });
    }, [activeGuestId]);

    const handleRemoveItem = useCallback(async (item: OrderItem) => {
        if (item.status === 'paid') return;
        if (item.status === 'new') {
            setCurrentTab(prev => {
                if (item.quantity > 1) return prev.map(i => i.sku === item.sku && i.status === 'new' ? { ...i, quantity: i.quantity - 1 } : i);
                return prev.filter(i => !(i.sku === item.sku && i.status === 'new'));
            });
            return;
        }
        if (item.status === 'pending') {
            try {
                if (item.quantity > 1) {
                    await supabase.from('shop_orders').update({ quantity: item.quantity - 1 }).eq('id', item.id);
                    setCurrentTab(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                } else {
                    await supabase.from('shop_orders').delete().eq('id', item.id);
                    setCurrentTab(prev => prev.filter(i => i.id !== item.id));
                }
            } catch (e) { console.error(e); }
        }
    }, []);

    const handleSaveConfirmed = useCallback(async () => {
        if (!activeGuestId) return;
        setIsProcessing(true);
        try {
            const newItems = currentTab.filter(i => i.status === 'new');
            if (newItems.length > 0) {
                const payload = newItems.map(i => ({ booking_id: activeGuestId, sku: i.sku, quantity: i.quantity, unit_price_snapshot: i.price, status: 'pending' }));
                await supabase.from('shop_orders').insert(payload);
                initData();
            }
        } finally { setIsProcessing(false); }
    }, [activeGuestId, currentTab, initData]);

    const handlePayCash = useCallback(async () => {
        const totalDue = currentTab.reduce((acc, i) => i.status !== 'paid' ? acc + (i.price * i.quantity) : acc, 0);
        if (!activeGuestId || totalDue === 0) return;
        if (!window.confirm(`Charge ${totalDue} THB to cash?`)) return;
        setIsProcessing(true);
        try {
            const unpaid = currentTab.filter(i => i.status !== 'paid');
            for (const item of unpaid) {
                const prod = products.find(p => p.sku === item.sku);
                if (prod) await supabase.from('shop_akha').update({ stock_quantity: Math.max(0, prod.stock - item.quantity) }).eq('sku', item.sku);
                if (item.id) await supabase.from('shop_orders').update({ status: 'paid' }).eq('id', item.id);
                else await supabase.from('shop_orders').update({ status: 'paid' }).match({ booking_id: activeGuestId, sku: item.sku, status: 'pending' });
            }
            initData();
        } finally { setIsProcessing(false); }
    }, [activeGuestId, currentTab, products, initData]);

    const changeCategory = useCallback((cat: string) => {
        setActiveCategory(cat);
        setActiveSubCategory('all');
    }, []);

    const closeInspector = useCallback(() => {
        setActiveGuestId(null);
    }, []);

    // --- COMPUTED ---
    const filteredGuests = useMemo(() => {
        if (selectedSession === 'all') return guests;
        return guests.filter(g => g.session_id === selectedSession || g.session_id.includes(selectedSession));
    }, [guests, selectedSession]);

    const activeGuest = useMemo(() => guests.find(g => g.internal_id === activeGuestId) || null, [guests, activeGuestId]);
    const totalDue = useMemo(() => currentTab.reduce((acc, i) => i.status !== 'paid' ? acc + (i.price * i.quantity) : acc, 0), [currentTab]);

    const mainCategories = useMemo(() => {
        const uniqueCats = Array.from(new Set(products.map(p => p.category)));
        return uniqueCats.map(cat => ({ value: cat, label: cat.replace(/_/g, ' ') }));
    }, [products]);

    const subCategoryTabs = useMemo(() => {
        const tabs = [{ value: 'all', label: 'All' }];
        const subs = Array.from(new Set(products.filter(p => p.category === activeCategory).map(p => p.sub_category || 'general')));
        subs.filter(s => s !== 'general').forEach(sub => tabs.push({ value: sub, label: SUB_LABELS[sub] || sub }));
        return tabs;
    }, [products, activeCategory]);

    const displayedProducts = useMemo(() => {
        return products.filter(p => p.category === activeCategory && (activeSubCategory === 'all' || p.sub_category === activeSubCategory));
    }, [products, activeCategory, activeSubCategory]);

    return {
        // Data
        guests,
        products,
        filteredGuests,
        displayedProducts,
        mainCategories,
        subCategoryTabs,
        activeGuest,
        currentTab,
        totalDue,

        // State
        loading,
        isProcessing,
        selectedDate,
        selectedSession,
        activeCategory,
        activeSubCategory,
        activeGuestId,

        // Setters
        setSelectedDate,
        setSelectedSession,
        setActiveGuestId,
        setActiveCategory: changeCategory,
        setActiveSubCategory,

        // Actions
        initData,
        addToTab,
        handleRemoveItem,
        handleSaveConfirmed,
        handlePayCash,
        closeInspector,
    };
}
