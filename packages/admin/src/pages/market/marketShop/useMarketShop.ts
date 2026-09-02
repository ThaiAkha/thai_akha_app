/**
 * Market Shop - stato, dati e azioni del planner (ruoli/scope, libreria + storico run,
 * bozza per data, keypad prezzi, salva/conferma, lancio da Reports).
 * Estratto da MarketShop.tsx (#16 split monstre) a comportamento invariato: la UI e' nei
 * componenti MarketShop*.tsx della stessa cartella, che ricevono questo oggetto.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { packSize, baseUnit, packLabel } from '../../../components/market/packUtils';
import {
  toISODate, compareShops,
  type LibraryItem, type MarketRun, type TabType, type ViewMode,
} from './types';

/**
 * Giorni di spesa logistics, in numerazione JS (0 = domenica): **1 = lunedi', 5 = venerdi'**.
 * Fonte UNICA: chi cambia il calendario tocca questa riga e nient'altro nel codice.
 * Cambiato il 2026-08-28 da lunedi'+giovedi' a lunedi'+venerdi' (decisione owner).
 *
 * ⚠️ La stessa informazione compare anche in `home_cards_translations` (card 26, EN):
 * il testo che il logistics legge nell'app. Se un giorno riappare li' un nome di giorno,
 * torna a essere una seconda fonte che diverge in silenzio.
 */
const LOGISTIC_SHOP_DAYS: readonly number[] = [1, 5];

export function useMarketShop() {
  const { t } = useTranslation('market');
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
  const [workerId, setWorkerId] = useState<string | null>(null);
  // #106: giorno in cui i soldi escono davvero. null = segue il giorno pianificato
  // (selectedDateStr); si valorizza solo se chi conferma la cambia a mano.
  const [spentOn, setSpentOn] = useState<string | null>(null);

  const selectedDateStr = useMemo(() => {
    const offset = selectedDate.getTimezoneOffset() * 60000;
    return new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];
  }, [selectedDate]);

  const activeScope = activeTab === 'dashboard' ? null : activeTab;

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
    setWorkerId(run.worker_id ?? null);
    setSelectedDate(new Date(run.run_date));
    // spent_on personalizzato solo se diverge dal pianificato (altrimenti segue la data).
    setSpentOn(run.spent_on && run.spent_on !== run.run_date ? run.spent_on : null);
    setActiveTab(run.shopper_role);
    setViewMode('planner');
  };

  const startNewReport = (date: Date) => {
    setSelectedDate(date);
    setFormState({});
    setSelectedRun(null);
    setWorkerId(null);
    setSpentOn(null);
    setViewMode('planner');
    setIsCalendarModalOpen(false);
  };

  // I giorni di spesa logistics vivono QUI e in nessun altro posto (LOGISTIC_SHOP_DAYS,
  // in cima al file). Prima erano scritti sei volte fra commenti e codice: il 2026-08-28,
  // spostando il giro dal giovedi al venerdi, ne sarebbero rimasti indietro cinque.
  // Non c'e' date picker: la lista punta a oggi se oggi e' un giorno di spesa, altrimenti
  // al prossimo. Un giorno gia' CONFERMATO (approved/completed/expensed) e' "fatto" e si
  // rotola al successivo.
  //
  // ⚠️ Conseguenza da conoscere: `run_date` e' il giorno PIANIFICATO, non il giorno in cui
  // i soldi sono usciti. Chi fa la spesa fuori calendario se la vede registrata sul
  // prossimo giorno utile - e' cosi' che il 28/08 una spesa da 2.146 THB e' finita sul 31.
  const LOGISTIC_LOCKED = new Set(['approved', 'completed', 'expensed']);
  const nextShopDayAfter = (d: Date): Date => {
    const dow = d.getDay();
    const diff = Math.min(...LOGISTIC_SHOP_DAYS.map(tt => ((tt - dow + 7) % 7) || 7));
    const n = new Date(d); n.setDate(d.getDate() + diff); return n;
  };
  const nextLogisticShopDate = (): Date => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    let candidate = LOGISTIC_SHOP_DAYS.includes(dow) ? new Date(today) : nextShopDayAfter(today);
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
    setWorkerId(null);
    setSpentOn(null);
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
        setWorkerId(null);
        setSpentOn(null);
        setActiveTab(launchScope);
        setViewMode('planner');
      } else if (launch.action === 'edit' && launch.run_id) {
        setActiveTab(launchScope);
        setPendingEdit(launch.run_id);
      }
    } catch { /* ignore malformed launch payload */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot al mount: consuma sessionStorage una sola volta
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

  // Logistics: qty counts purchase PACKS (ingredients_library.purchase_pack_size).
  // +1 adds a pack (first tap adds the item), reaching 0 removes the item.
  const handleAdjustQty = (itemId: string, delta: number) => {
    setFormState(prev => {
      const cur = prev[itemId];
      const next = (cur?.qty ?? 0) + delta;
      const newState = { ...prev };
      if (next <= 0) delete newState[itemId];
      else newState[itemId] = { qty: next, price: cur?.price ?? 0 };
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
          // Logistics: quantity = packs, unit = pack label; pack_size/base_unit let
          // reports & COGS reconstruct the real amount (qty × pack_size base_unit).
          unit: item ? packLabel(item) : 'unit',
          quantity: val.qty,
          price: val.price,
          target_shop: (activeScope === 'teacher' ? item?.teacher_shop : item?.logistics_shop) || 'General',
          pack_size: item ? packSize(item) : 1,
          base_unit: item ? baseUnit(item) : 'unit',
        };
      });

    if (itemsToSave.length === 0) return alert(t('messages.selectAtLeastOne'));
    if (!workerId) return alert(t('messages.selectWorker', { defaultValue: 'Please select who is doing the shopping.' }));

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      // Teacher reports are approved on submit. Logistic reports stay 'planned'
      // (editable draft) until explicitly confirmed → 'approved' (then manager-only).
      const status = activeScope === 'teacher' ? 'approved' : (confirm ? 'approved' : 'planned');
      const payload: Record<string, unknown> = {
        run_date: selectedDateStr,
        // #106: giorno reale della spesa; default = giorno pianificato.
        spent_on: spentOn ?? selectedDateStr,
        shopper_role: activeScope,
        items_snapshot: itemsToSave,
        status,
        worker_id: workerId, // the PERSON (authors), never the login
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

  return {
    // contesto
    user, role, canEdit, allowedScopes,
    // stato
    activeTab, setActiveTab, viewMode, setViewMode, selectedDate, setSelectedDate,
    isCalendarModalOpen, setIsCalendarModalOpen, isSaving,
    library, history, selectedRun,
    keypadOpen, setKeypadOpen, keypadItemId, tempPrice,
    formState, setFormState, activeShopTab, setActiveShopTab, workerId, setWorkerId,
    spentOn, setSpentOn,
    selectedDateStr, activeScope,
    // derivati
    filteredLibrary, uniqueShops, groupedLibrary,
    // azioni
    hydrateDraft, startNewReport, nextLogisticShopDate, openLogisticList,
    handleToggleItem, handleAdjustQty, openKeypad, handleKeypadPress, handleKeypadDelete, handleKeypadConfirm, handleSave,
  };
}

export type MarketShopState = ReturnType<typeof useMarketShop>;
