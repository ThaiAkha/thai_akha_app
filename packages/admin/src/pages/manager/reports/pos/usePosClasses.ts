/**
 * POS Classes - fatturazione giornaliera (fino a 4 fatture = sessione × tender): dati + azione.
 * Estratto da ManagerReports.tsx (#16) a comportamento invariato. La UI e' in PosClasses.tsx.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';

export interface PosRow { tender: 'cash' | 'card'; session: string; booking_id: string; sku: string | null; quantity: number; amount: number; line_type: string }
export interface PosBucket { key: string; session: string; tender: 'cash' | 'card'; bookings: number; items: number; amount: number }

const posKey = (day: string) => ['manager_reports', 'pos_day', day] as const;

// POS Classes: righe del giorno (gruppi incassati on-arrival, non ancora fatturati).
async function loadPosDay(day: string): Promise<PosRow[]> {
    const { data } = await supabase.rpc('get_pos_daily_invoice' as never, { p_day: day } as never);
    return (data as unknown as PosRow[]) ?? [];
}

export function usePosClasses(enabled: boolean) {
    const { t } = useTranslation('manager');
    const queryClient = useQueryClient();
    // POS Classes: giorno selezionato + righe del giorno (RPC) + busy.
    const [posDay, setPosDay] = useState(() => new Date().toISOString().split('T')[0]);
    const [posBusy, setPosBusy] = useState(false);

    const query = useQuery({ queryKey: posKey(posDay), queryFn: () => loadPosDay(posDay), enabled, staleTime: 0 });
    const posRows: PosRow[] | null = query.isFetching ? null : (query.data ?? null);
    const fetchPosDay = () => queryClient.invalidateQueries({ queryKey: posKey(posDay) });

    // 4 bucket sessione × tender (con conteggi e importo base).
    const posBuckets = useMemo<PosBucket[]>(() => {
        if (!posRows) return [];
        const m = new Map<string, PosBucket & { _bk: Set<string> }>();
        for (const r of posRows) {
            const key = `${r.session}|${r.tender}`;
            let g = m.get(key);
            if (!g) { g = { key, session: r.session, tender: r.tender, bookings: 0, items: 0, amount: 0, _bk: new Set() }; m.set(key, g); }
            g._bk.add(r.booking_id);
            g.items += Number(r.quantity) || 0;
            g.amount += Number(r.amount) || 0;
        }
        return Array.from(m.values()).map(g => ({ ...g, bookings: g._bk.size }))
            .sort((a, b) => (a.session === b.session ? a.tender.localeCompare(b.tender) : a.session.localeCompare(b.session)));
    }, [posRows]);

    // Genera le (fino a 4) fatture POS del giorno in Zoho.
    const handlePosInvoices = async () => {
        if (posBusy || posBuckets.length === 0) return;
        if (!window.confirm(t('reports.confirmPosInvoices', { defaultValue: 'Generate the POS invoices (cash/card · morning/evening) for {{day}}?', day: posDay }))) return;
        setPosBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('zoho-create-pos-invoice', { body: { day: posDay } });
            if (error) throw error;
            const res = data as { success: boolean; skipped?: boolean; message?: string; invoices?: Array<{ invoice_number?: string }> };
            if (!res.success) throw new Error(res.message || 'Failed');
            await fetchPosDay();
            alert(res.skipped ? t('reports.posNothing', { defaultValue: 'Nothing to invoice for this day.' })
                : t('reports.posOk', { defaultValue: '{{n}} invoice(s) created in Zoho.', n: res.invoices?.length ?? 0 }));
        } catch (err) {
            alert(t('driverPayouts.errorGeneric', { defaultValue: 'Error' }) + ': ' + (err instanceof Error ? err.message : ''));
        } finally { setPosBusy(false); }
    };

    return { posDay, setPosDay, posRows, posBuckets, posBusy, handlePosInvoices };
}

export type PosClassesState = ReturnType<typeof usePosClasses>;
