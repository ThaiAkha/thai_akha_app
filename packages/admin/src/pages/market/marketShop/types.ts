/**
 * Market Shop - tipi e helper puri (libreria ingredienti, run, bozza, formattazione).
 * Estratti da MarketShop.tsx (#16 split monstre) a comportamento invariato.
 */
import { packSize, baseUnit, packLabel } from '../../../components/market/packUtils';
import { displayIngredientName } from '../../../components/market/ingredientName';
import type { WorkerRole } from '@thaiakha/shared/types/workers.types';

// "Who are you?" filters by the FUNCTION of the flow, never by login:
// teacher market → teachers · logistics market → logistics + setup hands.
export const WORKER_ROLES_BY_SCOPE: Record<'logistics' | 'teacher', readonly WorkerRole[]> = {
  teacher: ['teacher'],
  logistics: ['logistics', 'setup'],
};

// --- TYPES ---
export interface ChecklistDisplayItem {
  id: string;
  name: string;
  qty: number;      // number of purchase packs
  unit: string;     // pack label (kg | box | pack | crate ...)
  price: number;
  pack_size: number; // content of one pack, in base_unit
  base_unit: string;
}

// Normalizes both formState entries [id, {qty,price}] and DraftItem snapshots
// to a common display shape, resolving names/units from the library where needed.
// `lang` = lingua UI: il nome mostrato segue la stessa regola della card del picker
// (ingredientName.ts), altrimenti la stessa riga si legge thai a sinistra e inglese a
// destra nella stessa schermata. Il thai arriva SEMPRE dalla libreria per `id`: lo
// snapshot resta inglese e congelato, e in inglese l'uscita e' identica a prima.
export function normalizeEntry(
  entry: [string, { qty: number; price: number }] | DraftItem,
  lib: LibraryItem[],
  lang?: string
): ChecklistDisplayItem {
  if (Array.isArray(entry)) {
    const [id, val] = entry;
    const libItem = lib.find(l => l.id === id);
    return {
      id, name: displayIngredientName(libItem ?? {}, lang), qty: val.qty, price: val.price,
      unit: libItem ? packLabel(libItem) : 'unit',
      pack_size: libItem ? packSize(libItem) : 1,
      base_unit: libItem ? baseUnit(libItem) : 'unit',
    };
  }
  return {
    id: entry.id,
    name: displayIngredientName({ name: entry.name, name_th: lib.find(l => l.id === entry.id)?.name_th }, lang),
    qty: entry.quantity, unit: entry.unit, price: entry.price,
    pack_size: entry.pack_size ?? 1, base_unit: entry.base_unit ?? entry.unit,
  };
}

export interface LibraryItem {
  id: string;
  name: string;
  name_th: string;
  image_url: string;
  is_logistics_item: boolean;
  is_teacher_item: boolean;
  purchase_group: string;
  logistics_shop: string;
  teacher_shop: string;
  default_unit: string;
  purchase_pack_size: number | null;
  purchase_pack_label: string | null;
}

export interface DraftItem {
  id: string;
  name: string;
  unit: string;       // pack label
  quantity: number;   // number of packs
  price: number;
  target_shop: string;
  pack_size?: number; // content of one pack, in base_unit (absent on legacy snapshots = 1)
  base_unit?: string;
}

export interface MarketRun {
  id: string;
  run_date: string;
  /** Giorno in cui i soldi sono usciti davvero (#106). Default = run_date. */
  spent_on: string | null;
  shopper_role: 'logistics' | 'teacher';
  items_snapshot: DraftItem[];
  status: 'planned' | 'completed' | 'approved' | 'expensed';
  total_cost: number;
  worker_id: string | null; // authors.id - WHO did the shopping (created_by = login audit)
}

export type TabType = 'dashboard' | 'logistics' | 'teacher';
export type ViewMode = 'list' | 'planner';

// --- HELPERS ---
export const formatLongDate = (date: Date, language: string) => {
  const localeMap: Record<string, string> = { 'en': 'en-GB', 'th': 'th-TH' };
  const locale = localeMap[language] || 'en-US';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(/^\w/, (c) => c.toUpperCase());
};


export const toISODate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

// Shop/category display order: "Teacher Shop" first, "Extra Expenses" last (catch-all expenses bucket), rest alphabetical.
export const shopRank = (s: string) => (s === 'Extra Expenses' ? 2 : s === 'Teacher Shop' ? 0 : 1);
export const compareShops = (a: string, b: string) => shopRank(a) - shopRank(b) || a.localeCompare(b);
