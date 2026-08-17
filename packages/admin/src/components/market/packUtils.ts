/**
 * Purchase pack model (market planner, logistics stream).
 * Every logistics ingredient is bought in whole packs: the planner counts PACKS,
 * `purchase_pack_size` is the content of ONE pack expressed in `default_unit`.
 *   eggs   → pack_size 30, label 'box',   unit 'pcs'  → "2 box (60 pcs)"
 *   pumpkin→ pack_size 5,  label 'pack',  unit 'kg'   → "2 pack (10 kg)"
 *   chicken→ pack_size 1,  label 'kg',    unit 'kg'   → "3 kg"
 */
export interface PackSpec {
  purchase_pack_size?: number | null;
  purchase_pack_label?: string | null;
  default_unit?: string | null;
}

export const packSize = (p: PackSpec): number => {
  const n = Number(p.purchase_pack_size);
  return Number.isFinite(n) && n > 0 ? n : 1;
};
export const packLabel = (p: PackSpec): string => p.purchase_pack_label || p.default_unit || 'unit';
export const baseUnit = (p: PackSpec): string => p.default_unit || 'unit';

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));

/** What ONE click adds (card badge): "1 kg" · "pack 500 g" · "box 30 pcs" - never the bare unit. */
export const describePack = (p: PackSpec): string => {
  const size = packSize(p);
  const label = packLabel(p);
  const unit = baseUnit(p);
  if (label === unit) return `${fmt(size)} ${unit}`;
  return `${label} ${fmt(size)} ${unit}`;
};

/** "3 kg" · "2 box (60 pcs)" · "2 pack (10 kg)" - a quantity of packs with its base total. */
export const describeQty = (qty: number, p: PackSpec): string => {
  const size = packSize(p);
  const label = packLabel(p);
  const unit = baseUnit(p);
  if (size === 1 && label === unit) return `${fmt(qty)} ${unit}`;
  return `${fmt(qty)} ${label} (${fmt(qty * size)} ${unit})`;
};
