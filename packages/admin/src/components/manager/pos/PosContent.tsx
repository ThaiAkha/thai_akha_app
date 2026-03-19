import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { GridCard } from '../../data-explorer';
import { Product } from '../../../hooks/useManagerPos';

interface PosContentProps {
    loading: boolean;
    displayedProducts: Product[];
    mainCategories: { value: string; label: string }[];
    subCategoryTabs: { value: string; label: string }[];
    activeCategory: string;
    activeSubCategory: string;
    onCategoryChange: (cat: string) => void;
    onSubCategoryChange: (sub: string) => void;
    onAddToTab: (product: Product) => void;
}

const PosContent: React.FC<PosContentProps> = ({
    loading,
    displayedProducts,
    mainCategories,
    subCategoryTabs,
    activeCategory,
    activeSubCategory,
    onCategoryChange,
    onSubCategoryChange,
    onAddToTab,
}) => {
    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="loader font-black uppercase text-xs tracking-widest animate-pulse">Loading...</div>
                </div>
            )}

            <div className="px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                {/* Category Filters */}
                <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar">
                    {mainCategories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => onCategoryChange(cat.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all border-2",
                                activeCategory === cat.value
                                    ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20"
                                    : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-900/30"
                            )}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                {subCategoryTabs.map(sub => (
                    <button
                        key={sub.value}
                        onClick={() => onSubCategoryChange(sub.value)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase whitespace-nowrap transition-all border",
                            activeSubCategory === sub.value
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white shadow-sm"
                                : "bg-transparent text-gray-500 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        {sub.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 content-start">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                    {displayedProducts.map(p => (
                        <GridCard
                            key={p.sku}
                            item={p}
                            imageUrl={p.image}
                            imageIcon={<ShoppingBag className="w-8 h-8 text-gray-300" />}
                            imageOverlay={
                                <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-white backdrop-blur-sm">
                                    x{p.stock}
                                </div>
                            }
                            onClick={() => onAddToTab(p)}
                            renderFields={(item) => (
                                <>
                                    <h6 className="text-xs font-bold text-gray-900 dark:text-white uppercase truncate mb-1">{item.name}</h6>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-mono font-black text-primary-600 dark:text-primary-400">{item.price} <span className="text-[9px] text-gray-400">THB</span></span>
                                    </div>
                                </>
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PosContent;
