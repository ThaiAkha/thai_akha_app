/**
 * 📊 LOGISTIC REPORTS — read-only archive of logistics market runs.
 * Moved out of the "Shopping List" (MarketShop) logistic view: here you consult
 * past/saved logistic reports (date · status · items · total). Read-only.
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';
import { History, ChevronDown, Plus, Pencil } from 'lucide-react';
import Button from '../../components/ui/button/Button';
import PageContainer from '../../components/layout/PageContainer';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import Badge from '../../components/ui/badge/Badge';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { useAuth } from '../../context/AuthContext';
import { Heading, Paragraph, SectionTitle } from '../../components/typography';

interface RunItem { id: string; name: string; unit?: string; quantity?: number; price?: number; actual_price?: number; }
interface MarketRun {
    id: string;
    run_date: string;
    status: string;
    total_cost: number;
    items_snapshot: RunItem[];
    worker: { name: string | null } | { name: string | null }[] | null; // authors via worker_id
}
const shopperOf = (r: MarketRun): string | null => (Array.isArray(r.worker) ? r.worker[0]?.name : r.worker?.name) ?? null;

// Role-aware market reports: kitchen → teacher runs, logistics → logistics runs.
// Shared by /logistic-reports and /kitchen-reports.
const LogisticReports: React.FC = () => {
    const { t } = useTranslation('market');
    const { user } = useAuth();
    const navigate = useNavigate();
    const scope: 'teacher' | 'logistics' = user?.role === 'kitchen' ? 'teacher' : 'logistics';
    const { pageMeta } = usePageMetadata(scope === 'teacher' ? 'kitchen-reports' : 'logistic-reports');
    const [runs, setRuns] = useState<MarketRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);

    const todayISO = new Date().toISOString().split('T')[0];
    const [planDate, setPlanDate] = useState(todayISO);
    // New Plan / Edit launch the planner in the Shopping List page (via sessionStorage).
    const launchNew = (date: string) => {
        sessionStorage.setItem('market_launch', JSON.stringify({ action: 'new', date }));
        navigate('/market-shop');
    };
    const launchEdit = (run_id: string) => {
        sessionStorage.setItem('market_launch', JSON.stringify({ action: 'edit', run_id }));
        navigate('/market-shop');
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('market_runs')
                .select('id, run_date, status, total_cost, items_snapshot, worker:authors!worker_id(name)')
                .eq('shopper_role', scope)
                .order('run_date', { ascending: false });
            if (error) console.error('Failed to load logistic reports:', error);
            setRuns((data as unknown as MarketRun[]) || []);
            setLoading(false);
        };
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loads once on mount with the scope resolved at that time
    }, []);

    return (
        <PageContainer variant="wide">
            <div>
                {pageMeta && (
                    <WelcomeHero
                        badge={pageMeta.badge}
                        titleMain={pageMeta.titleMain}
                        titleHighlight={pageMeta.titleHighlight}
                        description={pageMeta.description}
                        imageUrl={pageMeta.imageUrl}
                        icon={pageMeta.icon}
                    />
                )}

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mt-2">
                    <div className="flex items-center justify-between gap-3 px-6 h-16 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="size-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0"><History className="w-5 h-5" /></div>
                            <Heading level="h4">{t('table.reportArchives', { defaultValue: 'Report archive' })}</Heading>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <input
                                type="date"
                                value={planDate}
                                onChange={(e) => setPlanDate(e.target.value)}
                                className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            />
                            <Button variant="primary" size="sm" startIcon={<Plus className="w-4 h-4" />} onClick={() => launchNew(planDate)}>{t('buttons.newPlan', { defaultValue: 'New plan' })}</Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center"><SectionTitle className="text-gray-400">{t('messages.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
                    ) : runs.length === 0 ? (
                        <div className="py-20 text-center"><SectionTitle className="text-gray-400">{t('empty.noHistory', { defaultValue: 'No reports yet.' })}</SectionTitle></div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase font-black text-xs">
                                <tr>
                                    <th className="px-6 py-4">{t('table.date', { defaultValue: 'Date' })}</th>
                                    <th className="px-6 py-4">{t('table.shopper', { defaultValue: 'Shopper' })}</th>
                                    <th className="px-6 py-4">{t('table.status', { defaultValue: 'Status' })}</th>
                                    <th className="px-6 py-4 text-center">{t('table.items', { defaultValue: 'Items' })}</th>
                                    <th className="px-6 py-4 text-right">{t('table.totalCost', { defaultValue: 'Total' })}</th>
                                    <th className="px-6 py-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {runs.map(run => {
                                    const items = Array.isArray(run.items_snapshot) ? run.items_snapshot : [];
                                    const isOpen = openId === run.id;
                                    return (
                                        <React.Fragment key={run.id}>
                                            <tr
                                                onClick={() => setOpenId(isOpen ? null : run.id)}
                                                className={cn('cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50', isOpen && 'bg-primary-50/50 dark:bg-primary-900/10')}
                                            >
                                                <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{run.run_date}</td>
                                                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">{shopperOf(run) ?? <span className="text-gray-300 dark:text-gray-600">-</span>}</td>
                                                <td className="px-6 py-4"><Badge variant="light" color="light" size="sm" className="uppercase">{run.status}</Badge></td>
                                                <td className="px-6 py-4 text-center font-medium">{items.length}</td>
                                                <td className="px-6 py-4 text-right font-mono font-black text-primary-600 dark:text-primary-400">{Number(run.total_cost || 0).toLocaleString()} <span className="text-xs text-gray-400">THB</span></td>
                                                <td className="px-6 py-4 text-gray-400"><ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} /></td>
                                            </tr>
                                            {isOpen && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 pb-5 pt-1 bg-gray-50/50 dark:bg-gray-800/20">
                                                        <div className="space-y-2">
                                                            {items.length === 0 ? (
                                                                <Paragraph size="sm" color="muted">{t('empty.noContent', { defaultValue: 'No items.' })}</Paragraph>
                                                            ) : items.map((it, i) => (
                                                                <div key={it.id || i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                                    <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 truncate">{it.name}</span>
                                                                    <span className="font-mono text-xs font-black text-gray-900 dark:text-white">{Number(it.actual_price ?? it.price ?? 0).toLocaleString()} ฿</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {!['completed', 'expensed'].includes(run.status) && (
                                                            <div className="pt-3">
                                                                <Button variant="outline" size="sm" startIcon={<Pencil className="w-4 h-4" />} onClick={() => launchEdit(run.id)}>{t('buttons.editReport', { defaultValue: 'Edit in planner' })}</Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default LogisticReports;
