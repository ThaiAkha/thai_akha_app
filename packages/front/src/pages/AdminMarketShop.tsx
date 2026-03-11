import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AdminThreeColumnLayout } from '../components/layout/index';
import { 
  AdminHeader, 
  AdminSearch, 
  AdminListItem, 
  AdminDetailView 
} from '../components/admin/ui/index';
import { 
  Typography, 
  Button, 
  Badge, 
  Icon, 
  Divider, 
  Tabs,
  Card,
  Table,
  Modal
} from '../components/ui/index';
import MiniCalendar from '../components/ui/MiniCalendar';
import NumericKeypad from '../components/ui/NumericKeypad';
import { ShopItemCard } from '../components/market/ShopItemCard';
import { cn } from '../lib/utils';

// --- TYPES ---
interface LibraryItem {
  id: string;
  name_en: string;
  name_th: string;
  image_url: string;
  is_logistics_item: boolean;
  is_teacher_item: boolean;
  purchase_group: string;
  logistics_shop: string;
  teacher_shop: string;
  unit_default: string;
}

interface DraftItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price: number; 
  target_shop: string;
}

interface MarketRun {
  id: string;
  run_date: string;
  shopper_role: 'logistics' | 'teacher';
  items_snapshot: DraftItem[];
  status: 'planned' | 'completed';
  total_cost: number;
}

type TabType = 'dashboard' | 'logistics' | 'teacher';
type ViewMode = 'list' | 'planner';

