import React from 'react';
import { cn } from '../../lib/utils';
import { Typography, Badge, Tooltip, Icon } from '../ui/index';

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
  onClick,
  isReadOnly = false
}) => {
  const isLogistics = mode === 'logistics';

  return (
    <div 
      onClick={isLogistics ? onToggle : onClick}
      className={cn(
        "group relative flex flex-col rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ease-cinematic isolate",
        "cursor-pointer active:scale-95",
        isAdded 
          ? "bg-action/10 border-action shadow-[0_20px_50px_-10px_rgba(152,201,60,0.3)] scale-[1.02] z-10" 
          : "bg-surface border-border hover:border-action/30"
      )}
    >
      {/* IMAGE LAYER */}
      <div className="relative h-36 w-full bg-black/5 overflow-hidden border-b border-border/50">
        <img 
          src={item.image_url || 'https://via.placeholder.com/200'} 
          className={cn(
            "w-full h-full object-cover transition-all duration-[2s]",
            isAdded ? "opacity-100 scale-110 grayscale-0" : "opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110"
          )}
          alt={item.name_en} 
        />
        
        {/* CHECKMARK OVERLAY */}
        {isAdded && (
          <div className="absolute inset-0 bg-action/20 flex items-center justify-center animate-in zoom-in fade-in duration-300">
             <div className="size-12 rounded-full bg-white text-action flex items-center justify-center shadow-2xl ring-4 ring-action/20">
                <Icon name="check_circle" size="md" className="font-black" />
             </div>
          </div>
        )}

        {/* UNIT BADGE */}
        <div className="absolute top-3 left-3 z-20">
           <Badge variant="mineral" className="h-5 px-2 text-[9px] font-black border-white/20 bg-black/40 text-white backdrop-blur-md uppercase tracking-widest">
              {item.unit_default || 'unit'}
           </Badge>
        </div>
      </div>

      {/* INFO LAYER */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-col min-w-0">
          <Typography 
            variant="h6" 
            className={cn(
              "text-xs font-black uppercase truncate leading-tight transition-colors",
              isAdded ? "text-action" : "text-title"
            )}
          >
            {item.name_en}
          </Typography>
          <Typography variant="caption" className="text-[10px] opacity-40 truncate">{item.name_th}</Typography>
        </div>

        {/* PRICE DISPLAY (Teacher Mode) */}
        {!isLogistics && (
          <div className="mt-auto pt-3 border-t border-border/30">
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-transparent group-hover:border-action/20 transition-all">
                <span className="text-[8px] font-black uppercase text-desc/40 tracking-widest">Reported Cost</span>
                <span className={cn(
                  "font-mono font-black text-sm",
                  price > 0 ? "text-action" : "text-desc/20"
                )}>
                  {price || '0'} THB
                </span>
            </div>
          </div>
        )}
        
        {/* LOGISTICS HINT */}
        {isLogistics && (
            <div className="mt-auto flex items-center gap-1.5 opacity-20 group-hover:opacity-60 transition-opacity">
                <Icon name={isAdded ? "check" : "add_circle"} size="xs" />
                <span className="text-[9px] font-black uppercase tracking-widest">{isAdded ? 'Added to list' : 'Click to add'}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ShopItemCard;