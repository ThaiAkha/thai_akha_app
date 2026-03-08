import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import { 
  Typography, 
  Button, 
  Input, 
  Card, 
  Badge, 
  Icon, 
  Divider,
  Tabs
} from '../components/ui/index';
import { cn } from '../lib/utils';

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
 * Utility to map dynamic shop names to appropriate Material Icons
 */
const getShopIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('veg') || n.includes('lady')) return 'potted_plant';
  if (n.includes('meat') || n.includes('butcher')) return 'kebab_dining';
  if (n.includes('curry') || n.includes('paste')) return 'soup_kitchen';
  if (n.includes('rice') || n.includes('noodle')) return 'ramen_dining';
  if (n.includes('egg') || n.includes('tofu')) return 'egg';
  if (n.includes('fruit')) return 'nutrition';
  if (n.includes('sea') || n.includes('fish')) return 'set_meal';
  if (n.includes('makro') || n.includes('lotus') || n.includes('7-11')) return 'store';
  return 'storefront';
};

const AdminMarketRunner: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeRun, setActiveRun] = useState<MarketRun | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [contacts, setContacts] = useState<Record<string, ShopContact>>({});
  const [activeTab, setActiveTab] = useState('all');

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
    const tabs = [{ value: 'all', label: 'All Items', icon: 'apps' }];
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
      <PageLayout slug="market-runner" hideDefaultHeader={true} loading={true}>
        <div className="h-screen bg-black" />
      </PageLayout>
    );
  }

  if (!activeRun) {
    return (
      <PageLayout slug="market-runner" hideDefaultHeader={true}>
        <div className="flex flex-col items-center justify-center h-[80vh] px-8 text-center space-y-6">
          <div className="size-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
            <Icon name="event_busy" size="2xl" />
          </div>
          <Typography variant="h3" className="uppercase font-black italic">No List Found</Typography>
          <Typography variant="body" className="text-desc/60">The Kitchen Manager hasn't published a shopping list for today yet kha.</Typography>
          <Button variant="brand" onClick={fetchData} icon="refresh">Refresh</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout slug="market-runner" hideDefaultHeader={true} isFullScreen={true}>
      <div className="flex flex-col min-h-screen bg-black font-sans pb-40">
        
        {/* ================= STICKY HEADER ================= */}
        <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-xl border-b border-white/10 p-6 flex justify-between items-end shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="mineral" className="bg-action/20 text-action border-action/30 animate-pulse h-5 px-2 text-[8px]">ACTIVE RUN</Badge>
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">{activeRun.run_date}</span>
            </div>
            <Typography variant="h3" className="text-white font-black italic uppercase leading-none tracking-tighter">Market Shop</Typography>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Live Total</div>
            <div className="text-3xl font-mono font-black text-action leading-none">
              {liveTotal.toLocaleString()} <span className="text-xs font-sans text-white">THB</span>
            </div>
          </div>
        </header>

        {/* ================= DYNAMIC SHOP TABS ================= */}
        <div className="shrink-0 bg-[#0a0a0a] border-b border-white/5 py-4 overflow-x-auto no-scrollbar">
          <Tabs 
            items={shopTabs} 
            value={activeTab} 
            onChange={setActiveTab} 
            variant="pills" 
            containerClass="px-4"
          />
        </div>

        {/* ================= VENDOR CONTACT BANNER ================= */}
        {activeTab !== 'all' && (
          <div className="px-4 pt-4 animate-in slide-in-from-top-4 duration-500">
            <Card variant="glass" className="bg-white/5 border-white/10 p-4 rounded-[1.5rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-action/10 border border-action/20 flex items-center justify-center text-action shadow-inner">
                  <Icon name={getShopIcon(activeTab)} />
                </div>
                <div>
                  <Typography variant="h6" className="text-white uppercase font-black leading-none mb-1 truncate max-w-[120px]">
                    {activeTab}
                  </Typography>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Vendor Contact</p>
                </div>
              </div>
              <div className="flex gap-2">
                {activeContact?.phone_number && (
                  <button 
                    onClick={() => handleCall(activeContact.phone_number!)}
                    className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                  >
                    <Icon name="call" size="sm" />
                  </button>
                )}
                <button 
                  onClick={() => handleSendLine(activeTab)}
                  className="px-4 h-12 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 flex items-center gap-2 text-[#06C755] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg"
                >
                  <Icon name="chat" size="sm" />
                  Send Order
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ================= ITEM LIST ================= */}
        <div className="p-4 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-white/20">
              <Icon name="inventory_2" size="xl" />
              <p className="text-xs font-bold uppercase mt-2 tracking-widest">No items found for this stall</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <Card 
                key={item.id}
                variant="glass"
                padding="none"
                className={cn(
                  "relative flex items-stretch h-28 rounded-[1.5rem] border transition-all duration-500 overflow-hidden",
                  item.is_bought 
                    ? "bg-action/5 border-action/30 grayscale-[0.5] opacity-60" 
                    : "bg-[#1a1a1a] border-white/10 shadow-lg"
                )}
              >
                {/* LEFT: INFO */}
                <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black uppercase text-desc/60 tracking-widest truncate">{item.target_shop}</span>
                    {item.is_bought && <Badge variant="solid" className="bg-action text-[7px] h-3 px-1">BOUGHT</Badge>}
                  </div>
                  <Typography variant="h4" className={cn(
                    "uppercase tracking-tight leading-tight truncate text-lg",
                    item.is_bought ? "text-action line-through" : "text-white"
                  )}>
                    {item.name}
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] font-bold text-white/40">QTY: {item.quantity}</span>
                    <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-white/10 uppercase opacity-60">{item.unit}</Badge>
                  </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="w-[45%] flex items-stretch border-l border-white/5">
                  <div className="flex-1 flex flex-col items-center justify-center p-2 bg-black/20">
                    <input 
                      type="number"
                      placeholder="Price"
                      value={item.actual_price || ''}
                      onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                      className="w-full bg-transparent text-center font-mono font-black text-xl text-white outline-none placeholder:text-white/10"
                    />
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Price THB</span>
                  </div>
                  <button 
                    onClick={() => toggleBought(item.id)}
                    className={cn(
                      "w-20 flex items-center justify-center transition-all active:scale-95",
                      item.is_bought ? "bg-action text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]" : "bg-white/5 text-white/20 hover:text-white/40"
                    )}
                  >
                    <Icon name={item.is_bought ? "check_circle" : "circle"} size="lg" className={cn(item.is_bought ? "animate-in zoom-in duration-300" : "")} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* ================= FIXED FOOTER ================= */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
          <div className="pointer-events-auto max-w-lg mx-auto flex gap-3">
             <Button 
                variant="mineral" 
                size="xl" 
                icon="add_shopping_cart"
                className="size-16 rounded-[1.5rem] bg-surface/80 backdrop-blur-xl shrink-0 border-white/10 text-white"
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
             />
             <Button 
                variant="action" 
                fullWidth 
                size="xl" 
                icon="verified"
                isLoading={isFinishing}
                onClick={handleFinish}
                className="h-16 rounded-[1.5rem] shadow-action-glow font-black text-sm tracking-widest"
              >
                FINISH RUN
              </Button>
          </div>
        </div>

      </div>
    </PageLayout>
  );
};

export default AdminMarketRunner;