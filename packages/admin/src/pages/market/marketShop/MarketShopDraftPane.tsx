/**
 * Market Shop - pannello destro: bozza di lavoro (data, chi fa la spesa, totale/conteggio,
 * righe con stepper/keypad, salva/conferma). Estratto da MarketShop.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/button/Button';
import { ReportLineRow, ReportLineMedia } from '../../../components/reports';
import { PackStepper } from '../../../components/market/PackStepper';
import { describeQty } from '../../../components/market/packUtils';
import WorkerSelector from '../../../components/common/WorkerSelector';
import { Heading, Caption } from '../../../components/typography';
import { cn } from '@thaiakha/shared/lib/utils';
import { X, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { WORKER_ROLES_BY_SCOPE, normalizeEntry, formatLongDate, type DraftItem } from './types';
import type { MarketShopState } from './useMarketShop';

export const MarketShopDraftPane: React.FC<{ s: MarketShopState }> = ({ s }) => {
  const { t, i18n } = useTranslation('market');
  const {
    activeTab, setActiveTab, viewMode, selectedDate, workerId, setWorkerId, formState, library,
    isSaving, handleAdjustQty, openKeypad, handleToggleItem, handleSave,
  } = s;

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div>
          <Heading level="h4" className="text-lg text-inherit leading-7">{t('labels.workDraft')}</Heading>
        </div>
        <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-sub hover:text-body">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="text-center px-4">
          <span className="text-2xl font-black italic uppercase text-title tracking-widest leading-none block">
            {formatLongDate(selectedDate, i18n.language)}
          </span>
        </div>

        {/* Who is shopping? (authors via worker_roles; the login stays in created_by) */}
        {activeTab !== 'dashboard' && (
          <WorkerSelector
            roles={WORKER_ROLES_BY_SCOPE[activeTab]}
            value={workerId}
            onChange={(id) => setWorkerId(id)}
          />
        )}

        <div className={cn(
          "p-8 rounded-3xl border text-center transition-all duration-300",
          activeTab === 'teacher'
            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
            : "bg-primary-50 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800"
        )}>
          <span className="text-xs font-black uppercase text-sub tracking-widest block mb-2">
            {activeTab === 'teacher' ? t('labels.totalExpenses') : t('labels.itemsRequired')}
          </span>
          <span className="font-mono text-3xl font-black text-title block">
            {activeTab === 'teacher'
              ? `${Object.values(formState).reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} THB`
              : `${Object.keys(formState).length} Items`
            }
          </span>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="space-y-3 pb-32">
            {Object.entries(formState).map((entry) => {
              const item = normalizeEntry(entry as [string, { qty: number; price: number }] | DraftItem, library);

              return (
                <ReportLineRow
                  key={item.id}
                  density="sm"
                  leading={<ReportLineMedia tone="primary" badge={item.qty} />}
                  title={item.name}
                  subtitle={activeTab === 'teacher' ? (item.unit || undefined) : describeQty(item.qty, { purchase_pack_size: item.pack_size, purchase_pack_label: item.unit, default_unit: item.base_unit })}
                  amount={activeTab === 'teacher' ? item.price.toLocaleString() : undefined}
                  amountSuffix="THB"
                  actions={activeTab === 'logistics' ? (
                    <PackStepper size="sm" qty={item.qty} onIncrement={() => handleAdjustQty(item.id, 1)} onDecrement={() => handleAdjustQty(item.id, -1)} />
                  ) : undefined}
                  onEdit={activeTab === 'teacher' ? () => openKeypad(item.id) : undefined}
                  onDelete={() => handleToggleItem(item.id)}
                  confirmDelete={{
                    title: t('draft.removeTitle', { defaultValue: 'Remove item?' }),
                    message: t('draft.removeMsg', { defaultValue: 'Remove "{{name}}" from the list?', name: item.name }),
                    confirmLabel: t('buttons.remove', { defaultValue: 'Remove' }),
                  }}
                />
              );
            })}
            {Object.keys(formState).length === 0 && (
              <div className="py-12 text-center opacity-40">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-muted" />
                <Caption className="font-bold uppercase leading-4">{t('empty.noContent')}</Caption>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab !== 'dashboard' && viewMode === 'planner' && Object.keys(formState).length > 0 && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-surface">
          {activeTab === 'teacher' ? (
            <Button
              variant="primary"
              className="w-full h-14 rounded-2xl shadow-xl shadow-primary-500/30"
              size="md"
              startIcon={<CheckCircle2 className="w-5 h-5" />}
              disabled={isSaving}
              onClick={() => handleSave(false)}
            >
              {t('buttons.submitReport')}
            </Button>
          ) : (
            // Logistic: save as editable draft (planned) OR confirm (approved → locked).
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl"
                size="md"
                disabled={isSaving}
                onClick={() => handleSave(false)}
              >
                {t('buttons.saveDraft', { defaultValue: 'Save draft' })}
              </Button>
              <Button
                variant="primary"
                className="w-full h-14 rounded-2xl shadow-xl shadow-primary-500/30"
                size="md"
                startIcon={<CheckCircle2 className="w-5 h-5" />}
                disabled={isSaving}
                onClick={() => handleSave(true)}
              >
                {t('buttons.confirmReport', { defaultValue: 'Confirm report' })}
              </Button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
