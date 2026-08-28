/**
 * Market Shop - colonna centrale: dashboard (card Logistics/Teacher) oppure planner
 * (filtri per negozio + griglia ingredienti). Estratto da MarketShop.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/button/Button';
import { ShopItemCard } from '../../../components/market/ShopItemCard';
import { CategoryHeader } from '../../../components/market/CategoryHeader';
import { cn } from '@thaiakha/shared/lib/utils';
import { Truck, GraduationCap, Calendar as CalendarIcon, Edit, ShoppingCart } from 'lucide-react';
import { formatLongDate, toISODate, type LibraryItem } from './types';
import type { MarketShopState } from './useMarketShop';

export const MarketShopCenter: React.FC<{ s: MarketShopState }> = ({ s }) => {
  const { t, i18n } = useTranslation('market');
  const {
    activeTab, setActiveTab, setViewMode, setSelectedDate, setIsCalendarModalOpen, setFormState,
    allowedScopes, canEdit, history, activeScope, uniqueShops, activeShopTab, setActiveShopTab,
    filteredLibrary, groupedLibrary, formState, handleAdjustQty, openKeypad, nextLogisticShopDate, openLogisticList,
  } = s;

  const renderItemCard = (item: LibraryItem) => (
    <ShopItemCard
      key={item.id}
      item={item}
      mode={activeTab as 'logistics' | 'teacher'}
      price={formState[item.id]?.price || 0}
      isAdded={!!formState[item.id]}
      qty={formState[item.id]?.qty ?? 0}
      onIncrement={() => handleAdjustQty(item.id, 1)}
      onDecrement={() => handleAdjustQty(item.id, -1)}
      onClick={() => openKeypad(item.id)}
    />
  );

  return (
      <div className="flex flex-col h-full w-full">
        {/* CENTER HEADER */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <h2 className="text-xl font-bold text-title">
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
                    <h3 className="text-2xl font-black italic uppercase text-title">{t('tabs.logistics')}</h3>
                  </div>
                  {/* One shared list per shop day (Mon/Thu): edit it if it exists, otherwise create it. */}
                  {(() => {
                    const targetDate = nextLogisticShopDate();
                    const existing = history.find(r => r.shopper_role === 'logistics' && r.run_date === toISODate(targetDate)) || null;
                    return (
                      <div className="space-y-3">
                        <div className="text-center pb-1">
                          <span className="block text-xs font-black uppercase tracking-widest text-sub">{t('labels.nextShopDay', { defaultValue: 'Next shopping day' })}</span>
                          <span className="block text-lg font-bold text-title">{formatLongDate(targetDate, i18n.language)}</span>
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
                    <h3 className="text-2xl font-black italic uppercase text-title">{t('tabs.teacher')}</h3>
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
                            : "text-sub hover:text-gray-900 dark:hover:text-gray-300"
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
                  <div className="p-12 text-center text-sub">
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
