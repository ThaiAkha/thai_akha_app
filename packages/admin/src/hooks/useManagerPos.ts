import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { SessionType } from '../components/common/ClassPicker';
import { useAuth } from '../context/AuthContext';
import { loadPosData } from './pos/loadPosData';
import { SUB_LABELS, type Guest, type Product, type OrderItem, type OrderRow, type ClassFeeItem } from './pos/posTypes';

export type { PosParticipant, Guest, ClassFeeItem, Product, OrderItem } from './pos/posTypes';
export { SUB_LABELS };

// --- TYPES ---
export function useManagerPos() {
    const { t } = useTranslation('pos');
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    // Default per orario: prima delle 18:00 = Morning, dopo = Evening (switch nella toolbar centrale).
    const [selectedSession, setSelectedSession] = useState<SessionType>(() => (new Date().getHours() >= 18 ? 'evening_class' : 'morning_class'));
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
            const { guests: g, products: p } = await loadPosData(selectedDate, user);
            setGuests(g);
            setProducts(p);
        } catch (err) { console.error("POS Error:", err); }
        finally { setLoading(false); }
    }, [selectedDate, user]); // MULTI-KITCHEN (scope A): user → scope kitchen

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
                sku: o.sku || '',
                name: (Array.isArray(o.shop_akha) ? o.shop_akha[0]?.item_name : o.shop_akha?.item_name) || 'Item',
                price: o.unit_price_snapshot,
                quantity: o.quantity,
                status: (o.status as 'new' | 'pending' | 'paid') || 'new'
            })) || []);
        };
        fetchOrders();
    }, [activeGuestId]);

    // --- ACTIONS ---
    const addToTab = useCallback((product: Product) => {
        if (!activeGuestId) return alert(t('alerts.selectGuestFirst'));
        if (product.stock <= 0) return alert(t('alerts.outOfStock'));

        setCurrentTab(prev => {
            const existingIdx = prev.findIndex(item => item.sku === product.sku && item.status === 'new');
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
                return updated;
            }
            return [...prev, { sku: product.sku, name: product.name, price: product.price, quantity: 1, status: 'new' }];
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t only formats alert text
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
                if (!item.id) return;
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
            }
            // "Salvato dalla teacher" → card arancione anche senza bibite aggiunte.
            await supabase.from('bookings').update({ pos_saved_at: new Date().toISOString() } as never).eq('internal_id', activeGuestId);
            await initData();
        } finally { setIsProcessing(false); }
    }, [activeGuestId, currentTab, initData]);

    // --- COMPUTED (must be before callbacks that depend on them) ---
    const filteredGuests = useMemo(() => {
        if (selectedSession === 'all') return guests;
        return guests.filter(g => g.session_id === selectedSession || g.session_id.includes(selectedSession));
    }, [guests, selectedSession]);

    const activeGuest = useMemo(() => guests.find(g => g.internal_id === activeGuestId) || null, [guests, activeGuestId]);

    // Virtual class fee line — shown when pay_on_arrival and not yet paid
    const classFee = useMemo((): ClassFeeItem | null => {
        if (!activeGuest) return null;
        if (activeGuest.payment_method !== 'pay_on_arrival') return null;
        if (activeGuest.payment_status === 'paid') return null;
        const price = activeGuest.class_price_thb || 0;
        if (price === 0) return null;
        // Class fee is charged PER GROUP (one booking line), not per person:
        // a single line whose total = class price × pax.
        const groupTotal = price * activeGuest.pax_count;
        return {
            sku: '_class_fee',
            name: `${activeGuest.session_name} — ${activeGuest.pax_count} pax`,
            price: groupTotal,
            quantity: 1,
            status: 'pending',
        };
    }, [activeGuest]);

    const totalDue = useMemo(() => {
        const shopTotal = currentTab.reduce((acc, i) => i.status !== 'paid' ? acc + (i.price * i.quantity) : acc, 0);
        const classFeeTotal = classFee ? classFee.price * classFee.quantity : 0;
        return shopTotal + classFeeTotal;
    }, [currentTab, classFee]);

    // Incasso al banco con metodo (cash|card). Il tender va sul gruppo (bookings.pos_tender):
    // determina su quale delle 2 fatture giornaliere (cash/card) finira il gruppo a fine giornata.
    const settlePayment = useCallback(async (tender: 'cash' | 'card') => {
        if (!activeGuestId || totalDue === 0) return;
        if (!window.confirm(t('alerts.confirmCharge', { amount: totalDue.toLocaleString() }))) return;
        setIsProcessing(true);
        try {
            // Pay shop items
            const unpaid = currentTab.filter(i => i.status !== 'paid');
            for (const item of unpaid) {
                const prod = products.find(p => p.sku === item.sku);
                if (prod) await supabase.from('shop_akha').update({ stock_quantity: Math.max(0, prod.stock - item.quantity) }).eq('sku', item.sku);
                if (item.id) await supabase.from('shop_orders').update({ status: 'paid' }).eq('id', item.id);
                else await supabase.from('shop_orders').update({ status: 'paid' }).match({ booking_id: activeGuestId, sku: item.sku, status: 'pending' });
            }
            // Tender sul gruppo + classe segnata pagata se era pay_on_arrival (classFee presente).
            // database.types stale (pos_tender nuovo) → cast.
            const upd: { pos_tender: 'cash' | 'card'; payment_status?: string } = { pos_tender: tender };
            if (classFee) upd.payment_status = 'paid';
            await supabase.from('bookings').update(upd as never).eq('internal_id', activeGuestId);
            initData();
        } finally { setIsProcessing(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t only formats the confirm text
    }, [activeGuestId, totalDue, currentTab, classFee, products, initData]);

    const handlePayCash = useCallback(() => settlePayment('cash'), [settlePayment]);
    const handlePayCard = useCallback(() => settlePayment('card'), [settlePayment]);

    const changeCategory = useCallback((cat: string) => {
        setActiveCategory(cat);
        setActiveSubCategory('all');
    }, []);

    const closeInspector = useCallback(() => {
        setActiveGuestId(null);
    }, []);

    // PAYMENT-SPLIT — crea un sotto-gruppo figlio (fatturazione separata). database.types stale → cast.
    const doSplit = useCallback(async (parentId: string, userIds: string[], pax: number) => {
        const { error } = await supabase.rpc('split_booking_seats' as never, { p_parent: parentId, p_user_ids: userIds, p_pax: pax } as never);
        if (error) console.error('split error:', error);
        await initData();
    }, [initData]);
    const doMergeChild = useCallback(async (childId: string) => {
        const { error } = await supabase.rpc('merge_split_child' as never, { p_child: childId } as never);
        if (error) console.error('merge error:', error);
        await initData();
    }, [initData]);

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
        classFee,
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
        handlePayCard,
        closeInspector,
        doSplit,              // PAYMENT-SPLIT (unificato: registrati + anonimi)
        doMergeChild,         // PAYMENT-SPLIT
    };
}
