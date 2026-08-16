import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { WorkerRole } from '@thaiakha/shared/types/workers.types';
import Button from '../ui/button/Button';
import Avatar from '../ui/avatar/Avatar';
import { Banknote, Printer, Save, Check, Wallet, Landmark, FileText, Truck, EyeOff, ArrowRight } from 'lucide-react';

/**
 * Salary roster (task #29) - PEOPLE, not logins.
 *   authors (active, not org, not AI) + worker_roles → grouped by PRIMARY hat (each person once)
 *   staff_details.salary_thb → base (RLS: only admin/manager can read it; others see nothing, by design)
 *   staff_salaries (employee_id = authors.id) → the month's row: amount, OT note, bank/cash, Zoho
 *   drivers → no base salary (paid per ride via driver_payments): shown with a link to payouts
 * Legacy NOT used here: profiles.base_salary, authors.salary_thb, RPC get_salary_run (profiles-based).
 */
interface Person {
    id: string;
    name: string;
    avatarUrl: string | null;
    displayOrder: number;
    primaryRole: WorkerRole | 'unassigned';
    roles: WorkerRole[];
}
interface SalaryRow {
    id: string;
    employee_id: string;
    total_amount: number;
    overtime_note: string | null;
    pay_method: string;
    status: string;
    zoho_expense_id: string | null;
}
interface Draft { amount: string; note: string; method: 'bank' | 'cash'; }
interface AuthorRow {
    id: string; name: string; display_order: number | null;
    worker_roles: { role: string; is_primary: boolean }[] | null;
    avatar: { image_url: string | null } | { image_url: string | null }[] | null;
}

// Display order of the groups (primary hat). Drivers last: no monthly base.
const GROUP_ORDER: Array<WorkerRole | 'unassigned'> = ['teacher', 'helper', 'extra', 'setup', 'logistics', 'manager', 'admin', 'driver', 'unassigned'];
const thisMonth = (): string => new Date().toISOString().slice(0, 7);

interface SalaryRosterProps { onOpenDriverPayouts?: () => void; }

