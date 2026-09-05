import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import Badge from '../ui/badge/Badge';
import { CheckCircle2, PlusCircle } from 'lucide-react';
import { PackStepper } from './PackStepper';
import { describePack, describeQty, packLabel } from './packUtils';
import { displayIngredientName } from './ingredientName';

interface LibraryItem {
  id: string;
  name: string;
  name_th: string;
  image_url: string;
  default_unit: string;
  purchase_pack_size?: number | null;
  purchase_pack_label?: string | null;
}

interface ShopItemCardProps {
  item: LibraryItem;
  price: number;
  isAdded: boolean;
  mode: 'logistics' | 'teacher';
  /** Logistics: number of purchase packs currently in the list (0 = not added). */
  qty?: number;
  /** Logistics: +1 pack (also fired by tapping the card). */
  onIncrement?: () => void;
  /** Logistics: -1 pack (reaching 0 removes the item). */
  onDecrement?: () => void;
  onClick?: () => void;  // Used for teacher price keypad trigger
  isReadOnly?: boolean;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  price,
  isAdded,
  mode,
  qty = 0,
  onIncrement,
  onDecrement,
  onClick
}) => {
  const isLogistics = mode === 'logistics';
  const { t, i18n } = useTranslation('market');

  // Nome monolingua, regola unica in ingredientName.ts (la usano anche la bozza e il Runner).
  const displayName = displayIngredientName(item, i18n.language);

  return (
    <div
      onClick={isLogistics ? onIncrement : onClick}
      className={cn(
        "group relative flex flex-col rounded-[2rem] overflow-hidden border transition-all duration-300 ease-in-out cursor-pointer active:scale-95",
        isAdded
          ? "bg-primary-50 data-[mode=dark]:bg-primary-900/10 border-primary-500 shadow-lg scale-[1.02] z-10"
          : "bg-surface border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
      )}
    >
      {/* IMAGE LAYER — 1:1, full color, white 10% veil that clears on hover */}
      <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <img
          src={item.image_url || 'https://via.placeholder.com/200'}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isAdded && "scale-110"
          )}
          alt={item.name}
        />

        {/* White 10% overlay — fades out on hover */}
        <div className="absolute inset-0 bg-white/10 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />

        {/* CHECKMARK OVERLAY */}
        {isAdded && (
          <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center animate-in zoom-in fade-in duration-300">
            <div className={cn(
              "rounded-full bg-white text-primary-600 flex flex-col items-center justify-center shadow-2xl ring-4 ring-primary-500/20",
              isLogistics ? "size-16 leading-none" : "size-12"
            )}>
              {isLogistics ? (
                <>
                  <span className="font-mono font-black text-2xl tabular-nums">{qty}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{packLabel(item)}</span>
                </>
              ) : <CheckCircle2 className="w-8 h-8" />}
            </div>
          </div>
        )}

        {/* UNIT BADGE */}
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="solid" color="dark" size="sm" className="h-5 px-2 text-xs font-black border-white/20 backdrop-blur-md uppercase tracking-widest shadow-sm">
            {isLogistics ? describePack(item) : (item.default_unit || 'unit')}
          </Badge>
        </div>
      </div>

      {/* INFO LAYER */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-col min-w-0">
          <h6 className={cn(
            "text-base font-black uppercase truncate leading-tight transition-colors",
            isAdded ? "text-primary-600 dark:text-primary-400" : "text-title"
          )}
          >
            {displayName}
          </h6>
        </div>

        {/* PRICE DISPLAY (Teacher Mode) */}
        {!isLogistics && (
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-transparent group-hover:border-primary-200 dark:group-hover:border-primary-700 transition-all">
              <span className="text-xs font-black uppercase text-sub tracking-widest">{t('shopItem.reportedCost')}</span>
              <span className={cn(
                "font-mono font-black text-sm",
                price > 0 ? "text-primary-600 dark:text-primary-400" : "text-muted"
              )}>
                {price || '0'} THB
              </span>
            </div>
          </div>
        )}

        {/* LOGISTICS: pack stepper [-] N [+] + running total in base unit */}
        {isLogistics && (
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
            {/* Row 1: quantity data (packs + base total) */}
            <div className="min-h-5 flex items-center">
              {isAdded ? (
                <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 truncate">{describeQty(qty, item)}</span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-sub opacity-60 group-hover:opacity-100 transition-opacity">
                  <PlusCircle className="w-4 h-4" />{t('shopItem.tapToAdd', { defaultValue: 'Tap to add' })}
                </span>
              )}
            </div>
            {/* Row 2: full-width [-] N [+] */}
            {onIncrement && onDecrement && (
              <PackStepper qty={qty} onIncrement={onIncrement} onDecrement={onDecrement} size="lg" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopItemCard;