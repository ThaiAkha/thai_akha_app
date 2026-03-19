import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { cn } from '@thaiakha/shared/lib/utils';
import {
    CalendarDays, ShoppingCart, Store, Phone, MessageCircle,
    CheckCircle2, Circle, Plus, RefreshCw, Check,
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
    const [loading, setLoading] = useState(true);
    const [isFinishing, setIsFinishing] = useState(false);
    const [activeRun, setActiveRun] = useState<MarketRun | null>(null);
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [contacts, setContacts] = useState<Record<string, ShopContact>>({});
    const [activeTab, setActiveTab] = useState('all');

    // ✅ AppHeader handles setPageHeader automatically
    usePageMetadata('admin-market-run');


    // --- 1. DATA FETCHING ---
    const fetchData = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        try {
            // Fetch active run
            const { data: runData } = await supabase
                .from('market_runs')
                .select('*')
                .eq('run_date', today)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (runData) {
                setActiveRun(runData);
                setItems(runData.items_snapshot || []);
            } else {
                setActiveRun(null);
                setItems([]);
            }

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

    // --- 2. LOGIC HELPERS ---
    const shopTabs = useMemo(() => {
        const tabs = [{ value: 'all', label: 'All Items', icon: <LayoutGrid className="w-4 h-4" /> }];
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
    const toggleBought = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, is_bought: !item.is_bought } : item
        ));
    };

    const updatePrice = (id: string, price: number) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, actual_price: price } : item
        ));
    };

    const handleFinish = async () => {
        if (!activeRun) return;

        const unboughtCount = items.filter(i => !i.is_bought).length;
        let confirmMsg = "Mark this run as COMPLETED and save all costs? kha";
        if (unboughtCount > 0) {
            confirmMsg = `Wait! You have ${unboughtCount} items left unbought. Finish anyway? kha`;
        }

        if (!window.confirm(confirmMsg)) return;

        setIsFinishing(true);
        const totalCost = items.reduce((acc, item) => acc + (item.actual_price || 0), 0);

        try {
            const { error } = await supabase
                .from('market_runs')
                .update({
                    items_snapshot: items,
                    total_cost: totalCost,
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeRun.id);

            if (error) throw error;
            alert("Run synchronized with Kitchen! Good job kha!");
            fetchData();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsFinishing(false);
        }
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
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (!activeRun) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] overflow-hidden space-y-6 animate-in fade-in duration-500">
                <div className="size-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <CalendarDays className="w-10 h-10" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase text-gray-900 dark:text-white italic">No List Found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">The Kitchen Manager hasn't published a shopping list for today yet kha.</p>
                </div>
                <Button onClick={fetchData} startIcon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
            </div>
        );
    }

    return (
        <PageContainer className="h-[calc(100vh-64px)] overflow-hidden">
            <div className="flex flex-col h-full relative bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* ================= TOTALS & TABS TOOLBAR ================= */}
                <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
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
                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest text-left">
                                Live<br />Total
                            </div>
                            <div className="text-2xl font-mono font-black text-primary-600 dark:text-primary-400 leading-none">
                                {liveTotal.toLocaleString()} <span className="text-[10px] font-sans text-gray-400 font-normal">THB</span>
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
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Vendor Contact</p>
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
                                        className="px-4 h-10 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 flex items-center gap-2 text-[#06C755] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 hover:bg-[#06C755]/20"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Send Order
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
                                <p className="text-xs font-bold uppercase tracking-widest">No items found for this stall</p>
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
                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest truncate max-w-[100px]">{item.target_shop}</span>
                                            {item.is_bought && <Badge variant="solid" color="success" size="sm" className="text-[8px] h-4 px-1.5">BOUGHT</Badge>}
                                        </div>
                                        <h4 className={cn(
                                            "uppercase font-bold leading-tight truncate text-base",
                                            item.is_bought ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"
                                        )}>
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-mono text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-1.5 py-0.5 rounded">QTY: {item.quantity}</span>
                                            <span className="text-[9px] font-medium text-gray-400 uppercase border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">{item.unit}</span>
                                        </div>
                                    </div>

                                    {/* RIGHT: ACTIONS */}
                                    <div className="w-[120px] flex items-stretch border-l border-gray-100 dark:border-gray-700">
                                        <div className="flex-1 flex flex-col items-center justify-center p-1 bg-gray-50 dark:bg-gray-900/50">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={item.actual_price || ''}
                                                onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                                                className="w-full bg-transparent text-center font-mono font-black text-lg text-gray-900 dark:text-white outline-none placeholder:text-gray-300"
                                            />
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">THB</span>
                                        </div>
                                        <button
                                            onClick={() => toggleBought(item.id)}
                                            className={cn(
                                                "w-12 flex items-center justify-center transition-all active:scale-95 border-l border-gray-100 dark:border-gray-700",
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
                    <Button
                        variant="outline"
                        className="aspect-square h-12 rounded-xl border-dashed border-2 shrink-0 justify-center p-0 w-12"
                        onClick={() => {
                            const name = prompt("Emergency Item Name? kha");
                            if (name) {
                                const newItem: ShoppingItem = {
                                    id: crypto.randomUUID(),
                                    name,
                                    unit: 'units',
                                    quantity: 1,
                                    target_shop: 'Emergency',
                                    is_bought: false
                                };
                                setItems(prev => [...prev, newItem]);
                            }
                        }}
                    >
                        <Plus className="w-5 h-5 text-gray-400" />
                    </Button>
                    <Button
                        variant="primary"

                        size="md"
                        startIcon={<Check className="w-5 h-5" />}
                        onClick={handleFinish}

                        disabled={isFinishing}
                        className="h-12 rounded-xl shadow-lg"
                    >
                        FINISH RUN
                    </Button>
                </div>

            </div>
        </PageContainer>
    );
};

export default MarketRunner;
