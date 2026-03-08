import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AdminThreeColumnLayout } from '../components/layout/index';
import { 
  AdminHeader, 
  AdminListItem, 
  AdminDetailView 
} from '../components/admin/ui/index';
import { 
  Typography, 
  Card, 
  Button, 
  Icon, 
  Badge, 
  Tabs,
  Divider 
} from '../components/ui/index';
import { cn } from '../lib/utils';

// --- TYPES ---
interface Guest {
  internal_id: string;
  full_name: string;
  avatar_url?: string;
  pax_count: number;
  session_name: string;
  session_id: string;
  status: string;
}

interface Product {
  sku: string;
  name: string;
  price: number;
  category: string;
  sub_category?: string;
  stock: number;
  description?: string;
  image?: string;
}

interface OrderItem {
  id?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  status: 'new' | 'pending' | 'paid';
}

const CAT_ICONS: Record<string, string> = {
  beer: 'sports_bar',
  wine: 'wine_bar',
  soft_drink: 'local_drink',
  merch: 'checkroom',
  energy: 'bolt',
  coffee: 'coffee'
};

const SUB_LABELS: Record<string, string> = {
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

const AdminStoreFront: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [selectedSession, setSelectedSession] = useState<'morning' | 'evening'>('morning');
  const [activeCategory, setActiveCategory] = useState<string>('beer');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');

  // Selection & Orders
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<OrderItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. DATA LOADING ---
  const initData = async () => {
    setLoading(true);
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          internal_id, pax_count, status, session_id,
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

      setGuests(bookings?.map((b: any) => ({
        internal_id: b.internal_id,
        full_name: b.profiles?.full_name || 'Walk-in Guest',
        avatar_url: b.profiles?.avatar_url,
        pax_count: b.pax_count,
        session_name: b.class_sessions?.display_name || 'Class',
        session_id: b.session_id,
        status: b.status
      })) || []);

      setProducts(shopItems?.map((p: any) => ({
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
  };

  useEffect(() => { initData(); }, [selectedDate]);

  useEffect(() => {
    if (!activeGuestId) { setCurrentTab([]); return; }
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('shop_orders')
        .select(`id, sku, quantity, unit_price_snapshot, status, shop_akha(item_name)`)
        .eq('booking_id', activeGuestId);
      
      setCurrentTab(data?.map((o: any) => ({
        id: o.id, 
        sku: o.sku, 
        name: o.shop_akha?.item_name || 'Item', 
        price: o.unit_price_snapshot, 
        quantity: o.quantity, 
        status: o.status
      })) || []);
    };
    fetchOrders();
  }, [activeGuestId]);

  // --- 2. ACTIONS ---
  const addToTab = (product: Product) => {
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
  };

  const handleRemoveItem = async (item: OrderItem) => {
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
        } catch(e) { console.error(e); }
    }
  };

  const handleSaveConfirmed = async () => {
    if (!activeGuestId) return;
    setIsProcessing(true);
    try {
        const newItems = currentTab.filter(i => i.status === 'new');
        if (newItems.length > 0) {
            const payload = newItems.map(i => ({ booking_id: activeGuestId, sku: i.sku, quantity: i.quantity, unit_price_snapshot: i.price, status: 'pending' }));
            await supabase.from('shop_orders').insert(payload);
            initData(); // Refresh list/state
        }
    } finally { setIsProcessing(false); }
  };

  const handlePayCash = async () => {
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
  };

  // --- 3. HELPERS ---
  const filteredGuests = useMemo(() => guests.filter(g => g.session_id.includes(selectedSession)), [guests, selectedSession]);
  const activeGuest = guests.find(g => g.internal_id === activeGuestId);
  const totalDue = currentTab.reduce((acc, i) => i.status !== 'paid' ? acc + (i.price * i.quantity) : acc, 0);
  
  const mainCategories = useMemo(() => {
    const uniqueCats = Array.from(new Set(products.map(p => p.category)));
    return uniqueCats.map(cat => ({ value: cat, label: cat.replace(/_/g, ' '), icon: CAT_ICONS[cat] || 'category' }));
  }, [products]);

  const subCategoryTabs = useMemo(() => {
    const tabs = [{ value: 'all', label: 'All', icon: 'apps' }];
    const subs = Array.from(new Set(products.filter(p => p.category === activeCategory).map(p => p.sub_category || 'general')));
    // Fix: Added 'category' as a fallback icon for sub-categories to resolve type mismatch kha
    subs.filter(s => s !== 'general').forEach(sub => tabs.push({ value: sub, label: SUB_LABELS[sub] || sub, icon: 'category' }));
    return tabs;
  }, [products, activeCategory]);

  const displayedProducts = useMemo(() => {
    return products.filter(p => p.category === activeCategory && (activeSubCategory === 'all' || p.sub_category === activeSubCategory));
  }, [products, activeCategory, activeSubCategory]);

  // --- 4. PANES ---
  const leftPane = (
    <div className="flex flex-col h-full">
      <AdminHeader title="Guests" icon="groups" actions={
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-black/5 dark:bg-white/5 border border-border rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
        />
      }/>
      
      <div className="p-4 border-b border-border bg-black/5">
        <div className="flex bg-surface border border-border p-1 rounded-xl shadow-sm">
          {(['morning', 'evening'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSelectedSession(s)}
              className={cn(
                "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                selectedSession === s ? "bg-title text-surface shadow-md" : "text-desc/40 hover:text-title"
              )}
            >
              {s === 'morning' ? 'AM' : 'PM'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredGuests.map(g => (
          <AdminListItem 
            key={g.internal_id}
            title={g.full_name}
            subtitle={g.status}
            isActive={activeGuestId === g.internal_id}
            onClick={() => setActiveGuestId(g.internal_id)}
            status={<Badge variant="mineral" className="h-5 px-1.5 text-[9px]">{g.pax_count}P</Badge>}
          />
        ))}
      </div>
    </div>
  );

  const centerPane = (
    <div className="flex flex-col h-full">
      <AdminHeader title="Catalog" actions={
        <Tabs 
          items={mainCategories} 
          value={activeCategory} 
          onChange={(v) => { setActiveCategory(v); setActiveSubCategory('all'); }}
          variant="pills"
          className="scale-90 origin-right"
        />
      }/>
      
      <div className="bg-surface/50 border-b border-border py-2 overflow-x-auto no-scrollbar flex justify-center">
        <Tabs 
          items={subCategoryTabs} 
          value={activeSubCategory}
          onChange={setActiveSubCategory}
          variant="pills"
          className="scale-75"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background/50">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {displayedProducts.map(p => (
            <Card 
              key={p.sku} 
              variant="glass" 
              padding="none" 
              onClick={() => addToTab(p)}
              className="group relative flex flex-col rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-action transition-all duration-300"
            >
              <div className="aspect-square bg-black/5 overflow-hidden">
                <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.name} />
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded-lg text-[8px] font-mono text-white border border-white/10">x{p.stock}</div>
              </div>
              <div className="p-3">
                <Typography variant="h6" className="text-[11px] font-black uppercase truncate group-hover:text-action leading-tight">{p.name}</Typography>
                <div className="text-sm font-mono font-black text-title mt-1">{p.price} <span className="text-[9px] opacity-40">THB</span></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const rightPane = (
    <AdminDetailView 
      title="Current Tab" 
      subtitle={activeGuest?.full_name || "Select a guest"}
      onClose={() => setActiveGuestId(null)}
      actions={
        <div className="space-y-3">
          <div className="flex justify-between items-end mb-1">
             <span className="text-[10px] font-black text-desc/40 uppercase tracking-widest">Total Amount</span>
             <Typography variant="h2" className="text-action font-mono">{totalDue.toLocaleString()} <span className="text-xs">THB</span></Typography>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="mineral" fullWidth size="lg" onClick={handleSaveConfirmed} disabled={isProcessing || !activeGuestId}>Save Tab</Button>
            <Button variant="action" fullWidth size="lg" icon="payments" onClick={handlePayCash} disabled={isProcessing || totalDue === 0} className="shadow-action-glow">Pay Cash</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {currentTab.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <Icon name="receipt" size="xl" />
            <p className="text-[10px] font-black uppercase mt-2">Empty Tab</p>
          </div>
        ) : (
          currentTab.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-right-2">
              <div className="flex-1 bg-surface border border-border rounded-xl p-3 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={cn("size-6 rounded flex items-center justify-center text-[10px] font-bold text-white", item.status === 'new' ? "bg-action" : "bg-desc/20")}>{item.quantity}</div>
                  <span className="text-xs font-bold text-title uppercase truncate max-w-[120px]">{item.name}</span>
                </div>
                <div className="text-xs font-mono font-bold text-desc">{item.price * item.quantity}</div>
              </div>
              {item.status !== 'paid' && (
                <button onClick={() => handleRemoveItem(item)} className="size-10 rounded-xl hover:bg-red-500/10 text-desc/30 hover:text-red-500 transition-colors flex items-center justify-center">
                  <Icon name="remove" size="xs" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </AdminDetailView>
  );

  return (
    <AdminThreeColumnLayout 
      loading={false}
      leftContent={leftPane}
      centerContent={centerPane}
      rightContent={rightPane}
    />
  );
};

export default AdminStoreFront;