// --- HELPERS ---
const formatLongDate = (date: Date) => {
  return date.toLocaleDateString('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).replace(/^\w/, (c) => c.toUpperCase());
};

const AdminMarketShop: React.FC = () => {
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isEditSelectionMode, setIsEditSelectionMode] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [history, setHistory] = useState<MarketRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<MarketRun | null>(null);
  
  // Keypad State
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [keypadItemId, setKeypadItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('0');

  // Workspace State
  const [formState, setFormState] = useState<Record<string, { qty: number; price: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeShopTab, setActiveShopTab] = useState('All');

  const selectedDateStr = useMemo(() => {
    const offset = selectedDate.getTimezoneOffset() * 60000;
    return new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];
  }, [selectedDate]);

  const activeScope = activeTab === 'dashboard' ? null : activeTab;

  // --- 1. DATA INITIALIZATION ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [libRes, runRes] = await Promise.all([
        supabase.from('ingredients_library').select('*').order('name_en'),
        supabase.from('market_runs').select('*').order('run_date', { ascending: false })
      ]);
      if (libRes.data) setLibrary(libRes.data);
      if (runRes.data) setHistory(runRes.data);
    } catch (err) {
      console.error("Market Console Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. HYDRATION LOGIC ---
  const hydrateDraft = (run: MarketRun) => {
    const newState: Record<string, { qty: number; price: number }> = {};
    run.items_snapshot.forEach(item => {
      newState[item.id] = { qty: item.quantity, price: item.price };
    });
    setFormState(newState);
    setSelectedRun(run);
    setSelectedDate(new Date(run.run_date));
    setActiveTab(run.shopper_role);
    setViewMode('planner');
    setIsEditSelectionMode(false);
  };

  const startNewReport = (date: Date) => {
    setSelectedDate(date);
    setFormState({});
    setSelectedRun(null);
    setViewMode('planner');
    setIsCalendarModalOpen(false);
  };

  // --- 3. FILTERING LOGIC ---
  const filteredLibrary = useMemo(() => {
    if (!activeScope) return [];
    return library.filter(item => {
      const matchScope = activeScope === 'teacher' ? item.is_teacher_item : item.is_logistics_item;
      if (!matchScope) return false;

      const itemShop = (activeScope === 'teacher' ? item.teacher_shop : item.logistics_shop) || 'General';
      const matchShop = activeShopTab === 'All' || itemShop === activeShopTab;
      const matchSearch = item.name_en.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchShop && matchSearch;
    });
  }, [library, activeScope, activeShopTab, searchQuery]);

  const uniqueShops = useMemo(() => {
    if (!activeScope) return [];
    const shops = new Set<string>();
    library.forEach(item => {
      const isRelevant = activeScope === 'logistics' ? item.is_logistics_item : item.is_teacher_item;
      if (isRelevant) {
        const shopName = activeScope === 'logistics' ? item.logistics_shop : item.teacher_shop;
        shops.add(shopName || 'General');
      }
    });
    return ['All', ...Array.from(shops).sort()];
  }, [library, activeScope]);

  // --- 4. WORKSPACE ACTIONS ---
  const handleToggleLogistics = (itemId: string) => {
    setFormState(prev => {
      const newState = { ...prev };
      if (newState[itemId]) delete newState[itemId];
      else newState[itemId] = { qty: 1, price: 0 };
      return newState;
    });
  };

  const openKeypad = (itemId: string) => {
    setKeypadItemId(itemId);
    setTempPrice(formState[itemId]?.price.toString() || '0');
    setKeypadOpen(true);
  };

  const handleKeypadPress = (key: string) => {
    setTempPrice(prev => {
      if (prev === '0' && key !== '.') return key;
      if (key === '.' && prev.includes('.')) return prev;
      return prev + key;
    });
  };

  const handleKeypadDelete = () => {
    setTempPrice(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleKeypadConfirm = () => {
    if (keypadItemId) {
      const priceVal = parseFloat(tempPrice) || 0;
      setFormState(prev => ({
        ...prev,
        [keypadItemId]: { qty: prev[keypadItemId]?.qty || 1, price: priceVal }
      }));
    }
    setKeypadOpen(false);
  };

  const handleSave = async () => {
    if (!activeScope) return;
    const itemsToSave = Object.entries(formState)
      .map(([id, val]) => {
        const item = library.find(l => l.id === id);
        return {
          id,
          name: item?.name_en || 'Unknown',
          unit: item?.unit_default || 'unit',
          quantity: val.qty,
          price: val.price,
          target_shop: (activeScope === 'teacher' ? item?.teacher_shop : item?.logistics_shop) || 'General'
        };
      });

    if (itemsToSave.length === 0) return alert("Please select at least one item kha.");
    
    setIsSaving(true);
    try {
      const isTeacher = activeScope === 'teacher';
      const { error } = await supabase.from('market_runs').upsert({
        run_date: selectedDateStr,
        shopper_role: activeScope,
        items_snapshot: itemsToSave,
        status: isTeacher ? 'completed' : 'planned',
        total_cost: itemsToSave.reduce((acc, i) => acc + (i.price * i.quantity), 0),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'run_date, shopper_role' 
      });

      if (error) throw error;
      alert("Changes saved successfully kha!");
      fetchData();
      setActiveTab('dashboard');
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 5. PANES ---

  const leftPane = (
    <div className="flex flex-col h-full bg-surface/30">
      <AdminHeader title="Market Hub" icon="storefront" className="h-20" />
      
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <Typography variant="caption" className="text-desc/40 uppercase font-black tracking-widest ml-1">Context Date</Typography>
          <MiniCalendar 
            value={selectedDate} 
            onChange={(d) => { 
                setSelectedDate(d);
                const existing = history.find(h => h.run_date === (new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]) && h.shopper_role === activeTab);
                if (existing) setSelectedRun(existing);
                else setSelectedRun(null);
                setFormState({});
            }} 
          />
        </div>

        <div className="space-y-3">
           <Typography variant="caption" className="text-desc/40 uppercase font-black tracking-widest ml-1">Quick Status</Typography>
           <div className={cn(
             "p-4 rounded-2xl border transition-all duration-500 flex items-center gap-3",
             selectedRun ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
           )}>
              <Icon name={selectedRun ? "verified" : "add_circle"} />
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest">{selectedRun ? 'Report Active' : 'Ready to Create'}</div>
                <div className="text-[9px] opacity-60 truncate">{formatLongDate(selectedDate)}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderCenterContent = () => {
    const tabs = [
      { label: 'Dashboard', value: 'dashboard', icon: 'dashboard' },
      { label: 'Logistics', value: 'logistics', icon: 'local_shipping' },
      { label: 'Teacher', value: 'teacher', icon: 'school' }
    ];

    return (
      <div className="flex flex-col h-full">
        <AdminHeader 
          title={activeTab === 'dashboard' ? 'Console Overview' : `${activeTab.toUpperCase()} View`}
          className="h-20"
          actions={
            <Tabs 
              variant="pills"
              items={tabs} 
              value={activeTab} 
              onChange={(v) => {
                  setActiveTab(v as TabType);
                  setViewMode('list'); 
                  setIsEditSelectionMode(false);
              }} 
              className="scale-90"
            />
          }
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'dashboard' ? (
            <div className="p-12 space-y-12 animate-in fade-in duration-700">
              <div className="max-w-2xl space-y-4">
                <Typography variant="display2" className="text-title italic leading-none">Market Console</Typography>
                <Typography variant="paragraphM" className="text-desc opacity-70">
                  Welcome to the central marketplace hub. Create daily lists for logistics or report final costs as a teacher.
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LOGISTICS CARD */}
                <Card variant="glass" className="p-10 space-y-8 bg-primary/5 border-primary/20 hover:border-primary/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="size-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary shadow-inner transition-transform group-hover:scale-110">
                      <Icon name="local_shipping" size="lg" />
                    </div>
                    <Typography variant="h3" className="text-title italic uppercase tracking-tighter">Logistics</Typography>
                  </div>
                  <div className="space-y-3">
                    <Button variant="brand" fullWidth size="lg" icon="today" onClick={() => { setSelectedDate(new Date()); setActiveTab('logistics'); setViewMode('planner'); setFormState({}); }}>New Plan for Today</Button>
                    <Button variant="mineral" fullWidth size="lg" icon="event" onClick={() => { setActiveTab('logistics'); setIsCalendarModalOpen(true); }}>New Plan Select Date</Button>
                    <Button variant="ghost" fullWidth size="lg" icon="history" onClick={() => { setActiveTab('logistics'); setViewMode('list'); }}>View History</Button>
                  </div>
                </Card>

                {/* TEACHER CARD */}
                <Card variant="glass" className="p-10 space-y-8 bg-action/5 border-action/20 hover:border-action/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="size-16 rounded-[1.5rem] bg-action/20 flex items-center justify-center text-action shadow-inner transition-transform group-hover:scale-110">
                      <Icon name="school" size="lg" />
                    </div>
                    <Typography variant="h3" className="text-title italic uppercase tracking-tighter">Teacher</Typography>
                  </div>
                  <div className="space-y-3">
                    <Button variant="action" fullWidth size="lg" icon="assignment" onClick={() => { setSelectedDate(new Date()); setActiveTab('teacher'); setViewMode('planner'); setFormState({}); }}>New Report for Today</Button>
                    <Button variant="mineral" fullWidth size="lg" icon="event" onClick={() => { setActiveTab('teacher'); setIsCalendarModalOpen(true); }}>New Report Select Date</Button>
                    <Button variant="ghost" fullWidth size="lg" icon="history" onClick={() => { setActiveTab('teacher'); setViewMode('list'); }}>View History</Button>
                  </div>
                </Card>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
               <AdminHeader 
                 title="Report Archives" 
                 icon="history"
                 actions={
                    <div className="flex gap-2">
                       <Button 
                        variant="mineral" 
                        size="sm" 
                        icon={isEditSelectionMode ? "close" : "edit"} 
                        onClick={() => setIsEditSelectionMode(!isEditSelectionMode)}
                        className={cn(isEditSelectionMode && "bg-red-500/10 text-red-500 border-red-500/20")}
                      >
                        {isEditSelectionMode ? 'Cancel' : 'Modifica Report'}
                      </Button>
                      <Button 
                        variant="brand" 
                        size="sm" 
                        icon="add" 
                        onClick={() => setIsCalendarModalOpen(true)}
                      >
                        New {activeTab === 'teacher' ? 'Report' : 'Plan'}
                      </Button>
                    </div>
                 }
               />
               <div className="p-10">
                  <Table 
                    data={history.filter(r => r.shopper_role === activeTab)}
                    columns={[
                      { key: 'run_date', header: 'Date', render: (v) => <span className="font-mono font-black">{v}</span> },
                      { key: 'status', header: 'Status', render: (v) => <Badge variant="outline" className="uppercase text-[9px]">{v}</Badge> },
                      { key: 'items_snapshot', header: 'Items', align: 'center', render: (v: any[]) => v.length },
                      { key: 'total_cost', header: 'Total Cost', align: 'right', render: (v) => <span className="font-mono text-action font-black">{v} THB</span> },
                      { 
                        key: 'actions', 
                        header: '', 
                        align: 'right',
                        render: (_, row) => (isEditSelectionMode && selectedRun?.id === row.id) ? (
                          <Button 
                            variant="action" 
                            size="xs" 
                            icon="edit" 
                            onClick={(e) => { e.stopPropagation(); hydrateDraft(row); }}
                            className="animate-in zoom-in"
                          >
                            Modifica
                          </Button>
                        ) : null
                      }
                    ]}
                    onRowClick={(row) => setSelectedRun(row)}
                    className="bg-surface shadow-2xl"
                  />
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
              <AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search ingredients..." />
              <div className="bg-surface/50 border-b border-border py-4 overflow-x-auto no-scrollbar flex justify-center shrink-0">
                <Tabs 
                  items={uniqueShops.map(s => ({ value: s, label: s, icon: s === 'All' ? 'apps' : 'storefront' }))} 
                  value={activeShopTab}
                  onChange={setActiveShopTab}
                  variant="pills"
                  className="scale-90 flex-nowrap"
                />
              </div>
              <div className="flex-1 p-6 bg-background/50">
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 pb-40">
                  {filteredLibrary.map(item => (
                    <ShopItemCard 
                      key={item.id}
                      item={item}
                      mode={activeTab as any}
                      price={formState[item.id]?.price || 0}
                      isAdded={!!formState[item.id]}
                      onToggle={() => handleToggleLogistics(item.id)}
                      onClick={() => openKeypad(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const rightPane = (
    <AdminDetailView 
      title="Work Draft" 
      subtitle={viewMode === 'list' ? 'Archive View' : 'Live Editing'}
      className="h-full flex flex-col"
      onClose={() => setViewMode('list')}
      actions={
        activeTab !== 'dashboard' && viewMode === 'planner' && Object.keys(formState).length > 0 && (
          <div className="pb-24">
            <Button 
              variant="action" 
              fullWidth 
              size="xl" 
              icon="send" 
              isLoading={isSaving}
              onClick={handleSave}
              className="shadow-action-glow rounded-[1.5rem] h-16"
            >
              {activeTab === 'teacher' ? 'Submit Report' : 'Publish Plan'}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-8 h-full">
        <div className="text-center px-4">
          <Typography variant="h4" className="text-primary italic font-black uppercase tracking-widest drop-shadow-sm">
            {formatLongDate(selectedDate)}
          </Typography>
        </div>

        <div className={cn(
          "p-8 rounded-[2.5rem] border text-center transition-all duration-700",
          activeTab === 'teacher' ? "bg-action/5 border-action/20" : "bg-primary/5 border-primary/20"
        )}>
          <Typography variant="caption" className="uppercase font-black text-desc/40 tracking-widest block mb-1">
            {activeTab === 'teacher' ? 'Total Expenses' : 'Items Required'}
          </Typography>
          <Typography variant="h2" className="font-mono text-title">
            {viewMode === 'list' && selectedRun 
              ? `${selectedRun.total_cost.toLocaleString()} THB`
              : activeTab === 'teacher' 
                ? `${Object.values(formState).reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} THB`
                : `${Object.keys(formState).length} Items`
            }
          </Typography>
        </div>

        <Divider label="Item Checklist" />

        <div className="space-y-3 pb-32">
          {(viewMode === 'list' && selectedRun ? selectedRun.items_snapshot : Object.entries(formState)).map((entry: any) => {
            const id = Array.isArray(entry) ? entry[0] : entry.id;
            const val = Array.isArray(entry) ? entry[1] : entry;
            const libItem = library.find(l => l.id === id);
            
            return (
              <div 
                key={id} 
                onClick={() => viewMode === 'planner' && activeTab === 'teacher' && openKeypad(id)}
                className={cn(
                  "flex items-center justify-between p-4 bg-surface border border-border rounded-2xl animate-in slide-in-from-right-2 transition-all",
                  (viewMode === 'planner' && activeTab === 'teacher') && "cursor-pointer hover:border-action hover:bg-action/5"
                )}
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-title uppercase truncate">{libItem?.name_en || val.name}</div>
                  <div className="text-[10px] text-desc/40 font-mono">x{val.qty || val.quantity} {libItem?.unit_default || val.unit}</div>
                </div>
                {(activeTab === 'teacher' || (selectedRun && selectedRun.shopper_role === 'teacher')) && (
                  <div className="text-right">
                    <div className="font-mono font-black text-action">{val.price} <span className="text-[9px] opacity-40">THB</span></div>
                    {viewMode === 'planner' && <span className="text-[8px] uppercase font-black text-action/40">Tap to edit</span>}
                  </div>
                )}
              </div>
            );
          })}
          {((viewMode === 'list' && !selectedRun) || (viewMode === 'planner' && Object.keys(formState).length === 0)) && (
            <div className="py-20 text-center opacity-20"><Icon name="inventory" size="xl" /><p className="text-[10px] font-black uppercase mt-2">No selections yet</p></div>
          )}
        </div>
      </div>
    </AdminDetailView>
  );

  return (
    <div className="h-screen overflow-hidden">
      <AdminThreeColumnLayout 
        loading={false}
        leftContent={leftPane}
        centerContent={renderCenterContent()}
        rightContent={rightPane}
      />

      {/* Date Selection Modal for New Report */}
      <Modal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        title="Select Date for New Report"
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <MiniCalendar 
            value={selectedDate} 
            onChange={(d) => startNewReport(d)} 
          />
          <Button variant="mineral" fullWidth onClick={() => setIsCalendarModalOpen(false)}>Cancel</Button>
        </div>
      </Modal>

      <Modal isOpen={keypadOpen} onClose={() => setKeypadOpen(false)} title="Enter Price" size="sm" className="bg-transparent border-none shadow-none">
        <div className="space-y-4">
            <div className="bg-surface p-6 rounded-3xl border-2 border-action text-center shadow-2xl">
               <Typography variant="caption" className="uppercase font-black text-action tracking-widest mb-1 block">Input THB</Typography>
               <Typography variant="h2" className="font-mono text-title text-4xl">{tempPrice}</Typography>
            </div>
            <NumericKeypad 
                onKeyPress={handleKeypadPress}
                onDelete={handleKeypadDelete}
                onConfirm={handleKeypadConfirm}
            />
        </div>
      </Modal>
    </div>
  );
};

export default AdminMarketShop;