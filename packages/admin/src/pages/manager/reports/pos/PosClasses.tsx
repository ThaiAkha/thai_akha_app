/**
 * POS Classes - UI: selettore giorno in toolbar, colonna centro con i 4 bucket e il pulsante fatture Zoho.
 * Stato e azioni in usePosClasses. Estratto da ManagerReports.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/ui/button/Button';
import { Caption, SectionTitle } from '../../../../components/typography';
import { ReportStatusBadge } from '../../../../components/reports';
import { Banknote, Receipt } from 'lucide-react';
import { SESSION_LABEL } from '../shared';
import { LoadingCenter } from '../sharedUi';
import type { PosClassesState } from './usePosClasses';

export const PosToolbar: React.FC<{ p: PosClassesState }> = ({ p }) => {
    const { t } = useTranslation('manager');
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sub">{t('reports.day', { defaultValue: 'Day' })}</span>
            <input
                type="date"
                value={p.posDay}
                onChange={(e) => p.setPosDay(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
        </div>
    );
};

export const PosCenter: React.FC<{ p: PosClassesState }> = ({ p }) => {
    const { t } = useTranslation('manager');
    const { posRows, posBuckets, posBusy } = p;
    if (posRows === null) return <LoadingCenter label={t('driverPayouts.loading', { defaultValue: 'Loading…' })} />;
    if (posBuckets.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-sub gap-3 py-20">
                <Receipt className="w-10 h-10 opacity-40" />
                <SectionTitle className="text-sub">{t('reports.posNothing', { defaultValue: 'Nothing to invoice for this day.' })}</SectionTitle>
            </div>
        );
    }
    return (
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posBuckets.map(b => (
                    <div key={b.key} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-base font-bold text-title">{SESSION_LABEL[b.session] ?? b.session}</span>
                            <ReportStatusBadge tone={b.tender === 'cash' ? 'green' : 'blue'}>{b.tender === 'cash' ? t('reports.cash', { defaultValue: 'Cash' }) : t('reports.card', { defaultValue: 'Card' })}</ReportStatusBadge>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-sub mb-2">{b.bookings} {t('reports.bookingsShort', { defaultValue: 'bookings' })} · {b.items} {t('reports.items', { defaultValue: 'items' })}</div>
                        <div className="font-mono text-2xl font-black text-title">{b.amount.toLocaleString()} <span className="text-xs text-sub font-normal">THB{b.tender === 'card' ? ' +3%' : ''}</span></div>
                    </div>
                ))}
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between gap-4">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-sub">{t('reports.posTotalBase', { defaultValue: 'Total (base, pre-card-fee)' })}</div>
                    <div className="font-mono text-xl font-black text-title">{posBuckets.reduce((s, b) => s + b.amount, 0).toLocaleString()} <span className="text-xs text-sub font-normal">THB</span></div>
                </div>
                <Button variant="primary" size="md" disabled={posBusy} startIcon={<Banknote className="w-4 h-4" />} onClick={p.handlePosInvoices} className="justify-center">
                    {posBusy ? t('driverPayouts.processing', { defaultValue: 'Processing…' }) : t('reports.posGenerate', { defaultValue: 'Generate Zoho invoices' })}
                </Button>
            </div>
            <Caption className="text-center leading-4">{t('reports.posHint', { defaultValue: 'Up to 4 invoices: morning/evening × cash/card. Already-invoiced groups are skipped.' })}</Caption>
        </div>
    );
};
