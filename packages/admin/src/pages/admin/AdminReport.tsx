import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import { cn } from '../../lib/utils';
import {
    BarChart3,
    DollarSign,
    Users,
    TrendingUp,
    Briefcase,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    FileText
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';

interface AdminReportCard {
    id: string;
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
    details: string;
}

const AdminReport: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

    useEffect(() => {
        const fetchBookings = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .neq('status', 'cancelled');

            if (error) {
                console.error('Error fetching bookings:', error);
            }

            setBookings(data || []);
            setLoading(false);
        };
        fetchBookings();
    }, []);

    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        // Using same logic as AgencyReports, assuming commission_amount exists or defaulting to 0
        const totalCommission = bookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
        const totalPax = bookings.reduce((sum, b) => sum + (b.pax_count || 0), 0);

        return {
            totalBookings,
            totalRevenue,
            totalCommission,
            totalPax,
            avgBooking: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0
        };
    }, [bookings]);

    const METRICS: AdminReportCard[] = [
        {
            id: 'revenue',
            title: 'Total Revenue',
            value: `฿${stats.totalRevenue.toLocaleString()}`,
            change: '+12.5%', // Placeholder for now
            isPositive: true,
            icon: <DollarSign className="w-5 h-5" />,
            details: 'Total gross revenue from all bookings (excluding cancelled).'
        },
        {
            id: 'commission',
            title: 'Total Commissions',
            value: `฿${stats.totalCommission.toLocaleString()}`,
            change: '+5.4%',
            isPositive: true,
            icon: <Briefcase className="w-5 h-5" />,
            details: 'Total commissions payable to agencies.'
        },
        {
            id: 'bookings',
            title: 'Total Bookings',
            value: stats.totalBookings.toString(),
            change: '+8.1%',
            isPositive: true,
            icon: <Calendar className="w-5 h-5" />,
            details: 'Total number of active bookings.'
        },
        {
            id: 'pax',
            title: 'Total Pax',
            value: stats.totalPax.toString(),
            change: '+6.2%',
            isPositive: true,
            icon: <Users className="w-5 h-5" />,
            details: 'Total number of guests serviced.'
        }
    ];

    const currentMetric = METRICS.find(m => m.id === selectedMetric);

    if (loading) return <div className="p-8 text-center uppercase font-black text-gray-400">Loading Report...</div>;

    return (
        <PageContainer variant="wide">
            <PageMeta
                title="Admin Reports | Thai Akha Kitchen"
                description="Global performance overview."
            />
            <div className="grid grid-cols-12 gap-6 pb-20">

                {/* METRICS GRID */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {METRICS.map((metric) => (
                            <div
                                key={metric.id}
                                onClick={() => setSelectedMetric(metric.id)}
                                className={cn(
                                    "p-6 rounded-3xl border transition-all cursor-pointer",
                                    selectedMetric === metric.id
                                        ? "bg-white dark:bg-gray-800 border-brand-500 shadow-xl shadow-brand-500/10"
                                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-300"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center text-white",
                                        selectedMetric === metric.id ? "bg-brand-600 shadow-lg shadow-brand-500/40" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                    )}>
                                        {metric.icon}
                                    </div>
                                    <div className={cn("flex items-center gap-1 text-[10px] font-black", metric.isPositive ? "text-green-500" : "text-amber-500")}>
                                        {metric.isPositive ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />}
                                        {metric.change}
                                    </div>
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{metric.title}</h4>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{metric.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* CHART PLACEHOLDER */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white leading-none mb-1">Global Performance</h4>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Monthly comparison of {currentMetric?.title}</p>
                            </div>
                            <Badge variant="light" color="info">2026 Season</Badge>
                        </div>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-black/20">
                            <div className="text-center">
                                <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black uppercase text-gray-400">Interactive Analytics Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR: DETAILS */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase text-gray-900 dark:text-white leading-none mb-1">Metric Detail</h4>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global Analysis</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="p-6 bg-brand-50/50 dark:bg-brand-500/5 rounded-3xl border border-brand-100/50 dark:border-brand-500/10">
                                <h5 className="text-[10px] font-black uppercase tracking-wider text-brand-600 mb-2">Description</h5>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                    "{currentMetric?.details}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-2 leading-none">Monthly Summary (Mock)</h5>
                                {[
                                    { month: 'January 2026', total: '฿420,400' },
                                    { month: 'December 2025', total: '฿385,200' },
                                    { month: 'November 2025', total: '฿310,800' }
                                ].map((inv, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase text-gray-900 dark:text-white">{inv.month}</div>
                                                <div className="text-[10px] font-bold text-gray-400">{inv.total}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                            Export Full Report
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AdminReport;
