import React from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, FileText, Truck, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../ui/button/Button';
import Avatar from '../ui/avatar/Avatar';
import { useSalaryRoster } from './salaryRoster/useSalaryRoster';
import PersonRow from './salaryRoster/PersonRow';
import SalarySummary from './salaryRoster/SalarySummary';

/**
 * Salary roster - PERSONE, non login.
 *   authors (attivi, non org, non AI) + worker_roles → raggruppati per cappello PRIMARIO
 *   staff_details.salary_thb → base (RLS: solo admin/manager la vedono, di proposito)
 *   staff_salaries (employee_id = authors.id) → la riga del mese:
 *     base + overtime + ssf - other_deduction = net_amount (GENERATA dal DB)
 *   driver → nessuna base mensile (pagati a corsa via driver_payments): link ai payout
 *
 * Shell di sola composizione: stato e effetti stanno in salaryRoster/useSalaryRoster.
 */
const SalaryRoster: React.FC<{ onOpenDriverPayouts?: () => void }> = ({ onOpenDriverPayouts }) => {
    const { t } = useTranslation('manager');
    const {
        period, setPeriod, people, bases, individualIds, baseVisible,
        salaries, drafts, setDraft, groups, summary,
        savingId, saveRow, busy, createExpenses, payslipBusy, payslip,
        loadError, actionError, anySaved,
    } = useSalaryRoster();

    const roleLabel = (r: string) => t(`salary.roles.${r}`, { defaultValue: r });
    const inputCls = 'h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

    const onCreateExpenses = () => {
        const msg = t('salary.confirmExpenses', { defaultValue: 'Create the Zoho salary expense(s) for {{p}}? Total ฿{{n}}.', p: period, n: summary.net.toLocaleString() });
        if (window.confirm(msg)) createExpenses();
    };

    return (
        <div className="p-3 sm:p-4 max-w-4xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sub">{t('salary.month', { defaultValue: 'Month' })}</span>
                    <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" disabled={busy || !anySaved} startIcon={<Banknote className="w-4 h-4" />} onClick={onCreateExpenses}>
                        {busy ? t('salary.creating', { defaultValue: 'Creating…' }) : t('salary.createExpenses', { defaultValue: 'Create salary expenses' })}
                    </Button>
                    <Button variant="outline" size="sm" disabled={!anySaved || payslipBusy === 'all'} startIcon={<FileText className="w-4 h-4" />} onClick={() => payslip({ period }, 'all')}>
                        {payslipBusy === 'all' ? t('salary.generating', { defaultValue: 'Generating…' }) : t('salary.allPayslips', { defaultValue: 'All payslips (1 PDF)' })}
                    </Button>
                </div>
            </div>

            {!baseVisible && people && people.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <EyeOff className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{t('salary.baseHidden', { defaultValue: 'Base salaries are visible to managers only.' })}</span>
                </div>
            )}
            {(loadError || actionError) && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/5 p-3 text-xs text-red-700 dark:text-red-300">
                    {loadError ?? actionError}
                </div>
            )}

            {people === null ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-sub">{t('salary.loading', { defaultValue: 'Loading…' })}</div>
            ) : people.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-sub">{t('salary.noStaff', { defaultValue: 'No staff found.' })}</div>
            ) : (
                <>
                    <div className="space-y-5">
                        {groups.map(g => (
                            <section key={g.role} className="space-y-2">
                                <div className="flex items-center gap-2 px-1">
                                    {g.role === 'driver' && <Truck className="w-4 h-4 text-gray-400" />}
                                    <h4 className="text-xs font-black uppercase tracking-widest text-sub">{roleLabel(g.role)}</h4>
                                    <span className="text-[10px] font-bold text-muted">{g.people.length}</span>
                                </div>

                                {g.people.map(p => p.primaryRole === 'driver' ? (
                                    // Driver: pagati a corsa (driver_payments), nessuna base mensile qui.
                                    <div key={p.id} className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40 p-3 flex items-center gap-3 flex-wrap">
                                        <div className="min-w-[140px] flex-1 flex items-center gap-3">
                                            <Avatar src={p.avatarUrl ?? undefined} alt={p.name} size="medium" />
                                            <div className="min-w-0">
                                                <span className="block text-sm font-bold text-title truncate">{p.name}</span>
                                                <span className="block text-[10px] font-black uppercase tracking-wider text-sub">{roleLabel(p.primaryRole)}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-sub">{t('salary.driverPerRide', { defaultValue: 'Paid per ride' })}</span>
                                        {onOpenDriverPayouts && (
                                            <button onClick={onOpenDriverPayouts} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                                                {t('salary.openPayouts', { defaultValue: 'Driver payouts' })}<ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <PersonRow
                                        key={p.id}
                                        person={p}
                                        draft={drafts[p.id] ?? { base: '', overtime: '', ssf: '', deduction: '', method: 'bank' }}
                                        saved={salaries[p.id]}
                                        base={bases[p.id]}
                                        individual={individualIds.has(p.id)}
                                        saving={savingId === p.id}
                                        printing={payslipBusy === p.id}
                                        onChange={(patch) => setDraft(p.id, patch)}
                                        onSave={() => saveRow(p.id)}
                                        onPayslip={() => { const s = salaries[p.id]; if (s) payslip({ salary_id: s.id }, p.id); }}
                                        roleLabel={roleLabel}
                                    />
                                ))}
                            </section>
                        ))}
                    </div>

                    <SalarySummary summary={summary} />
                </>
            )}
        </div>
    );
};

export default SalaryRoster;
