import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Modal } from '../../components/ui/modal';
import Button from '../../components/ui/button/Button';
import { ShopItemCard } from '../../components/market/ShopItemCard';
import { ReportLineRow, ReportLineMedia } from '../../components/reports';
import { CategoryHeader } from '../../components/market/CategoryHeader';
import MiniCalendar from '../../components/common/MiniCalendar';
import NumericKeypad from '../../components/common/NumericKeypad';
import { cn } from '@thaiakha/shared/lib/utils';
import {
  Truck, GraduationCap, Calendar as CalendarIcon,
  Edit, X, ShoppingCart, CheckCircle2
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

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
    return { id, name: libItem?.name_en || '', qty: val.qty, unit: libItem?.default_unit || 'unit', price: val.price };
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
  default_unit: string;
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
  status: 'planned' | 'completed' | 'approved' | 'expensed';
  total_cost: number;
}

type TabType = 'dashboard' | 'logistics' | 'teacher';
type ViewMode = 'list' | 'planner';

// --- HELPERS ---
const formatLongDate = (date: Date, language: string) => {
  const localeMap: Record<string, string> = { 'en': 'en-GB', 'th': 'th-TH' };
  const locale = localeMap[language] || 'en-US';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(/^\w/, (c) => c.toUpperCase());
};

