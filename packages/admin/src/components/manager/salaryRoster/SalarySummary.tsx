import React from 'react';
import { SectionTitle } from '../../typography';
import { useTranslation } from 'react-i18next';
import { Landmark, Wallet } from 'lucide-react';

interface SalarySummaryProps {
    summary: { base: number; overtime: number; ssf: number; deduction: number; bank: number; cash: number; net: number; staff: number };
}

/** Riepilogo del mese: cosa si sta per pagare, PRIMA di generare la spesa Zoho. */
const SalarySummary: React.FC<SalarySummaryProps> = ({ summary }) => {
    const { t } = useTranslation('manager');
    const line = (label: string, value: number, sign?: '+' | '-') => (
        <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sub">
                {sign && <span className={sign === '+' ? 'text-success' : 'text-error'}>{sign} </span>}{label}
            </span>
            <span className="text-sm font-bold text-body tabular-nums">฿{value.toLocaleString()}</span>
        </div>
    );

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 p-4">
            <div className="flex items-baseline justify-between gap-3 mb-2">
                <SectionTitle as="h4" tone="sub" className="tracking-widest">
                    {t('salary.summary', { defaultValue: 'Summary' })}
                </SectionTitle>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sub">
                    {t('salary.summaryStaff', { defaultValue: '{{n}} staff', n: summary.staff })}
                </span>
            </div>

            <div className="divide-y divide-gray-200/70 dark:divide-gray-800">
                {line(t('salary.base', { defaultValue: 'Base' }), summary.base)}
                {line(t('salary.overtime', { defaultValue: 'Overtime' }), summary.overtime, '+')}
                {line(t('salary.ssf', { defaultValue: 'Social security' }), summary.ssf, '+')}
                {line(t('salary.deductions', { defaultValue: 'Deductions' }), summary.deduction, '-')}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between gap-4">
                <span className="text-sm font-black uppercase tracking-wider text-body">
                    {t('salary.totalToPay', { defaultValue: 'Total to pay' })}
                </span>
                <span className="text-xl font-black text-title tabular-nums">฿{summary.net.toLocaleString()}</span>
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-sub">
                <span className="flex items-center gap-1.5"><Landmark className="w-4 h-4" />{t('salary.bank', { defaultValue: 'Bank' })} ฿{summary.bank.toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" />{t('salary.cash', { defaultValue: 'Cash' })} ฿{summary.cash.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default SalarySummary;
