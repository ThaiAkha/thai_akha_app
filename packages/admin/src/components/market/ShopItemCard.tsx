import React from 'react';
import { cn } from '../../lib/utils';
import Badge from '../ui/badge/Badge';
import { Check, CheckCircle2, PlusCircle } from 'lucide-react';

interface LibraryItem {
  id: string;
  name_en: string;
  name_th: string;
  image_url: string;
  unit_default: string;
}

interface ShopItemCardProps {
  item: LibraryItem;
  price: number;
  isAdded: boolean;
  mode: 'logistics' | 'teacher';
  onToggle?: () => void; // Used for logistics selection
  onClick?: () => void;  // Used for teacher price keypad trigger
  isReadOnly?: boolean;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  price,
  isAdded,
  mode,
  onToggle,
  onClick
}) => {
  const isLogistics = mode === 'logistics';

  return (
    <div
      onClick={isLogistics ? onToggle : onClick}
      className={cn(
        "group relative flex flex-col rounded-[2rem] overflow-hidden border transition-all duration-300 ease-in-out cursor-pointer active:scale-95",
        isAdded
          ? "bg-brand-50 data-[mode=dark]:bg-brand-900/10 border-brand-500 shadow-lg scale-[1.02] z-10"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
      )}
    >
      {/* IMAGE LAYER */}
      <div className="relative h-36 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <img
          src={item.image_url || 'https://via.placeholder.com/200'}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isAdded ? "opacity-100 scale-110 grayscale-0" : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110"
          )}
          alt={item.name_en}
        />

        {/* CHECKMARK OVERLAY */}
        {isAdded && (
          <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center animate-in zoom-in fade-in duration-300">
            <div className="size-12 rounded-full bg-white text-brand-600 flex items-center justify-center shadow-2xl ring-4 ring-brand-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
        )}

        {/* UNIT BADGE */}
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="solid" color="dark" size="sm" className="h-5 px-2 text-[9px] font-black border-white/20 backdrop-blur-md uppercase tracking-widest shadow-sm">
            {item.unit_default || 'unit'}
          </Badge>
        </div>
      </div>

      {/* INFO LAYER */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-col min-w-0">
          <h6 className={cn(
            "text-xs font-black uppercase truncate leading-tight transition-colors mb-1",
            isAdded ? "text-brand-600 dark:text-brand-400" : "text-gray-900 dark:text-white"
          )}
          >
            {item.name_en}
          </h6>
          <span className="text-[10px] text-gray-400 truncate font-medium">{item.name_th}</span>
        </div>

        {/* PRICE DISPLAY (Teacher Mode) */}
        {!isLogistics && (
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl border border-transparent group-hover:border-brand-200 dark:group-hover:border-brand-700 transition-all">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Reported Cost</span>
              <span className={cn(
                "font-mono font-black text-sm",
                price > 0 ? "text-brand-600 dark:text-brand-400" : "text-gray-300 dark:text-gray-600"
              )}>
                {price || '0'} THB
              </span>
            </div>
          </div>
        )}

        {/* LOGISTICS HINT */}
        {isLogistics && (
          <div className="mt-auto flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity text-brand-600 dark:text-brand-400">
            {isAdded ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            <span className="text-[9px] font-black uppercase tracking-widest">{isAdded ? 'Added to list' : 'Click to add'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopItemCard;