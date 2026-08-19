/**
 * Market Runner - stato e azioni: liste logistiche aperte, lista in corso, contatti negozi,
 * spunta acquisti, keypad prezzo, LINE/chiamata, salva/conferma.
 * Estratto da MarketRunner.tsx (#16 split monstre) a comportamento invariato.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { LayoutGrid } from 'lucide-react';
import { getShopIcon, type ShoppingItem, type MarketRun, type ShopContact } from './types';

export function useMarketRunner() {
    const { t } = useTranslation('market');
    const [loading, setLoading] = useState(true);
    const [runs, setRuns] = useState<MarketRun[]>([]);          // saved, not-yet-confirmed logistic lists
    const [activeRun, setActiveRun] = useState<MarketRun | null>(null); // the list being shopped
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [contacts, setContacts] = useState<Record<string, ShopContact>>({});
    const [activeTab, setActiveTab] = useState('all');
    const [keypadOpen, setKeypadOpen] = useState(false);
    const [keypadItemId, setKeypadItemId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState('0');
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Once confirmed/expensed, the run is locked for the logistic (manager-only edits from here).
    const locked = activeRun?.status === 'completed' || activeRun?.status === 'expensed';

    // --- 1. DATA FETCHING ---
    // Load ALL logistic lists that are saved but not yet confirmed (status ≠ completed/expensed).
    // The logistic picks one to shop; confirmed/expensed lists drop off this list.
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: runsData } = await supabase
                .from('market_runs')
                .select('*')
                .eq('shopper_role', 'logistics')
                .not('status', 'in', '(completed,expensed)')
                .order('run_date', { ascending: false });

            setRuns((runsData as unknown as MarketRun[]) || []);

            // Fetch shop contacts
            const { data: contactData } = await supabase
                .from('shop_contacts')
                .select('*');

            if (contactData) {
                const contactMap: Record<string, ShopContact> = {};
                contactData.forEach(c => {
                    contactMap[c.shop_name] = c;
                });
                setContacts(contactMap);
            }

        } catch (err) {
            console.error("Fetch data error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LIST SELECTION ---
    const selectRun = (run: MarketRun) => {
        setActiveRun(run);
        setItems((run.items_snapshot as unknown as ShoppingItem[]) || []);
        setActiveTab('all');
    };
    const backToList = () => {
        setActiveRun(null);
        setItems([]);
        fetchData();
    };

    // --- 2. LOGIC HELPERS ---
    const shopTabs = useMemo(() => {
        const tabs = [{ value: 'all', label: t('tabs.allItems'), icon: <LayoutGrid className="w-4 h-4" /> }];
        const uniqueShops = Array.from(new Set(items.map(i => i.target_shop || 'General'))).sort();
        uniqueShops.forEach(shopName => {
            tabs.push({
                value: shopName,
                label: shopName,
                icon: getShopIcon(shopName)
            });
        });
        return tabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tabs recompute on items only, as before (t label read at that time)
    }, [items]);

    const generateLineMessage = (shopName: string, shopItems: ShoppingItem[]) => {
        const dateStr = activeRun?.run_date || new Date().toLocaleDateString();
        let msg = `Sawasdee kha ${shopName}! 🙏\nOrder for Thai Akha Kitchen (${dateStr}):\n\n`;

        shopItems.forEach(item => {
            msg += `- ${item.quantity} ${item.unit} ${item.name}\n`;
        });

        msg += `\nThank you! kha`;
        return msg;
    };

    const handleSendLine = (shopName: string) => {
        const shopItems = items.filter(i => i.target_shop === shopName);
        const message = generateLineMessage(shopName, shopItems);
        const url = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleCall = (phoneNumber: string) => {
        window.open(`tel:${phoneNumber}`, '_self');
    };

    // --- 3. RUN ACTIONS ---
    // Persist the shopping snapshot. `price` is set to the real spent price so the
    // confirmation email + reports read the actual numbers. Auto-saved on each change.
    const persistItems = useCallback(async (nextItems: ShoppingItem[], opts?: { status?: string; silent?: boolean }) => {
        if (!activeRun) return false;
        const snapshot = nextItems.map(it => ({ ...it, price: it.actual_price ?? (it as { price?: number }).price ?? 0 }));
        const totalCost = snapshot.reduce((acc, it) => acc + (Number(it.actual_price) || 0), 0);
        const patch: Record<string, unknown> = {
            items_snapshot: snapshot,
            total_cost: totalCost,
            updated_at: new Date().toISOString(),
        };
        if (opts?.status) patch.status = opts.status;
        const { error } = await supabase.from('market_runs').update(patch).eq('id', activeRun.id);
        if (error && !opts?.silent) alert(t('messages.error', { message: error.message }));
        return !error;
    }, [activeRun, t]);

    const toggleBought = (id: string) => {
        if (locked) return;
        const next = items.map(item => item.id === id ? { ...item, is_bought: !item.is_bought } : item);
        setItems(next);
        persistItems(next, { silent: true });
    };

    // --- Keypad (calcolatrice prezzo) ---
    const openKeypad = (id: string) => {
        if (locked) return;
        const it = items.find(i => i.id === id);
        setKeypadItemId(id);
        setTempPrice(it?.actual_price ? String(it.actual_price) : '0');
        setKeypadOpen(true);
    };
    const handleKeypadPress = (k: string) => setTempPrice(prev => {
        if (prev === '0' && k !== '.') return k;
        if (k === '.' && prev.includes('.')) return prev;
        return prev + k;
    });
    const handleKeypadDelete = () => setTempPrice(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    const handleKeypadConfirm = () => {
        if (keypadItemId) {
            const price = parseFloat(tempPrice) || 0;
            // Entering a price marks the item as purchased (→ "lista acquistati").
            const next = items.map(item => item.id === keypadItemId ? { ...item, actual_price: price, is_bought: true } : item);
            setItems(next);
            persistItems(next, { silent: true });
        }
        setKeypadOpen(false);
    };

    // Salva: salva il progresso, NESSUNA email, lista resta aperta/modificabile.
    const handleSave = async () => {
        setIsSaving(true);
        const ok = await persistItems(items);
        setIsSaving(false);
        if (ok) alert(t('messages.savedProgress', { defaultValue: 'Shopping saved' }));
    };

    // Conferma: chiude la spesa → status completed + email EN all'ufficio + lock.
    const handleConfirm = async () => {
        if (!activeRun) return;
        const unbought = items.filter(i => !i.is_bought).length;
        if (unbought > 0 && !window.confirm(t('messages.unboughtWarning', { count: unbought }))) return;
        setIsConfirming(true);
        const ok = await persistItems(items, { status: 'completed' });
        if (ok) {
            try {
                await supabase.functions.invoke('send-market-confirmation', { body: { run_id: activeRun.id } });
            } catch (e) {
                console.error('Market confirmation email failed (non-blocking):', e);
            }
            alert(t('messages.confirmedClosed', { defaultValue: 'Shopping confirmed — report sent' }));
            setActiveRun(prev => (prev ? { ...prev, status: 'completed' } : prev)); // lock the view
            fetchData(); // refresh the open-lists list (the confirmed one drops off)
        }
        setIsConfirming(false);
    };

    // --- 4. FILTERING & TOTALS ---
    const filteredItems = useMemo(() => {
        if (activeTab === 'all') return items;
        return items.filter(i => (i.target_shop || 'General') === activeTab);
    }, [items, activeTab]);

    const liveTotal = useMemo(() => {
        return items.reduce((acc, item) => acc + (item.actual_price || 0), 0);
    }, [items]);

    const activeContact = activeTab !== 'all' ? contacts[activeTab] : null;

    return {
        loading, setLoading, runs, setRuns, activeRun, setActiveRun, items, setItems, contacts, setContacts, activeTab, setActiveTab, keypadOpen, setKeypadOpen, keypadItemId, setKeypadItemId, tempPrice, setTempPrice, isSaving, setIsSaving, isConfirming, setIsConfirming, locked, fetchData, selectRun, backToList, shopTabs, generateLineMessage, handleSendLine, handleCall, persistItems, toggleBought, openKeypad, handleKeypadPress, handleKeypadDelete, handleKeypadConfirm, handleSave, handleConfirm, filteredItems, liveTotal, activeContact,
    };
}

export type MarketRunnerState = ReturnType<typeof useMarketRunner>;
