import React from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Check, Printer, Receipt } from 'lucide-react';
import Avatar from '../../ui/avatar/Avatar';
import { netOfDraft } from './types';
import type { Draft, Person, SalaryRow } from './types';

interface PersonRowProps {
    person: Person;
    draft: Draft;
    saved: SalaryRow | undefined;
    base: number | null | undefined;
    individual: boolean;
    saving: boolean;
    printing: boolean;
    onChange: (patch: Partial<Draft>) => void;
    onSave: () => void;
    onPayslip: () => void;
    roleLabel: (r: string) => string;
}

const inputCls = 'h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-title disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

/** Un campo importo con etichetta: 4 numeri in fila senza label sono illeggibili. */
const AmountField: React.FC<{
    label: string; sign?: '+' | '-'; value: string; placeholder?: string;
    disabled: boolean; onChange: (v: string) => void;
}> = ({ label, sign, value, placeholder, disabled, onChange }) => (
    <label className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-sub">
            {sign && <span className={sign === '+' ? 'text-success' : 'text-error'}>{sign} </span>}{label}
        </span>
        <input
            type="number" inputMode="numeric" value={value} disabled={disabled}
            onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? '0'}
            className={`w-24 text-right ${inputCls}`}
        />
    </label>
);

const PersonRow: React.FC<PersonRowProps> = ({
    person, draft, saved, base, individual, saving, printing, onChange, onSave, onPayslip, roleLabel,
}) => {
    const { t } = useTranslation('manager');
    const locked = !!saved?.zoho_expense_id;   // gia' in Zoho → sola lettura
    const otherHats = person.roles.filter(r => r !== person.primaryRole);
    const net = netOfDraft(draft);

    return (
        <div className={`rounded-xl border p-3 space-y-3 ${locked ? 'border-green-200 dark:border-green-500/30 bg-green-50/40 dark:bg-green-500/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
            {/* Chi e' + azioni */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="min-w-[140px] flex-1 flex items-center gap-3">
                    <Avatar src={person.avatarUrl ?? undefined} alt={person.name} size="medium" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-title truncate">{person.name}</span>
                            {individual && (
                                <span title={t('salary.individualExpenseHint', { defaultValue: 'Its own Zoho expense, not part of the bank/cash group one.' })}
                                    className="shrink-0 inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sub">
                                    <Receipt className="w-3 h-3" />{t('salary.individualExpense', { defaultValue: 'Individual expense' })}
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-sub truncate">
                            {roleLabel(person.primaryRole)}
                            {otherHats.length > 0 && <span className="text-muted"> · {otherHats.map(roleLabel).join(' · ')}</span>}
                        </div>
                    </div>
                </div>

                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {(['bank', 'cash'] as const).map(m => (
                        <button key={m} disabled={locked} onClick={() => onChange({ method: m })}
                            className={`px-3 h-10 text-xs font-bold uppercase ${draft.method === m ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'} disabled:opacity-60`}>
                            {m === 'bank' ? t('salary.bank', { defaultValue: 'Bank' }) : t('salary.cash', { defaultValue: 'Cash' })}
                        </button>
                    ))}
                </div>

                {locked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success px-2">
                        <Check className="w-4 h-4" />{t('salary.paid', { defaultValue: 'Paid' })}
                    </span>
                ) : (
                    <button onClick={onSave} disabled={saving}
                        className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-body hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                        <Save className="w-4 h-4" />{saving ? '…' : (saved ? t('salary.save', { defaultValue: 'Save' }) : t('salary.record', { defaultValue: 'Record' }))}
                    </button>
                )}
                <button onClick={onPayslip} disabled={!saved || printing}
                    title={t('salary.payslip', { defaultValue: 'Payslip' })}
                    className="inline-flex items-center justify-center size-10 rounded-lg border border-gray-200 dark:border-gray-700 text-sub hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                    <Printer className="w-4 h-4" />
                </button>
            </div>

            {/* Le voci + il netto che ne esce */}
            <div className="flex items-end gap-2 flex-wrap pl-1">
                <AmountField label={t('salary.base', { defaultValue: 'Base' })} value={draft.base} disabled={locked}
                    placeholder={base != null ? String(base) : '0'} onChange={(v) => onChange({ base: v })} />
                <AmountField label={t('salary.overtime', { defaultValue: 'Overtime' })} sign="+" value={draft.overtime} disabled={locked}
                    onChange={(v) => onChange({ overtime: v })} />
                <AmountField label={t('salary.ssf', { defaultValue: 'Social security' })} sign="+" value={draft.ssf} disabled={locked}
                    onChange={(v) => onChange({ ssf: v })} />
                <AmountField label={t('salary.deductions', { defaultValue: 'Deductions' })} sign="-" value={draft.deduction} disabled={locked}
                    onChange={(v) => onChange({ deduction: v })} />
                <div className="flex flex-col gap-1 ml-auto text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sub">{t('salary.net', { defaultValue: 'Net to pay' })}</span>
                    <span className="h-10 inline-flex items-center justify-end px-2 text-base font-black text-title tabular-nums">
                        ฿{net.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PersonRow;
