import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { WorkerRole } from '@thaiakha/shared/types/workers.types';
import { GROUP_ORDER, EMPTY_DRAFT, netOfDraft, num, thisMonth } from './types';
import type { AuthorRow, Draft, Person, SalaryRow } from './types';

/** Stringa per un input controllato: 0 e' rumore visivo, si mostra vuoto. */
const amountStr = (v: number | null | undefined): string => (v ? String(v) : '');

export function useSalaryRoster() {
    const [period, setPeriod] = useState<string>(thisMonth());
    const [people, setPeople] = useState<Person[] | null>(null);
    const [bases, setBases] = useState<Record<string, number | null>>({});
    // staff_details.zoho_vendor_id valorizzato → la riga esce dai gruppi: spesa Zoho individuale.
    const [individualIds, setIndividualIds] = useState<Set<string>>(new Set());
    const [baseVisible, setBaseVisible] = useState<boolean>(true);
    const [salaries, setSalaries] = useState<Record<string, SalaryRow>>({});
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [payslipBusy, setPayslipBusy] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // People + base: una volta. authors e' public-read, staff_details e' admin/manager only.
    const fetchPeople = useCallback(async () => {
        const { data, error } = await supabase
            .from('authors')
            .select('id, name, display_order, worker_roles(role, is_primary), avatar:media_assets!avatar_asset_id(image_url)')
            .eq('is_active', true).eq('is_organization', false).eq('is_ai_agent', false)
            .order('display_order');
        if (error) { setLoadError(error.message); setPeople([]); return; }
        const list: Person[] = ((data ?? []) as unknown as AuthorRow[]).map(r => {
            const roles = (r.worker_roles ?? []).map(x => x.role as WorkerRole);
            const primary = (r.worker_roles ?? []).find(x => x.is_primary)?.role as WorkerRole | undefined;
            const av = Array.isArray(r.avatar) ? r.avatar[0] : r.avatar;
            return {
                id: r.id, name: r.name, avatarUrl: av?.image_url ?? null,
                displayOrder: r.display_order ?? 999,
                primaryRole: primary ?? roles[0] ?? 'unassigned', roles,
            };
        });
        setPeople(list);

        // Base salary: con RLS un non admin/manager non vede nulla. E' VOLUTO:
        // mai bypassare, si mostra solo un avviso pulito.
        const { data: sd, error: sdErr } = await supabase.from('staff_details').select('worker_id, salary_thb, zoho_vendor_id');
        if (sdErr || !sd || sd.length === 0) { setBaseVisible(false); setBases({}); setIndividualIds(new Set()); return; }
        setBaseVisible(true);
        const m: Record<string, number | null> = {};
        const ind = new Set<string>();
        for (const r of sd) {
            m[r.worker_id] = r.salary_thb;
            if (r.zoho_vendor_id) ind.add(r.worker_id);
        }
        setBases(m);
        setIndividualIds(ind);
    }, []);

    // Righe del mese. net_amount e' generata dal DB: si legge, non si scrive.
    const fetchSalaries = useCallback(async (p: string, list: Person[]) => {
        if (list.length === 0) { setSalaries({}); return; }
        const { data, error } = await supabase
            .from('staff_salaries')
            .select('id, employee_id, base_amount, overtime_amount, ssf_amount, other_deduction, net_amount, pay_method, status, zoho_expense_id')
            .eq('period', p)
            .in('employee_id', list.map(x => x.id));
        if (error) { setLoadError(error.message); return; }
        const m: Record<string, SalaryRow> = {};
        for (const r of (data ?? []) as SalaryRow[]) m[r.employee_id] = r;
        setSalaries(m);
    }, []);

    useEffect(() => { fetchPeople(); }, [fetchPeople]);
    useEffect(() => { if (people) fetchSalaries(period, people); }, [period, people, fetchSalaries]);

    // I draft seguono le righe caricate; senza riga, la base prefilla da staff_details.
    useEffect(() => {
        if (!people) return;
        const d: Record<string, Draft> = {};
        for (const p of people) {
            const s = salaries[p.id];
            d[p.id] = s
                ? {
                    base: amountStr(s.base_amount),
                    overtime: amountStr(s.overtime_amount),
                    ssf: amountStr(s.ssf_amount),
                    deduction: amountStr(s.other_deduction),
                    method: s.pay_method === 'cash' ? 'cash' : 'bank',
                }
                : { ...EMPTY_DRAFT, base: bases[p.id] != null ? String(bases[p.id]) : '' };
        }
        setDrafts(d);
    }, [people, salaries, bases]);

    const groups = useMemo(() => {
        const by = new Map<Person['primaryRole'], Person[]>();
        for (const p of people ?? []) { if (!by.has(p.primaryRole)) by.set(p.primaryRole, []); by.get(p.primaryRole)!.push(p); }
        return GROUP_ORDER.filter(g => by.has(g)).map(g => ({ role: g, people: by.get(g)!.sort((a, b) => a.displayOrder - b.displayOrder) }));
    }, [people]);

    // Riepilogo live sui draft: e' quello che si paga, PRIMA di generare la spesa.
    const summary = useMemo(() => {
        let base = 0, overtime = 0, ssf = 0, deduction = 0, bank = 0, cash = 0, staff = 0;
        for (const p of people ?? []) {
            if (p.primaryRole === 'driver') continue;   // pagati a corsa, non qui
            const d = drafts[p.id];
            if (!d) continue;
            const net = netOfDraft(d);
            if (net === 0 && !d.base) continue;
            staff += 1;
            base += num(d.base); overtime += num(d.overtime); ssf += num(d.ssf); deduction += num(d.deduction);
            if (d.method === 'cash') cash += net; else bank += net;
        }
        return { base, overtime, ssf, deduction, bank, cash, net: bank + cash, staff };
    }, [people, drafts]);

    const setDraft = useCallback((id: string, patch: Partial<Draft>) => {
        setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_DRAFT), ...patch } }));
    }, []);

    // Registra il mese per una persona (upsert su employee_id+period).
    const saveRow = useCallback(async (personId: string) => {
        const d = drafts[personId];
        if (!d || savingId) return;
        setSavingId(personId);
        setActionError(null);
        try {
            const { error } = await supabase.from('staff_salaries').upsert({
                employee_id: personId, period,
                base_amount: num(d.base),
                overtime_amount: num(d.overtime),
                ssf_amount: num(d.ssf),
                other_deduction: num(d.deduction),
                pay_method: d.method,
            }, { onConflict: 'employee_id,period' });
            if (error) throw error;
            await fetchSalaries(period, people ?? []);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : String(err));
        } finally { setSavingId(null); }
    }, [drafts, savingId, period, people, fetchSalaries]);

    // Spese Zoho del mese: individuali (chi ha un vendor proprio) + le 2 di gruppo bank/cash.
    const createExpenses = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        setActionError(null);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-salary-expense', { body: { period } });
            if (error) throw error;
            const res = data as { success?: boolean; failures?: { method: string; message: string; employee?: string }[] };
            if (res.failures?.length) {
                setActionError(res.failures.map(f => `${f.employee ? `${f.employee} (${f.method})` : f.method}: ${f.message}`).join(' · '));
            }
            await fetchSalaries(period, people ?? []);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : String(err));
        } finally { setBusy(false); }
    }, [busy, period, people, fetchSalaries]);

    // Payslip: uno (salary_id) o tutto il mese (period → PDF multipagina).
    const payslip = useCallback(async (body: { salary_id?: string; period?: string }, key: string) => {
        if (payslipBusy) return;
        setPayslipBusy(key);
        setActionError(null);
        try {
            const { data, error } = await supabase.functions.invoke('render-report', { body: { report: 'salary_payslip', ...body } });
            if (error) throw error;
            const url = URL.createObjectURL(data as Blob);
            const f = document.createElement('iframe');
            f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
            f.src = url;
            f.onload = () => { f.contentWindow?.focus(); f.contentWindow?.print(); };
            document.body.appendChild(f);
            setTimeout(() => { f.remove(); URL.revokeObjectURL(url); }, 60000);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : String(err));
        } finally { setPayslipBusy(null); }
    }, [payslipBusy]);

    return {
        period, setPeriod, people, bases, individualIds, baseVisible,
        salaries, drafts, setDraft, groups, summary,
        savingId, saveRow, busy, createExpenses, payslipBusy, payslip,
        loadError, actionError, anySaved: Object.keys(salaries).length > 0,
    };
}
