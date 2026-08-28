/**
 * Market Runner - scelta della lista logistica salvata (non ancora confermata) da fare al mercato.
 * Estratto da MarketRunner.tsx (#16 split monstre), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/button/Button';
import Badge from '../../../components/ui/badge/Badge';
import PageContainer from '../../../components/layout/PageContainer';
import { ShoppingCart, RefreshCw } from 'lucide-react';
import type { ShoppingItem } from './types';
import type { MarketRunnerState } from './useMarketRunner';

export const RunPickerView: React.FC<{ r: MarketRunnerState }> = ({ r }) => {
    const { t } = useTranslation('market');
    const { runs, fetchData, selectRun } = r;
    return (
        <PageContainer className="h-[calc(100vh-64px)] overflow-y-auto">
            <div className="animate-in fade-in duration-500 py-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black uppercase italic text-title leading-none">{t('runner.pickList', { defaultValue: 'Saved shopping lists' })}</h3>
                        <p className="text-xs font-black uppercase tracking-widest text-sub mt-1">{t('runner.pickListHint', { defaultValue: 'Pick a list to start shopping' })}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} startIcon={<RefreshCw className="w-4 h-4" />}>{t('buttons.refresh')}</Button>
                </div>

                {runs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                        <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted">
                            <ShoppingCart className="w-9 h-9" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-black uppercase text-title">{t('empty.noListFound')}</h4>
                            <p className="text-sm text-sub max-w-xs">{t('runner.noListsHint', { defaultValue: 'Create a shopping list first in "Shopping List".' })}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {runs.map(run => {
                            const its = (run.items_snapshot as unknown as ShoppingItem[]) || [];
                            const shops = new Set(its.map(i => i.target_shop || 'General')).size;
                            return (
                                <button
                                    key={run.id}
                                    onClick={() => selectRun(run)}
                                    className="group text-left p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-300 dark:hover:border-primary-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                            <ShoppingCart className="w-5 h-5" />
                                        </div>
                                        <Badge variant="light" color="light" size="sm" className="uppercase">{run.status}</Badge>
                                    </div>
                                    <div className="font-mono font-black text-title text-lg leading-none">{run.run_date}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-sub mt-2">
                                        {t('runner.listMeta', { defaultValue: '{{items}} items · {{shops}} shops', items: its.length, shops })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
