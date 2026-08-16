import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Modal } from '../../components/ui/modal';
import NumericKeypad from '../../components/common/NumericKeypad';
import { cn } from '@thaiakha/shared/lib/utils';
import {
    ShoppingCart, Store, Phone, MessageCircle,
    CheckCircle2, Circle, Plus, RefreshCw, Check, Save, Lock,
    Utensils, Wheat, Egg, Apple, Fish, Beef, Soup, LayoutGrid
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageMetadata } from '../../hooks/usePageMetadata';

interface ShoppingItem {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    target_shop: string;
    is_bought?: boolean;
    actual_price?: number;
}

interface MarketRun {
    id: string;
    run_date: string;
    items_snapshot: ShoppingItem[];
    status: string;
}

interface ShopContact {
    shop_name: string;
    line_id: string | null;
    phone_number: string | null;
}

/**
 * Utility to map dynamic shop names to appropriate Lucide Icons
 */
const getShopIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('veg') || n.includes('lady')) return <Utensils className="w-5 h-5" />;
    if (n.includes('meat') || n.includes('butcher')) return <Beef className="w-5 h-5" />;
    if (n.includes('curry') || n.includes('paste')) return <Soup className="w-5 h-5" />;
    if (n.includes('rice') || n.includes('noodle')) return <Wheat className="w-5 h-5" />;
    if (n.includes('egg') || n.includes('tofu')) return <Egg className="w-5 h-5" />;
    if (n.includes('fruit')) return <Apple className="w-5 h-5" />;
    if (n.includes('sea') || n.includes('fish')) return <Fish className="w-5 h-5" />;
    if (n.includes('makro') || n.includes('lotus') || n.includes('7-11')) return <Store className="w-5 h-5" />;
    return <Store className="w-5 h-5" />;
};

