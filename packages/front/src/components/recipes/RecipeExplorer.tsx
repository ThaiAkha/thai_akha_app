import React from 'react';
import { Typography, Badge, MediaImage } from '../ui/index';
import { RecipeData } from '../menu/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface RecipeExplorerProps {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  currentRecipeId: string;
  allRecipes: RecipeData[];
  onSelectDish: (dish: RecipeData) => void;
  categoryLabels: Record<string, string>;
  categoryOrder: string[];
}

const RecipeExplorer: React.FC<RecipeExplorerProps> = ({
  isOpen,
  onOpen,
  currentRecipeId,
  allRecipes,
  onSelectDish,
  categoryLabels,
  categoryOrder,
}) => {
  const groupedRecipes = React.useMemo(() => {
    const groups: Record<string, RecipeData[]> = {};
    categoryOrder.forEach(cat => groups[cat] = []);
    
    allRecipes.forEach(r => {
      let key = r.category;
      if (!groups[key]) {
        if (key.includes('curry')) key = 'curry';
        else if (key.includes('soup')) key = 'soup';
        else if (key.includes('stir')) key = 'stirfry';
        else if (key.includes('akha')) key = 'akha_specialty';
        else if (key.includes('appetizer')) key = 'appetizer';
        else if (key.includes('dessert')) key = 'dessert';
      }
      if (groups[key]) groups[key].push(r);
    });
    return groups;
  }, [allRecipes, categoryOrder]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-surface-overlay/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top z-50 max-h-[75vh] flex flex-col w-[92vw] md:w-[66vw] lg:w-[85rem]">
      <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
        <Typography variant="h5" className="text-white italic">Heritage Collection</Typography>
        <Badge variant="mineral" className="bg-primary/10 text-primary">{allRecipes.length} Options</Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
        {categoryOrder.map(catKey => groupedRecipes[catKey]?.length > 0 && (
          <div key={catKey} className="space-y-4">
            <Badge variant="outline" className="border-white/20 text-white/40 px-3">{categoryLabels[catKey] || catKey.toUpperCase()}</Badge>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {groupedRecipes[catKey].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectDish(item);
                    onOpen(false);
                  }}
                  className={cn(
                    "relative group w-full h-20 rounded-2xl overflow-hidden border transition-all duration-300 flex items-center text-left",
                    item.id === currentRecipeId
                      ? "bg-secondary/20 border-secondary/50 text-secondary shadow-lg"
                      : "bg-surface-elevated border-white/5 text-white/60 hover:bg-white/5"
                  )}
                >
                  <div className="w-1/4 h-full border-r border-white/5 overflow-hidden bg-black/10">
                    <MediaImage
                      url={item.image}
                      fallbackAlt={item.name}
                      showCaption={false}
                      imgClassName="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all"
                    />
                  </div>
                  <div className="flex-1 px-4 py-2 min-w-0">
                    <span className="font-display font-black uppercase text-sm truncate block">{item.name}</span>
                    <span className="text-[9px] opacity-40 uppercase truncate block">{item.thai_name || 'Authentic'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeExplorer;
