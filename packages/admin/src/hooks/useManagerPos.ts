import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { SessionType } from '../components/common/ClassPicker';
import { useAuth } from '../context/AuthContext';
import { kitchenScope } from '../lib/kitchenScope';

// --- TYPES ---
export interface PosParticipant {
    user_id: string | null;
    full_name: string;
    avatar_url?: string;
    is_leader: boolean;
}

export interface Guest {
    internal_id: string;
    created_at?: string;
    full_name: string;
    avatar_url?: string;
    pax_count: number;
    booking_date: string;
    session_name: string;
    session_id: string;
    status: string;
    payment_method?: string;
    payment_status?: string;
    class_price_thb?: number;
    pos_tender?: string;
    pos_saved_at?: string | null;
    // Stato card: none=grigio · saved=arancione (teacher ha salvato) · cash=verde · card=blu (manager ha incassato).
    billingState?: 'none' | 'saved' | 'cash' | 'card';
    // MULTI-KITCHEN + SPLIT
    kitchen_id?: string | null;
    kitchen_name?: string | null;
    parent_booking_id?: string | null;
    is_split_child?: boolean;
    participants: PosParticipant[];
}

export interface ClassFeeItem {
    sku: '_class_fee';
    name: string;
    price: number;
    quantity: number;
    status: 'pending';
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

interface OrderRow {
    id: string;
    sku: string | null;
    quantity: number;
    unit_price_snapshot: number;
    status: 'new' | 'pending' | 'paid' | string | null;
    shop_akha: { item_name: string }[] | null | any;
}

// Categorie servizio (classi/tour) gestite AUTOMATICAMENTE dalle prenotazioni —
// non sono prodotti da vendere a banco, vanno nascoste dal catalogo POS (manager + teacher).
const HIDDEN_POS_CATEGORIES = ['service_class', 'service_tour'];

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
            // MULTI-KITCHEN (scope A) — la teacher loggata vede solo i clienti della sua kitchen.
            const scope = kitchenScope(user);
            // Solo OGGI: manager e kitchen fatturano sempre la classe del giorno corrente
            // (no finestra multi-giorno → impossibile fatturare per sbaglio un giorno passato).
            let bookingsQuery = supabase
                .from('bookings')
                .select(`
                    internal_id, created_at, user_id, guest_name, booking_date, pax_count, status, session_id,
                    payment_method, payment_status, pos_tender, pos_saved_at, kitchen_id, parent_booking_id, is_split_child,
                    profiles:user_id (full_name, avatar_url, role),
                    booking_participants ( user_id, is_leader, profiles:user_id (full_name, avatar_url) ),
                    class_sessions (display_name, price_thb)
                `)
                .eq('booking_date', selectedDate)
                .neq('status', 'cancelled');
            if (scope) bookingsQuery = bookingsQuery.eq('kitchen_id', scope);
            const { data: bookings } = await bookingsQuery
                .order('booking_date', { ascending: true })
                .order('pickup_time', { ascending: true });

            const { data: shopItems } = await supabase
                .from('shop_akha')
                .select('*')
                .eq('is_active', true);

            // Kitchen (teacher) names per il raggruppamento colonna POS
            const kitchenIds = Array.from(new Set(((bookings as any[]) ?? []).map(b => b.kitchen_id).filter(Boolean)));
            const kitchenNames = new Map<string, string>();
            if (kitchenIds.length) {
                const { data: ks } = await supabase.from('profiles').select('id, full_name').in('id', kitchenIds as string[]);
                ((ks as any[]) ?? []).forEach(k => kitchenNames.set(k.id, k.full_name));
            }
            // Stato ordini per booking → colore card (pending=arancione salvato · paid=verde)
            const bookingIds = Array.from(new Set(((bookings as any[]) ?? []).map(b => b.internal_id)));
            const ordAgg = new Map<string, { hasPending: boolean; hasPaid: boolean }>();
            if (bookingIds.length) {
                const { data: ords } = await supabase.from('shop_orders').select('booking_id, status').in('booking_id', bookingIds as string[]);
                ((ords as { booking_id: string; status: string | null }[]) ?? []).forEach(o => {
                    const a = ordAgg.get(o.booking_id) ?? { hasPending: false, hasPaid: false };
                    if (o.status === 'paid') a.hasPaid = true; else a.hasPending = true;
                    ordAgg.set(o.booking_id, a);
                });
            }
            const NON_GUEST = new Set(['agency', 'admin', 'manager', 'kitchen', 'driver', 'logistics']);