const SalaryRoster: React.FC<SalaryRosterProps> = ({ onOpenDriverPayouts }) => {
    const { t } = useTranslation('manager');
    const [period, setPeriod] = useState<string>(thisMonth());
    const [people, setPeople] = useState<Person[] | null>(null);
    const [bases, setBases] = useState<Record<string, number | null>>({});
    const [baseVisible, setBaseVisible] = useState<boolean>(true);
    const [salaries, setSalaries] = useState<Record<string, SalaryRow>>({});
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [payslipBusy, setPayslipBusy] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    // People + base: once. authors is public-read, staff_details is admin/manager only.
    const fetchPeople = useCallback(async () => {
        const { data, error } = await supabase
            .from('authors')
            .select('id, name, display_order, worker_roles(role, is_primary), avatar:media_assets!avatar_asset_id(image_url)')
            .eq('is_active', true).eq('is_organization', false).eq('is_ai_agent', false)
            .order('display_order');
        if (error) { setLoadError(error.message); setPeople([]); return []; }
        const list: Person[] = ((data ?? []) as unknown as AuthorRow[]).map(r => {
            const roles = (r.worker_roles ?? []).map(x => x.role as WorkerRole);
            const primary = (r.worker_roles ?? []).find(x => x.is_primary)?.role as WorkerRole | undefined;
            const av = Array.isArray(r.avatar) ? r.avatar[0] : r.avatar;
            return { id: r.id, name: r.name, avatarUrl: av?.image_url ?? null, displayOrder: r.display_order ?? 999, primaryRole: primary ?? roles[0] ?? 'unassigned', roles };
        });
        setPeople(list);

        // Base salary: RLS returns nothing (or an error) for non admin/manager. That is BY DESIGN:
        // never bypass, just show a clean "not visible" hint.
        const { data: sd, error: sdErr } = await supabase.from('staff_details').select('worker_id, salary_thb');
        if (sdErr || !sd || sd.length === 0) { setBaseVisible(false); setBases({}); }
        else {
            setBaseVisible(true);
            const m: Record<string, number | null> = {};
            for (const r of sd) m[r.worker_id] = r.salary_thb;
            setBases(m);
        }
        return list;
    }, []);

    // Month rows: per period.
    const fetchSalaries = useCallback(async (p: string, list: Person[]) => {
        if (list.length === 0) { setSalaries({}); return; }
        const { data, error } = await supabase
            .from('staff_salaries')
            .select('id, employee_id, total_amount, overtime_note, pay_method, status, zoho_expense_id')
            .eq('period', p)
            .in('employee_id', list.map(x => x.id));
        if (error) { setLoadError(error.message); return; }
        const m: Record<string, SalaryRow> = {};
        for (const r of (data ?? []) as SalaryRow[]) m[r.employee_id] = r;
        setSalaries(m);
    }, []);

    useEffect(() => { fetchPeople(); }, [fetchPeople]);
    useEffect(() => { if (people) fetchSalaries(period, people); }, [period, people, fetchSalaries]);

    // Drafts follow the loaded rows (or the base as a placeholder amount).
    useEffect(() => {
        if (!people) return;
        const d: Record<string, Draft> = {};
        for (const p of people) {
            const s = salaries[p.id];
            d[p.id] = {
                amount: s ? String(s.total_amount) : (bases[p.id] != null ? String(bases[p.id]) : ''),
                note: s?.overtime_note ?? '',
                method: s?.pay_method === 'cash' ? 'cash' : 'bank',
            };
        }
        setDrafts(d);
    }, [people, salaries, bases]);

    const groups = useMemo(() => {
        const by = new Map<Person['primaryRole'], Person[]>();
        for (const p of people ?? []) { if (!by.has(p.primaryRole)) by.set(p.primaryRole, []); by.get(p.primaryRole)!.push(p); }
        return GROUP_ORDER.filter(g => by.has(g)).map(g => ({ role: g, people: by.get(g)!.sort((a, b) => a.displayOrder - b.displayOrder) }));
    }, [people]);

    const isDriver = (p: Person) => p.primaryRole === 'driver';

    const totals = useMemo(() => {
        let bank = 0, cash = 0;
        for (const p of people ?? []) {
            if (isDriver(p)) continue;
            const d = drafts[p.id]; const amt = Number(d?.amount || 0);
            if ((d?.method ?? 'bank') === 'cash') cash += amt; else bank += amt;
        }
        return { bank, cash };
    }, [people, drafts]);

    const setDraft = (id: string, patch: Partial<Draft>) => setDrafts(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

    // Record the month for one person (insert/update staff_salaries, employee_id = authors.id).
    const saveRow = async (p: Person) => {
        const d = drafts[p.id];
        if (!d || savingId) return;
        setSavingId(p.id);
        try {
            const { error } = await supabase.from('staff_salaries').upsert({
                employee_id: p.id, period,
                total_amount: Number(d.amount || 0), overtime_note: d.note || null, pay_method: d.method,
            }, { onConflict: 'employee_id,period' });
            if (error) throw error;
            await fetchSalaries(period, people ?? []);
        } catch (err) {
            alert(t('salary.saveError', { defaultValue: 'Could not save' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setSavingId(null); }
    };

    // Grouped Zoho expenses (bank / cash) for the month - edge zoho-create-salary-expense { period }.
    const createExpenses = async () => {
        if (busy) return;
        if (!window.confirm(t('salary.confirmExpenses', { defaultValue: 'Create the grouped Zoho salary expense(s) for {{p}}?', p: period }))) return;
        setBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-salary-expense', { body: { period } });
            if (error) throw error;
            const res = data as { success?: boolean; failures?: { method: string; message: string }[] };
            if (res.failures?.length) alert(t('salary.someFailed', { defaultValue: 'Some failed' }) + ': ' + res.failures.map(f => `${f.method}: ${f.message}`).join(' · '));
            await fetchSalaries(period, people ?? []);
        } catch (err) {
            alert(t('salary.expenseError', { defaultValue: 'Expense error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setBusy(false); }
    };

    // Payslip: one (salary_id) or the whole month (period → multipage PDF).
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

    const anySaved = Object.keys(salaries).length > 0;
    const roleLabel = (r: string) => t(`salary.roles.${r}`, { defaultValue: r });
    const inputCls = 'h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

    return (
        <div className="p-3 sm:p-4 max-w-4xl mx-auto space-y-4">
            {/* Toolbar: month + totals + actions */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('salary.month', { defaultValue: 'Month' })}</span>
                    <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls} />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500"><Landmark className="w-4 h-4" /> ฿{totals.bank.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5 text-gray-500"><Wallet className="w-4 h-4" /> ฿{totals.cash.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" disabled={busy || !anySaved} startIcon={<Banknote className="w-4 h-4" />} onClick={createExpenses}>
                    {busy ? t('salary.creating', { defaultValue: 'Creating…' }) : t('salary.createExpenses', { defaultValue: 'Create salary expenses' })}
                </Button>
                <Button variant="outline" size="sm" disabled={!anySaved || payslipBusy === 'all'} startIcon={<FileText className="w-4 h-4" />} onClick={() => payslip({ period }, 'all')}>
                    {payslipBusy === 'all' ? t('salary.generating', { defaultValue: 'Generating…' }) : t('salary.allPayslips', { defaultValue: 'All payslips (1 PDF)' })}
                </Button>
            </div>

            {!baseVisible && people && people.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <EyeOff className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{t('salary.baseHidden', { defaultValue: 'Base salaries are visible to managers only.' })}</span>
                </div>
            )}
            {loadError && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/5 p-3 text-xs text-red-700 dark:text-red-300">{loadError}</div>
            )}

            {/* Roster grouped by primary role */}
            {people === null ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-gray-400">{t('salary.loading', { defaultValue: 'Loading…' })}</div>
            ) : people.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold uppercase text-gray-400">{t('salary.noStaff', { defaultValue: 'No staff found.' })}</div>
            ) : (
                <div className="space-y-5">
                    {groups.map(g => (
                        <section key={g.role} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                {g.role === 'driver' && <Truck className="w-4 h-4 text-gray-400" />}
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{roleLabel(g.role)}</h4>
                                <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600">{g.people.length}</span>
                            </div>
                            {g.people.map(p => {
                                const s = salaries[p.id];
                                const d = drafts[p.id] ?? { amount: '', note: '', method: 'bank' as const };
                                const locked = !!s?.zoho_expense_id; // already expensed → read-only
                                const otherHats = p.roles.filter(r => r !== p.primaryRole);
                                const head = (
                                    <div className="min-w-[140px] flex-1 flex items-center gap-3">
                                        <Avatar src={p.avatarUrl ?? undefined} alt={p.name} size="medium" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 truncate">
                                                {roleLabel(p.primaryRole)}{otherHats.length > 0 && <span className="text-gray-300 dark:text-gray-600"> · {otherHats.map(roleLabel).join(' · ')}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                                if (isDriver(p)) {
                                    // Drivers are paid per ride (driver_payments), no monthly base here.
                                    return (
                                        <div key={p.id} className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40 p-3 flex items-center gap-3 flex-wrap">
                                            {head}
                                            <span className="text-xs text-gray-400">{t('salary.driverPerRide', { defaultValue: 'Paid per ride' })}</span>
                                            {onOpenDriverPayouts && (
                                                <button onClick={onOpenDriverPayouts} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                                                    {t('salary.openPayouts', { defaultValue: 'Driver payouts' })}<ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div key={p.id} className={`rounded-xl border p-3 ${locked ? 'border-green-200 dark:border-green-500/30 bg-green-50/40 dark:bg-green-500/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {head}
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 text-sm">฿</span>
                                                <input type="number" inputMode="numeric" value={d.amount} disabled={locked}
                                                    onChange={(e) => setDraft(p.id, { amount: e.target.value })}
                                                    placeholder={bases[p.id] != null ? String(bases[p.id]) : '0'}
                                                    className={`w-28 text-right ${inputCls}`} />
                                            </div>
                                            <input type="text" value={d.note} disabled={locked}
                                                onChange={(e) => setDraft(p.id, { note: e.target.value })}
                                                placeholder={t('salary.otNote', { defaultValue: 'Overtime note…' })}
                                                className={`flex-1 min-w-[140px] ${inputCls}`} />
                                            {/* Bank / Cash */}
                                            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                {(['bank', 'cash'] as const).map(m => (
                                                    <button key={m} disabled={locked} onClick={() => setDraft(p.id, { method: m })}
                                                        className={`px-3 h-10 text-xs font-bold uppercase ${d.method === m ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'} disabled:opacity-60`}>
                                                        {m === 'bank' ? t('salary.bank', { defaultValue: 'Bank' }) : t('salary.cash', { defaultValue: 'Cash' })}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Actions */}
                                            {locked ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 px-2"><Check className="w-4 h-4" />{t('salary.paid', { defaultValue: 'Paid' })}</span>
                                            ) : (
                                                <button onClick={() => saveRow(p)} disabled={savingId === p.id}
                                                    className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                                                    <Save className="w-4 h-4" />{savingId === p.id ? '…' : (s ? t('salary.save', { defaultValue: 'Save' }) : t('salary.record', { defaultValue: 'Record' }))}
                                                </button>
                                            )}
                                            <button onClick={() => s && payslip({ salary_id: s.id }, p.id)} disabled={!s || payslipBusy === p.id}
                                                title={t('salary.payslip', { defaultValue: 'Payslip' })}
                                                className="inline-flex items-center justify-center size-10 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SalaryRoster;