const MarketRunner: React.FC = () => {
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

    // ✅ AppHeader handles setPageHeader automatically
    usePageMetadata('admin-market-run');


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

    // --- RENDERERS ---
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="loader">{t('messages.loading')}</div>
            </div>
        );
    }

    // --- LIST SELECTION VIEW (saved, not-yet-confirmed logistic lists) ---
    if (!activeRun) {
        return (
            <PageContainer className="h-[calc(100vh-64px)] overflow-y-auto">
                <div className="animate-in fade-in duration-500 py-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black uppercase italic text-gray-900 dark:text-white leading-none">{t('runner.pickList', { defaultValue: 'Saved shopping lists' })}</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1">{t('runner.pickListHint', { defaultValue: 'Pick a list to start shopping' })}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchData} startIcon={<RefreshCw className="w-4 h-4" />}>{t('buttons.refresh')}</Button>
                    </div>

                    {runs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                            <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                <ShoppingCart className="w-9 h-9" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-base font-black uppercase text-gray-900 dark:text-white">{t('empty.noListFound')}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{t('runner.noListsHint', { defaultValue: 'Create a shopping list first in "Shopping List".' })}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {runs.map(run => {
                                const its = (run.items_snapshot as unknown as ShoppingItem[]) || [];
                                const shops = new Set(its.map(i => i.target_shop || 'General')).size;
                                return (
                                    <button
                                        key={run.id}
                                        onClick={() => selectRun(run)}
                                        className="group text-left p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-300 dark:hover:border-primary-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                                <ShoppingCart className="w-5 h-5" />
                                            </div>
                                            <Badge variant="light" color="light" size="sm" className="uppercase">{run.status}</Badge>
                                        </div>
                                        <div className="font-mono font-black text-gray-900 dark:text-white text-lg leading-none">{run.run_date}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">
                                            {t('runner.listMeta', { defaultValue: '{{items}} items · {{shops}} shops', items: its.length, shops })}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="h-[calc(100vh-64px)] overflow-hidden">
            <div className="flex flex-col h-full relative bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* ================= TOTALS & TABS TOOLBAR ================= */}
                <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 items-center">
                            <button
                                onClick={backToList}
                                className="shrink-0 inline-flex items-center gap-1 px-3 h-8 rounded-full text-xs font-bold uppercase text-gray-500 border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            >
                                ← {t('buttons.lists', { defaultValue: 'Lists' })}
                            </button>
                            {shopTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all border",
                                        activeTab === tab.value
                                            ? "bg-primary-600 text-white border-primary-600 shadow-primary-glow"
                                            : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                    )}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="text-right flex items-center gap-4 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 ml-auto">
                            <div className="text-xs font-black uppercase text-gray-400 tracking-widest text-left">
                                {t('labels.liveTotal')}
                            </div>
                            <div className="text-2xl font-mono font-black text-primary-600 dark:text-primary-400 leading-none">
                                {liveTotal.toLocaleString()} <span className="text-xs font-sans text-gray-400 font-normal">THB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= SCROLLABLE CONTENT ================= */}
                <div className="flex-1 overflow-y-auto pb-32">
                    {/* VENDOR CONTACT BANNER */}
                    {activeTab !== 'all' && (
                        <div className="px-4 pt-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                                        {typeof activeContact === 'undefined' ? <Store className="w-5 h-5" /> : getShopIcon(activeTab)}
                                    </div>
                                    <div>
                                        <h6 className="text-gray-900 dark:text-white uppercase font-black leading-none mb-1 truncate max-w-[120px]">
                                            {activeTab}
                                        </h6>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('labels.vendorContact')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {activeContact?.phone_number && (
                                        <button
                                            onClick={() => handleCall(activeContact.phone_number!)}
                                            className="size-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 transition-all border border-gray-200 dark:border-gray-600"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSendLine(activeTab)}
                                        className="px-4 h-10 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 flex items-center gap-2 text-[#06C755] font-black uppercase text-xs tracking-widest transition-all active:scale-95 hover:bg-[#06C755]/20"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        {t('buttons.sendOrder')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ITEM LIST */}
                    <div className="p-4 space-y-3">
                        {filteredItems.length === 0 ? (
                            <div className="py-20 text-center text-gray-300 dark:text-gray-600 flex flex-col items-center gap-3">
                                <ShoppingCart className="w-12 h-12 opacity-50" />
                                <p className="text-xs font-bold uppercase tracking-widest">{t('empty.noItemsForStall')}</p>
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "relative flex items-stretch min-h-24 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
                                        item.is_bought
                                            ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60"
                                            : "border-gray-200 dark:border-gray-700"
                                    )}
                                >
                                    {/* LEFT: INFO */}
                                    <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-black uppercase text-gray-400 tracking-widest truncate max-w-[100px]">{item.target_shop}</span>
                                            {item.is_bought && <Badge variant="solid" color="success" size="sm" className="text-xs h-4 px-1.5">BOUGHT</Badge>}
                                        </div>
                                        <h4 className={cn(
                                            "uppercase font-bold leading-tight truncate text-base",
                                            item.is_bought ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"
                                        )}>
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded">{t('labels.qty', { quantity: item.quantity })}</span>
                                            <span className="text-xs font-medium text-gray-400 uppercase border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">{item.unit}</span>
                                        </div>
                                    </div>

                                    {/* RIGHT: ACTIONS */}
                                    <div className="w-[120px] flex items-stretch border-l border-gray-100 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => openKeypad(item.id)}
                                            disabled={locked}
                                            className="flex-1 flex flex-col items-center justify-center p-1 bg-gray-50 dark:bg-gray-900/50 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60 disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-900/50"
                                        >
                                            <span className="font-mono font-black text-lg text-gray-900 dark:text-white">{item.actual_price ? item.actual_price.toLocaleString() : '0'}</span>
                                            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">THB</span>
                                        </button>
                                        <button
                                            onClick={() => toggleBought(item.id)}
                                            disabled={locked}
                                            className={cn(
                                                "w-12 flex items-center justify-center transition-all active:scale-95 border-l border-gray-100 dark:border-gray-700 disabled:opacity-60",
                                                item.is_bought
                                                    ? "bg-green-500 text-white"
                                                    : "bg-white dark:bg-gray-800 text-gray-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            )}
                                        >
                                            {item.is_bought ? <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" /> : <Circle className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ================= FIXED FOOTER ================= */}
                <div className="absolute bottom-4 left-4 right-4 z-40 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-xl flex gap-2">
                    {locked ? (
                        <div className="flex-1 h-12 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-black uppercase text-xs tracking-widest">
                            <Lock className="w-4 h-4" /> {t('labels.confirmedLocked', { defaultValue: 'Shopping confirmed — locked' })}
                        </div>
                    ) : (
                        <>
                            {/* Emergency add */}
                            <Button
                                variant="outline"
                                className="aspect-square h-12 rounded-xl border-dashed border-2 shrink-0 justify-center p-0 w-12"
                                onClick={() => {
                                    const name = prompt(t('messages.emergencyItemName'));
                                    if (name) {
                                        const newItem: ShoppingItem = { id: crypto.randomUUID(), name, unit: 'units', quantity: 1, target_shop: 'Emergency', is_bought: false };
                                        const next = [...items, newItem];
                                        setItems(next);
                                        persistItems(next, { silent: true });
                                    }
                                }}
                            >
                                <Plus className="w-5 h-5 text-gray-400" />
                            </Button>
                            {/* Salva — salva progresso, no email */}
                            <Button variant="outline" size="md" startIcon={<Save className="w-5 h-5" />} onClick={handleSave} disabled={isSaving || isConfirming} className="h-12 rounded-xl">
                                {t('buttons.save', { defaultValue: 'Save' })}
                            </Button>
                            {/* Conferma — chiude + email */}
                            <Button variant="primary" size="md" startIcon={<Check className="w-5 h-5" />} onClick={handleConfirm} disabled={isSaving || isConfirming} className="flex-1 h-12 rounded-xl shadow-lg justify-center">
                                {t('buttons.confirmClose', { defaultValue: 'Confirm & close' })}
                            </Button>
                        </>
                    )}
                </div>

                {/* Numeric keypad (price entry) */}
                <Modal isOpen={keypadOpen} onClose={() => setKeypadOpen(false)} className="bg-transparent border-none shadow-none max-w-sm p-0">
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-primary-500 text-center shadow-2xl">
                            <span className="uppercase font-black text-primary-600 tracking-widest mb-1 block text-xs">{t('labels.inputThb', { defaultValue: 'Price (THB)' })}</span>
                            <div className="font-mono text-gray-900 dark:text-white text-4xl font-bold flex items-center justify-center gap-2">
                                {tempPrice}<span className="text-xl opacity-50">฿</span>
                            </div>
                        </div>
                        <NumericKeypad onKeyPress={handleKeypadPress} onDelete={handleKeypadDelete} onConfirm={handleKeypadConfirm} />
                    </div>
                </Modal>

            </div>
        </PageContainer>
    );
};

export default MarketRunner;