const MarketShop: React.FC = () => {
  const { t, i18n } = useTranslation('market');
  const { user } = useAuth();

  // --- ROLE SCOPING ---
  // teacher market = manager + kitchen · logistic market = manager + logistics.
  // Only manager can modify / print / download / make-expense; kitchen & logistics
  // can only create + view their own scope.
  const role = user?.role;
  const canEdit = role === 'manager';
  const allowedScopes = useMemo<Array<'logistics' | 'teacher'>>(() => {
    if (role === 'manager') return ['logistics', 'teacher'];
    if (role === 'kitchen') return ['teacher'];
    if (role === 'logistics') return ['logistics'];
    return [];
  }, [role]);

  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
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
  const [activeShopTab, setActiveShopTab] = useState('All');

  const selectedDateStr = useMemo(() => {
    const offset = selectedDate.getTimezoneOffset() * 60000;
    return new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];
  }, [selectedDate]);

  const activeScope = activeTab === 'dashboard' ? null : activeTab;

  // ✅ AppHeader handles setPageHeader automatically
  usePageMetadata('admin-market-plan'); // sets the page header via AppHeader (no banner here)

  const fetchData = useCallback(async () => {
    try {
      const [libRes, runRes] = await Promise.all([
        supabase.from('ingredients_library').select('*, cover:media_assets!image_asset_id(image_url)').order('name_en'),
        supabase.from('market_runs').select('*').order('run_date', { ascending: false })
      ]);
      // Resolve image from image_asset_id → media_assets; keep the image_url alias
      // so cards keep working after the legacy image_url column is dropped.
      if (libRes.data) setLibrary(libRes.data.map(item => {
        const cover = (item as Record<string, unknown>).cover as { image_url?: string } | null;
        return { ...item, image_url: cover?.image_url ?? null };
      }) as unknown as LibraryItem[]);
      if (runRes.data) setHistory(runRes.data as unknown as MarketRun[]);
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
  };

  const startNewReport = (date: Date) => {
    setSelectedDate(date);
    setFormState({});
    setSelectedRun(null);
    setViewMode('planner');
    setIsCalendarModalOpen(false);
  };

  // Logistics shops Monday & Thursday morning only. No date picker: the target is
  // today if today is a shopping day, otherwise the next Mon/Thu.
  const toISODate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  // Shop days = Monday (1) and Thursday (4). The next shop day is today if today is
  // a shop day, otherwise the nearest upcoming one. A day whose logistic list is
  // already CONFIRMED/locked (approved/completed/expensed) is "done" → roll forward
  // to the next shop day (so confirming Thu's list and starting again targets Mon).
  const LOGISTIC_LOCKED = new Set(['approved', 'completed', 'expensed']);
  const nextShopDayAfter = (d: Date): Date => {
    const dow = d.getDay();
    const diff = Math.min(...[1, 4].map(tt => ((tt - dow + 7) % 7) || 7));
    const n = new Date(d); n.setDate(d.getDate() + diff); return n;
  };
  const nextLogisticShopDate = (): Date => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    let candidate = (dow === 1 || dow === 4) ? new Date(today) : nextShopDayAfter(today);
    for (let i = 0; i < 8; i++) {
      const run = history.find(r => r.shopper_role === 'logistics' && r.run_date === toISODate(candidate));
      if (!run || !LOGISTIC_LOCKED.has(run.status)) break; // available (free or editable draft)
      candidate = nextShopDayAfter(candidate); // this day is locked → try the next shop day
    }
    return candidate;
  };
  // Open the SHARED logistic list for the next shop day: load the existing run
  // (created by logistics OR manager) so its items are visible & editable, never
  // overwritten. If none exists yet, start a fresh draft for that date.
  const openLogisticList = () => {
    const target = nextLogisticShopDate();
    const targetISO = toISODate(target);
    const existing = history.find(r => r.shopper_role === 'logistics' && r.run_date === targetISO);
    if (existing) { hydrateDraft(existing); return; }
    setSelectedDate(target);
    setFormState({});
    setSelectedRun(null);
    setActiveTab('logistics');
    setViewMode('planner');
  };

  // --- Launch from the Reports page (sessionStorage): open the planner directly ---
  const [pendingEdit, setPendingEdit] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('market_launch');
      if (!raw) return;
      sessionStorage.removeItem('market_launch');
      const launch = JSON.parse(raw) as { action?: string; date?: string; run_id?: string };
      const launchScope: TabType = user?.role === 'kitchen' ? 'teacher' : 'logistics';
      if (launch.action === 'new') {
        setSelectedDate(launch.date ? new Date(launch.date) : new Date());
        setFormState({});
        setSelectedRun(null);
        setActiveTab(launchScope);
        setViewMode('planner');
      } else if (launch.action === 'edit' && launch.run_id) {
        setActiveTab(launchScope);
        setPendingEdit(launch.run_id);
      }
    } catch { /* ignore malformed launch payload */ }
  }, []);
  // Hydrate the requested run once the history has loaded.
  useEffect(() => {
    if (!pendingEdit) return;
    const run = history.find(r => r.id === pendingEdit);
    if (run) { hydrateDraft(run); setPendingEdit(null); }
  }, [pendingEdit, history]);

  // Report PDF generation (print/download) lives in the Manager Reports hub now.

  // --- 3. FILTERING LOGIC ---
  const filteredLibrary = useMemo(() => {
    if (!activeScope) return [];
    return library.filter(item => {
      const matchScope = activeScope === 'teacher' ? item.is_teacher_item : item.is_logistics_item;
      if (!matchScope) return false;

      const itemShop = (activeScope === 'teacher' ? item.teacher_shop : item.logistics_shop) || 'General';
      const matchShop = activeShopTab === 'All' || itemShop === activeShopTab;
      return matchShop;
    });
  }, [library, activeScope, activeShopTab]);

  // Shop/category display order: "Teacher Shop" first, "Extra Expenses" last (catch-all expenses bucket), rest alphabetical.
  const shopRank = (s: string) => (s === 'Extra Expenses' ? 2 : s === 'Teacher Shop' ? 0 : 1);
  const compareShops = (a: string, b: string) => shopRank(a) - shopRank(b) || a.localeCompare(b);

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
    return ['All', ...Array.from(shops).sort(compareShops)];
  }, [library, activeScope]);

  // Grouped library for the "All" view: ingredients split by shop/category so the
  // creator can scan them per section (divider + title) instead of one flat list.
  const groupedLibrary = useMemo(() => {
    if (!activeScope) return [];
    const groups = new Map<string, LibraryItem[]>();
    for (const item of filteredLibrary) {
      const shop = (activeScope === 'teacher' ? item.teacher_shop : item.logistics_shop) || 'General';
      if (!groups.has(shop)) groups.set(shop, []);
      groups.get(shop)!.push(item);
    }
    return Array.from(groups.entries())
      .sort((a, b) => compareShops(a[0], b[0]))
      .map(([shop, items]) => ({ shop, items }));
  }, [filteredLibrary, activeScope]);

  // Reset the shop/category tab to "All" whenever the scope (teacher/logistics) changes,
  // otherwise a stale shop name from the other scope filters the list down to empty.
  useEffect(() => { setActiveShopTab('All'); }, [activeTab]);

  // --- 4. WORKSPACE ACTIONS ---
  const handleToggleItem = (itemId: string) => {
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

  const handleSave = async (confirm = false) => {
    if (!activeScope) return;
    if (!user) return alert(t('messages.mustBeLoggedIn'));
    // Edit permissions: manager edits anything; logistics may edit only its own
    // logistic run while still a draft (status !== 'approved'). Teacher/kitchen reports
    // and already-approved runs are manager-only.
    if (selectedRun) {
      const isLogisticDraft = selectedRun.shopper_role === 'logistics' && selectedRun.status !== 'approved';
      const canModifyThis = canEdit || (role === 'logistics' && isLogisticDraft);
      if (!canModifyThis) return;
    }

    const itemsToSave = Object.entries(formState)
      .map(([id, val]) => {
        const item = library.find(l => l.id === id);
        return {
          id,
          name: item?.name_en || 'Unknown',
          unit: item?.default_unit || 'unit',
          quantity: val.qty,
          price: val.price,
          target_shop: (activeScope === 'teacher' ? item?.teacher_shop : item?.logistics_shop) || 'General'
        };
      });

    if (itemsToSave.length === 0) return alert(t('messages.selectAtLeastOne'));

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      // Teacher reports are approved on submit. Logistic reports stay 'planned'
      // (editable draft) until explicitly confirmed → 'approved' (then manager-only).
      const status = activeScope === 'teacher' ? 'approved' : (confirm ? 'approved' : 'planned');
      const payload: Record<string, unknown> = {
        run_date: selectedDateStr,
        shopper_role: activeScope,
        items_snapshot: itemsToSave,
        status,
        // No quantity model: each line is a total price; total = sum of prices.
        total_cost: itemsToSave.reduce((acc, i) => acc + i.price, 0),
        updated_at: nowIso,
        // Stamp approver only when the run becomes approved.
        ...(status === 'approved' ? { approved_by: user.id, approved_at: nowIso } : {}),
      };
      if (!selectedRun) payload.created_by = user.id;

      const { data: savedRun, error } = await supabase.from('market_runs').upsert(payload as never, {
        onConflict: 'run_date, shopper_role'
      }).select('id').single();

      if (error) throw error;

      // Email di conferma spese mercato (Kitchen/Logistics) — solo quando il report
      // è approvato (teacher submit o logistic confirm), mai su bozze 'planned'. Non-blocking.
      if (savedRun?.id && status === 'approved') {
        try {
          await supabase.functions.invoke('send-market-confirmation', {
            body: { run_id: savedRun.id },
          });
        } catch (mailErr) {
          console.error('Market confirmation email failed (non-blocking):', mailErr);
        }
      }

      alert(t('messages.saveSuccess'));
      fetchData();
      setActiveTab('dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(t('messages.saveError', { message }));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a report — manager only (teacher & confirmed-logistic reports included).
  // --- 5. LAYOUT PANES ---

  const renderItemCard = (item: LibraryItem) => (
    <ShopItemCard
      key={item.id}
      item={item}
      mode={activeTab as 'logistics' | 'teacher'}
      price={formState[item.id]?.price || 0}
      isAdded={!!formState[item.id]}
      onToggle={() => handleToggleItem(item.id)}
      onClick={() => openKeypad(item.id)}
    />
  );

  // CENTER PANE
  const renderCenterContent = () => {
    return (
      <div className="flex flex-col h-full w-full">
        {/* CENTER HEADER */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'dashboard' ? t('tabs.overview') : `${t(`tabs.${activeTab}`)} View`}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {activeTab === 'dashboard' ? (
            <div className="p-12 space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto">
                {/* LOGISTICS CARD */}
                {allowedScopes.includes('logistics') && (
                <div className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-500/50 transition-all duration-300">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="size-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-500">
                      <Truck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">{t('tabs.logistics')}</h3>
                  </div>
                  {/* One shared list per shop day (Mon/Thu): edit it if it exists, otherwise create it. */}
                  {(() => {
                    const targetDate = nextLogisticShopDate();
                    const existing = history.find(r => r.shopper_role === 'logistics' && r.run_date === toISODate(targetDate)) || null;
                    return (
                      <div className="space-y-3">
                        <div className="text-center pb-1">
                          <span className="block text-xs font-black uppercase tracking-widest text-gray-400">{t('labels.nextShopDay', { defaultValue: 'Next shopping day' })}</span>
                          <span className="block text-lg font-bold text-gray-900 dark:text-white">{formatLongDate(targetDate, i18n.language)}</span>
                        </div>
                        <Button variant="primary" size="md" className="w-full" startIcon={existing ? <Edit className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />} onClick={openLogisticList}>
                          {existing
                            ? t('buttons.editShopList', { defaultValue: 'Edit shopping list' })
                            : t('buttons.createShopList', { defaultValue: 'Create shopping list' })}
                        </Button>
                      </div>
                    );
                  })()}
                </div>

                )}

                {/* TEACHER CARD */}
                {allowedScopes.includes('teacher') && (
                <div className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="size-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">{t('tabs.teacher')}</h3>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="md" startIcon={<Edit className="w-4 h-4" />} onClick={() => { setSelectedDate(new Date()); setActiveTab('teacher'); setViewMode('planner'); setFormState({}); }}>{t('buttons.newReportToday')}</Button>
                    {/* Manager-only: create a kitchen/teacher expense on a chosen date (the teacher itself can only report today). */}
                    {canEdit && (
                      <Button variant="outline" size="md" className="w-full" startIcon={<CalendarIcon className="w-4 h-4" />} onClick={() => { setActiveTab('teacher'); setIsCalendarModalOpen(true); }}>{t('buttons.newReportSelectDate')}</Button>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
              {/* Category filter tabs — logistics only; teacher/kitchen shows the full grouped list. */}
              {activeScope !== 'teacher' && (
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
              )}

              <div className="flex-1 p-6 bg-gray-50/50 dark:bg-gray-900/50">
                {filteredLibrary.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{t('empty.noIngredients', { defaultValue: 'No ingredients match your search.' })}</p>
                  </div>
                ) : activeShopTab === 'All' ? (
                  // Grouped by shop/category: divider + title per section for easy scanning.
                  <div className="pb-40 space-y-14">
                    {groupedLibrary.map(group => (
                      <section key={group.shop}>
                        <CategoryHeader title={group.shop} count={group.items.length} />
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                          {group.items.map(renderItemCard)}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-40">
                    {filteredLibrary.map(renderItemCard)}
                  </div>
                )}
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
          <h3 className="font-bold text-lg">{t('labels.workDraft')}</h3>
        </div>
        <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="text-center px-4">
          <span className="text-2xl font-black italic uppercase text-gray-900 dark:text-white tracking-widest leading-none block">
            {formatLongDate(selectedDate, i18n.language)}
          </span>
        </div>

        <div className={cn(
          "p-8 rounded-3xl border text-center transition-all duration-300",
          activeTab === 'teacher'
            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
            : "bg-primary-50 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800"
        )}>
          <span className="text-xs font-black uppercase text-gray-400 tracking-widest block mb-2">
            {activeTab === 'teacher' ? t('labels.totalExpenses') : t('labels.itemsRequired')}
          </span>
          <span className="font-mono text-3xl font-black text-gray-900 dark:text-white block">
            {activeTab === 'teacher'
              ? `${Object.values(formState).reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} THB`
              : `${Object.keys(formState).length} Items`
            }
          </span>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="space-y-3 pb-32">
            {Object.entries(formState).map((entry) => {
              const item = normalizeEntry(entry as [string, { qty: number; price: number }] | DraftItem, library);

              return (
                <ReportLineRow
                  key={item.id}
                  density="sm"
                  leading={<ReportLineMedia tone="primary" badge={item.qty} />}
                  title={item.name}
                  subtitle={item.unit || undefined}
                  amount={activeTab === 'teacher' ? item.price.toLocaleString() : undefined}
                  amountSuffix="THB"
                  onEdit={activeTab === 'teacher' ? () => openKeypad(item.id) : undefined}
                  onDelete={() => handleToggleItem(item.id)}
                  confirmDelete={{
                    title: t('draft.removeTitle', { defaultValue: 'Remove item?' }),
                    message: t('draft.removeMsg', { defaultValue: 'Remove "{{name}}" from the list?', name: item.name }),
                    confirmLabel: t('buttons.remove', { defaultValue: 'Remove' }),
                  }}
                />
              );
            })}
            {Object.keys(formState).length === 0 && (
              <div className="py-12 text-center opacity-40">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-xs font-bold uppercase text-gray-400">{t('empty.noContent')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab !== 'dashboard' && viewMode === 'planner' && Object.keys(formState).length > 0 && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          {activeTab === 'teacher' ? (
            <Button
              variant="primary"
              className="w-full h-14 rounded-2xl shadow-xl shadow-primary-500/30"
              size="md"
              startIcon={<CheckCircle2 className="w-5 h-5" />}
              disabled={isSaving}
              onClick={() => handleSave(false)}
            >
              {t('buttons.submitReport')}
            </Button>
          ) : (
            // Logistic: save as editable draft (planned) OR confirm (approved → locked).
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl"
                size="md"
                disabled={isSaving}
                onClick={() => handleSave(false)}
              >
                {t('buttons.saveDraft', { defaultValue: 'Save draft' })}
              </Button>
              <Button
                variant="primary"
                className="w-full h-14 rounded-2xl shadow-xl shadow-primary-500/30"
                size="md"
                startIcon={<CheckCircle2 className="w-5 h-5" />}
                disabled={isSaving}
                onClick={() => handleSave(true)}
              >
                {t('buttons.confirmReport', { defaultValue: 'Confirm report' })}
              </Button>
            </div>
          )}
        </div>
      )}

    </div>
  );

  return (
    <PageContainer className="h-[calc(100vh-64px)]">
      <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">

        {/* CENTER PANE — takes the remaining width */}
        <div className="flex-1 min-w-0 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {renderCenterContent()}
        </div>

        {/* RIGHT PANE — tablet (lg) −10%, desktop (xl) −20% vs the old 1/3 */}
        <div className="lg:shrink-0 lg:basis-[30%] xl:basis-[26.5%] flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          {rightPane}
        </div>
      </div>

        {/* Date Selection Modal */}
        <Modal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          className="max-w-sm p-6"
        >
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('modal.selectDate')}</h3>
          </div>
          <div className="flex flex-col gap-6">
            <MiniCalendar
              value={selectedDate}
              onChange={(d: Date) => startNewReport(d)}
              className="w-full"
            />
            <Button className="w-full" variant="outline" onClick={() => setIsCalendarModalOpen(false)}>{t('buttons.cancel')}</Button>
          </div>
        </Modal>

        {/* Numerical Keypad Modal */}
        <Modal isOpen={keypadOpen} onClose={() => setKeypadOpen(false)} className="bg-transparent border-none shadow-none max-w-sm p-0">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-primary-500 text-center shadow-2xl">
              <span className="uppercase font-black text-primary-600 tracking-widest mb-1 block text-xs">{t('labels.inputThb')}</span>
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
    </PageContainer>
  );
};

export default MarketShop;