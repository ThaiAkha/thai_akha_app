import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import Button from '../ui/button/Button';
import { Banknote, Printer, Save, Check, Wallet, Landmark, FileText } from 'lucide-react';

// Roster stipendi (9 lavoratori) per un mese: importo + nota OT + Bank/Cash, salva riga,
// crea spese Zoho raggruppate per metodo, genera payslip (singolo o tutti multipagina).
interface SalaryRow {
    employee_id: string;
    full_name: string | null;
    role: string;
    zoho_contact_id: string | null;
    base_salary: number | null;
    salary_id: string | null;
    total_amount: number | null;
    overtime_note: string | null;
    pay_method: 'bank' | 'cash' | string | null;
    status: string | null;
    zoho_expense_id: string | null;
}
interface Draft { amount: string; note: string; method: 'bank' | 'cash'; }

const thisMonth = (): string => new Date().toISOString().slice(0, 7);

const SalaryRoster: React.FC = () => {
    const { t } = useTranslation('manager');
    const [period, setPeriod] = useState<string>(thisMonth());
    const [rows, setRows] = useState<SalaryRow[] | null>(null);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [payslipBusy, setPayslipBusy] = useState<string | null>(null);

    const fetchRun = useCallback(async (p: string) => {
        setRows(null);
        const { data, error } = await supabase.rpc('get_salary_run', { p_period: p });
        if (error) { setRows([]); return; }
        const list = (data as unknown as SalaryRow[]) ?? [];
        setRows(list);
        const d: Record<string, Draft> = {};
        for (const r of list) {
            d[r.employee_id] = {
                amount: String(r.total_amount ?? r.base_salary ?? ''),
                note: r.overtime_note ?? '',
                method: (r.pay_method === 'cash' ? 'cash' : 'bank'),
            };
        }
        setDrafts(d);
    }, []);

    useEffect(() => { fetchRun(period); }, [period, fetchRun]);

    const totals = useMemo(() => {
        let bank = 0, cash = 0;
        for (const r of rows ?? []) {
            const d = drafts[r.employee_id];
            const amt = Number(d?.amount || 0);
            if ((d?.method ?? 'bank') === 'cash') cash += amt; else bank += amt;
        }
        return { bank, cash };
    }, [rows, drafts]);

    const setDraft = (id: string, patch: Partial<Draft>) => setDrafts(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

    const saveRow = async (r: SalaryRow) => {
        const d = drafts[r.employee_id];
        if (!d || savingId) return;
        setSavingId(r.employee_id);
        try {
            const { error } = await supabase.from('staff_salaries').upsert({
                employee_id: r.employee_id, period,
                total_amount: Number(d.amount || 0), overtime_note: d.note || null, pay_method: d.method,
            }, { onConflict: 'employee_id,period' });
            if (error) throw error;
            await fetchRun(period);
        } catch (err) {
            alert(t('salary.saveError', { defaultValue: 'Could not save' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setSavingId(null); }
    };

    const createExpenses = async () => {
        if (busy) return;
        if (!window.confirm(t('salary.confirmExpenses', { defaultValue: 'Create the grouped Zoho salary expense(s) for {{p}}?', p: period }))) return;
        setBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-salary-expense', { body: { period } });
            if (error) throw error;
            const res = data as { success?: boolean; expenses?: unknown[]; failures?: { method: string; message: string }[]; message?: string };
            if (res.failures?.length) alert(t('salary.someFailed', { defaultValue: 'Some failed' }) + ': ' + res.failures.map(f => `${f.method}: ${f.message}`).join(' · '));
            await fetchRun(period);
        } catch (err) {
            alert(t('salary.expenseError', { defaultValue: 'Expense error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // Payslip: singolo (salary_id) o tutti del mese (period, PDF multipagina)
    const payslip = async (body: { salary_id?: string; period?: string }, key: string) => {
        if (payslipBusy) return;
        setPayslipBusy(key);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', { body: { report: 'salary_payslip', ...body } });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; f.src = url;
            f.onload = () => { f.contentWindow?.focus(); f.contentWindow?.print(); };
            document.body.appendChild(f); setTimeout(() => { f.remove(); URL.revokeObjectURL(url); }, 60000);
        } catch (err) {
            alert(t('salary.payslipError', { defaultValue: 'Payslip error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setPayslipBusy(null); }
    };

    const anySaved = (rows ?? []).some(r => r.salary_id);

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-4">
            {/* Toolbar: mese + totali + azioni */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('salary.month', { defaultValue: 'Month' })}</span>
                    <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500"><Landmark className="w-4 h-4" /> ฿{totals.bank.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5 text-gray-500"><Wallet className="w-4 h-4" /> ฿{totals.cash.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" disabled={busy} startIcon={<Banknote className="w-4 h-4" />} onClick={createExpenses}>
                    {busy ? t('salary.creating', { defaultValue: 'Creating…' }) : t('salary.createExpenses', { defaultValue: 'Create salary expenses' })}
                </Button>
                <Button variant="outline" size="sm" disabled={!anySaved || payslipBusy === 'all'} startIcon={<FileText className="w-4 h-4" />} onClick={() => payslip({ period }, 'all')}>
                    {payslipBusy === 'all' ? t('salary.generating', { defaultValue: 'Generating…' }) : t('salary.allPayslips', { defaultValue: 'All payslips (1 PDF)' })}
                </Button>
            </div>

            {/* Roster */}
            {rows === null ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-gray-400">{t('salary.loading', { defaultValue: 'Loading…' })}</div>
            ) : rows.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-gray-400">{t('salary.noStaff', { defaultValue: 'No staff found.' })}</div>
            ) : (
                <div className="space-y-2">
                    {rows.map(r => {
                        const d = drafts[r.employee_id] ?? { amount: '', note: '', method: 'bank' as const };
                        const locked = !!r.zoho_expense_id; // già pagato → read-only
                        return (
                            <div key={r.employee_id} className={`rounded-xl border p-3 ${locked ? 'border-green-200 dark:border-green-500/30 bg-green-50/40 dark:bg-green-500/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="min-w-[140px] flex-1">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{r.full_name || '—'}</div>
                                        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">{r.role}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-400 text-sm">฿</span>
                                        <input type="number" inputMode="numeric" value={d.amount} disabled={locked}
                                            onChange={(e) => setDraft(r.employee_id, { amount: e.target.value })}
                                            placeholder={r.base_salary ? String(r.base_salary) : '0'}
                                            className="w-28 h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-right text-gray-900 dark:text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
                                    </div>
                                    <input type="text" value={d.note} disabled={locked}
                                        onChange={(e) => setDraft(r.employee_id, { note: e.target.value })}
                                        placeholder={t('salary.otNote', { defaultValue: 'Overtime note…' })}
                                        className="flex-1 min-w-[140px] h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
                                    {/* Bank / Cash */}
                                    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        {(['bank', 'cash'] as const).map(m => (
                                            <button key={m} disabled={locked} onClick={() => setDraft(r.employee_id, { method: m })}
                                                className={`px-3 h-9 text-xs font-bold uppercase ${d.method === m ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'} disabled:opacity-60`}>
                                                {m === 'bank' ? t('salary.bank', { defaultValue: 'Bank' }) : t('salary.cash', { defaultValue: 'Cash' })}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Actions */}
                                    {locked ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 px-2"><Check className="w-4 h-4" />{t('salary.paid', { defaultValue: 'Paid' })}</span>
                                    ) : (
                                        <button onClick={() => saveRow(r)} disabled={savingId === r.employee_id}
                                            className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                                            <Save className="w-4 h-4" />{savingId === r.employee_id ? '…' : t('salary.save', { defaultValue: 'Save' })}
                                        </button>
                                    )}
                                    <button onClick={() => r.salary_id && payslip({ salary_id: r.salary_id }, r.employee_id)} disabled={!r.salary_id || payslipBusy === r.employee_id}
                                        title={t('salary.payslip', { defaultValue: 'Payslip' })}
                                        className="inline-flex items-center justify-center size-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                                        <Printer className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SalaryRoster;
