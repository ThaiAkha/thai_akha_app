import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import Input from '../../components/form/input/InputField';
import { ShopItemCard } from '../../components/market/ShopItemCard';
import MiniCalendar from '../../components/common/MiniCalendar';
import NumericKeypad from '../../components/common/NumericKeypad';
import { cn } from '@thaiakha/shared/lib/utils';
import {
  LayoutDashboard, Truck, GraduationCap, Calendar as CalendarIcon,
  Search, Plus, History, Edit, X, ShoppingCart, CheckCircle2
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import WelcomeHero from '../../components/dashboard/WelcomeHero';

// --- TYPES ---
interface ChecklistDisplayItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

// Normalizes both formState entries [id, {qty,price}] and DraftItem snapshots
// to a common display shape, resolving names/units from the library where needed.
function normalizeEntry(
  entry: [string, { qty: number; price: number }] | DraftItem,
  lib: LibraryItem[]
): ChecklistDisplayItem {
  if (Array.isArray(entry)) {
    const [id, val] = entry;
    const libItem = lib.find(l => l.id === id);
    return { id, name: libItem?.name_en || '', qty: val.qty, unit: libItem?.unit_default || 'unit', price: val.price };
  }
  return { id: entry.id, name: entry.name, qty: entry.quantity, unit: entry.unit, price: entry.price };
}

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

const MarketShop: React.FC = () => {
  const { user } = useAuth();
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isEditSelectionMode, setIsEditSelectionMode] = useState(false);
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

  // ✅ AppHeader handles setPageHeader automatically
  const { pageMeta } = usePageMetadata('admin-market-plan');

  const fetchData = useCallback(async () => {
    try {
      const [libRes, runRes] = await Promise.all([
        supabase.from('ingredients_library').select('*').order('name_en'),
        supabase.from('market_runs').select('*').order('run_date', { ascending: false })
      ]);
      if (libRes.data) setLibrary(libRes.data);
      if (runRes.data) setHistory(runRes.data);
    } catch (err) {
      console.error("Market Console Sync Error:", err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  // Filtered history for the active tab — computed once, used in both table and empty-state check
  const filteredHistory = useMemo<MarketRun[]>(
    () => history.filter(r => r.shopper_role === activeTab),
    [history, activeTab]
  );

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
    if (!user) return alert("You must be logged in to save market reports.");

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
        user_id: user?.id,
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert("Error saving: " + message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 5. LAYOUT PANES ---

  // CENTER PANE
  const renderCenterContent = () => {
    return (
      <div className="flex flex-col h-full w-full">
        {/* CENTER HEADER */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'dashboard' ? 'Overview' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View`}
          </h2>

          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'logistics', label: 'Logistics', icon: Truck },
              { id: 'teacher', label: 'Teacher', icon: GraduationCap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setViewMode('list');
                  setIsEditSelectionMode(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {activeTab === 'dashboard' ? (
            <div className="p-12 space-y-12 animate-in fade-in duration-500">
              {pageMeta && (
                <WelcomeHero
                  badge={pageMeta.badge}
                  titleMain={pageMeta.titleMain}
                  titleHighlight={pageMeta.titleHighlight}
                  description={pageMeta.description}
                  imageUrl={pageMeta.imageUrl}
                  icon={pageMeta.icon}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LOGISTICS CARD */}
                <div className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-500/50 transition-all duration-300">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="size-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-500">
                      <Truck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">Logistics</h3>
                  </div>
                  <div className="space-y-3">
                    <Button variant="primary" size="md" className="w-full" startIcon={<LayoutDashboard className="w-4 h-4" />} onClick={() => { setSelectedDate(new Date()); setActiveTab('logistics'); setViewMode('planner'); setFormState({}); }}>New Plan for Today</Button>
                    <Button variant="outline" size="md" className="w-full" startIcon={<CalendarIcon className="w-4 h-4" />} onClick={() => { setActiveTab('logistics'); setIsCalendarModalOpen(true); }}>New Plan Select Date</Button>
                    <Button variant="outline" size="md" className="w-full border-transparent" startIcon={<History className="w-4 h-4" />} onClick={() => { setActiveTab('logistics'); setViewMode('list'); }}>View History</Button>
                  </div>
                </div>

                {/* TEACHER CARD */}
                <div className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="size-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">Teacher</h3>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="md" startIcon={<Edit className="w-4 h-4" />} onClick={() => { setSelectedDate(new Date()); setActiveTab('teacher'); setViewMode('planner'); setFormState({}); }}>New Report for Today</Button>
                    <Button variant="outline" size="md" className="w-full" startIcon={<CalendarIcon className="w-4 h-4" />} onClick={() => { setActiveTab('teacher'); setIsCalendarModalOpen(true); }}>New Report Select Date</Button>
                    <Button variant="outline" size="md" className="w-full border-transparent" startIcon={<History className="w-4 h-4" />} onClick={() => { setActiveTab('teacher'); setViewMode('list'); }}>View History</Button>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><History className="w-5 h-5" /></div>
                  <h3 className="font-bold text-lg">Report Archives</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    startIcon={isEditSelectionMode ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    onClick={() => setIsEditSelectionMode(!isEditSelectionMode)}
                    className={cn("border-transparent", isEditSelectionMode && "bg-primary-50 text-primary-600 hover:bg-primary-100")}
                  >
                    {isEditSelectionMode ? 'Cancel' : 'Edit Report'}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    startIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsCalendarModalOpen(true)}
                  >
                    New {activeTab === 'teacher' ? 'Report' : 'Plan'}
                  </Button>
                </div>
              </div>

              <div className="p-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase font-black text-xs">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Items</th>
                        <th className="px-6 py-4 text-right">Total Cost</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredHistory.map((row: MarketRun) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedRun(row)}
                          className={cn(
                            "hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
                            selectedRun?.id === row.id && "bg-primary-50 dark:bg-primary-900/10"
                          )}
                        >
                          <td className="px-6 py-4 font-mono font-bold">{row.run_date}</td>
                          <td className="px-6 py-4">
                            <Badge variant="light" color="light" size="sm" className="uppercase border">{row.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-center font-medium">{row.items_snapshot.length}</td>
                          <td className="px-6 py-4 text-right font-mono font-black text-primary-600 dark:text-primary-400">{row.total_cost.toLocaleString()} <span className="text-[10px] text-gray-400">THB</span></td>
                          <td className="px-6 py-4 text-right">
                            {(isEditSelectionMode && selectedRun?.id === row.id) && (
                              <Button size="md" onClick={(e) => { e?.stopPropagation(); hydrateDraft(row); }}>Modify</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistory.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No history found for this category.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
              <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ingredients..."
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 py-3 overflow-x-auto no-scrollbar flex justify-center shrink-0">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  {uniqueShops.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveShopTab(s)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                        activeShopTab === s
                          ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-40">
                  {filteredLibrary.map(item => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      mode={activeTab as 'logistics' | 'teacher'}
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

  // RIGHT PANE (Inspector)
  const rightPane = (
    <div className="h-full flex flex-col">
      <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div>
          <h3 className="font-bold text-lg">Work Draft</h3>
          <p className="text-xs text-gray-500">{viewMode === 'list' ? 'Archive View' : 'Live Editing'}</p>
        </div>
        <button onClick={() => setViewMode('list')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="text-center px-4">
          <span className="text-2xl font-black italic uppercase text-gray-900 dark:text-white tracking-widest leading-none block">
            {formatLongDate(selectedDate)}
          </span>
        </div>

        <div className={cn(
          "p-8 rounded-3xl border text-center transition-all duration-300",
          activeTab === 'teacher'
            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
            : "bg-primary-50 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800"
        )}>
          <span className="text-xs font-black uppercase text-gray-400 tracking-widest block mb-2">
            {activeTab === 'teacher' ? 'Total Expenses' : 'Items Required'}
          </span>
          <span className="font-mono text-3xl font-black text-gray-900 dark:text-white block">
            {viewMode === 'list' && selectedRun
              ? `${selectedRun.total_cost.toLocaleString()} THB`
              : activeTab === 'teacher'
                ? `${Object.values(formState).reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} THB`
                : `${Object.keys(formState).length} Items`
            }
          </span>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Item Checklist</h4>

          <div className="space-y-3 pb-32">
            {(viewMode === 'list' && selectedRun ? selectedRun.items_snapshot : Object.entries(formState)).map((entry) => {
              const item = normalizeEntry(entry as [string, { qty: number; price: number }] | DraftItem, library);

              return (
                <div
                  key={item.id}
                  onClick={() => viewMode === 'planner' && activeTab === 'teacher' && openKeypad(item.id)}
                  className={cn(
                    "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-xl transition-all",
                    (viewMode === 'planner' && activeTab === 'teacher') && "cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  )}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100 uppercase truncate">{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono font-medium">x{item.qty} {item.unit}</div>
                  </div>
                  {(activeTab === 'teacher' || (selectedRun && selectedRun.shopper_role === 'teacher')) && (
                    <div className="text-right">
                      <div className="font-mono font-black text-primary-600 dark:text-primary-400 text-sm">{item.price} <span className="text-[9px] opacity-40">THB</span></div>
                      {viewMode === 'planner' && <span className="text-[8px] uppercase font-bold text-gray-300 block">Tap to edit</span>}
                    </div>
                  )}
                </div>
              );
            })}
            {((viewMode === 'list' && !selectedRun) || (viewMode === 'planner' && Object.keys(formState).length === 0)) && (
              <div className="py-12 text-center opacity-40">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-[10px] font-bold uppercase text-gray-400">No content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab !== 'dashboard' && viewMode === 'planner' && Object.keys(formState).length > 0 && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Button
            variant="primary"
            className="w-full h-14 rounded-2xl shadow-xl shadow-primary-500/30"
            size="md"
            startIcon={<CheckCircle2 className="w-5 h-5" />}
            disabled={isSaving}
            onClick={handleSave}
          >
            {activeTab === 'teacher' ? 'Submit Report' : 'Publish Plan'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <PageContainer className="h-[calc(100vh-64px)]">
      <PageGrid columns={12} className="h-full gap-6 animate-in fade-in duration-500">

        {/* 1. CENTER PANE (Main) - Grid Col 8 (2/3) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {renderCenterContent()}
        </div>

        {/* 2. RIGHT PANE (Inspector) - Grid Col 4 (1/3) */}
        <div className="lg:col-span-4 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {rightPane}
        </div>

        {/* Date Selection Modal */}
        <Modal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          className="max-w-sm p-6"
        >
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Date</h3>
          </div>
          <div className="flex flex-col gap-6">
            <MiniCalendar
              value={selectedDate}
              onChange={(d: Date) => startNewReport(d)}
              className="w-full"
            />
            <Button className="w-full" variant="outline" onClick={() => setIsCalendarModalOpen(false)}>Cancel</Button>
          </div>
        </Modal>

        {/* Numerical Keypad Modal */}
        <Modal isOpen={keypadOpen} onClose={() => setKeypadOpen(false)} className="bg-transparent border-none shadow-none max-w-sm p-0">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-primary-500 text-center shadow-2xl">
              <span className="uppercase font-black text-primary-600 tracking-widest mb-1 block text-xs">Input THB</span>
              <div className="font-mono text-gray-900 dark:text-white text-4xl font-bold flex items-center justify-center gap-2">
                {tempPrice}<span className="text-xl opacity-50">฿</span>
              </div>
            </div>
            <NumericKeypad
              onKeyPress={handleKeypadPress}
              onDelete={handleKeypadDelete}
              onConfirm={handleKeypadConfirm}
            />
          </div>
        </Modal>
      </PageGrid>
    </PageContainer>
  );
};

export default MarketShop;