            setGuests(((bookings as any[]) ?? []).map((b: any) => {
                const ownerProf = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
                const parts: PosParticipant[] = ((b.booking_participants ?? []) as any[]).map((bp: any) => {
                    const pr = Array.isArray(bp.profiles) ? bp.profiles[0] : bp.profiles;
                    return { user_id: bp.user_id ?? null, full_name: pr?.full_name ?? 'Guest', avatar_url: pr?.avatar_url, is_leader: !!bp.is_leader };
                });
                // Owner-guest come partecipante (per l'utente normale i dati stanno sull'owner)
                if (b.user_id && ownerProf && !NON_GUEST.has(ownerProf.role) && !parts.some(p => p.user_id === b.user_id)) {
                    parts.unshift({ user_id: b.user_id, full_name: ownerProf.full_name || b.guest_name || 'Guest', avatar_url: ownerProf.avatar_url, is_leader: true });
                }
                // Stato card = stato ORDINI bibite (la quota classe è gestita a parte): nessun ordine =
                // grigio · ordini pending = arancione (salvato teacher) · tutti paid = verde (incassato manager).
                const agg = ordAgg.get(b.internal_id);
                const saved = !!b.pos_saved_at || (!!agg && agg.hasPending);
                const billingState: Guest['billingState'] =
                    b.pos_tender === 'card' ? 'card'
                        : b.pos_tender === 'cash' ? 'cash'
                            : saved ? 'saved' : 'none';
                return {
                    internal_id: b.internal_id,
                    created_at: b.created_at,
                    full_name: b.guest_name || ownerProf?.full_name || 'Walk-in Guest',
                    avatar_url: ownerProf?.avatar_url,
                    pax_count: b.pax_count || 1,
                    booking_date: b.booking_date,
                    session_name: (Array.isArray(b.class_sessions) ? b.class_sessions[0] : b.class_sessions)?.display_name || 'Class',
                    session_id: b.session_id || 'all',
                    status: b.status || 'unknown',
                    payment_method: b.payment_method || undefined,
                    payment_status: b.payment_status || undefined,
                    pos_tender: b.pos_tender || undefined,
                    pos_saved_at: b.pos_saved_at ?? null,
                    class_price_thb: (Array.isArray(b.class_sessions) ? b.class_sessions[0] : b.class_sessions)?.price_thb,
                    kitchen_id: b.kitchen_id ?? null,
                    kitchen_name: b.kitchen_id ? (kitchenNames.get(b.kitchen_id) ?? null) : null,
                    parent_booking_id: b.parent_booking_id ?? null,
                    is_split_child: !!b.is_split_child,
                    participants: parts,
                    billingState,
                } as Guest;
            }));

            setProducts(((shopItems as any[]) || [])
                .filter((p: any) => !HIDDEN_POS_CATEGORIES.includes(p.category_id))
                .map((p: any) => ({
                sku: p.sku,
                name: p.item_name,
                price: p.price_thb,
                stock: p.stock_quantity || 0,
                category: p.category_id || '',
                sub_category: p.sub_category || 'general',
                description: p.description_internal,
                image: p.catalog_image_url
            })) || []);
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
                name: o.shop_akha?.item_name || (Array.isArray(o.shop_akha) ? o.shop_akha[0]?.item_name : '') || 'Item',
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
