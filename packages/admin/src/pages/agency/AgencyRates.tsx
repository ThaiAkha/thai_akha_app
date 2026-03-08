import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/ui/badge/Badge';
import PageHeaderWithBadge from '../../components/common/PageHeaderWithBadge';
import {
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import PageMeta from '../../components/common/PageMeta';


const AgencyRates: React.FC = () => {
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('agency-rates');

    const RATES = [
        { name: 'Morning Class', rack: '1,400 THB', net: '1,120 THB', commission: '20%' },
        { name: 'Evening Class', rack: '1,300 THB', net: '1,040 THB', commission: '20%' },
        { name: 'Full Day Package', rack: '2,500 THB', net: '2,000 THB', commission: '20%' },
        { name: 'Private Session (1-4pax)', rack: '8,000 THB', net: '6,400 THB', commission: '20%' },
    ];

    return (
        <PageContainer variant="wide">
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />
            <div className="pb-20 space-y-8">
                <div>
                    <PageHeaderWithBadge
                        badge={pageMeta?.badge || 'CONFIDENTIAL'}
                        title={pageMeta?.titleMain || 'Contract Rates 2026'}
                        titleHighlight={pageMeta?.titleHighlight}
                        description={pageMeta?.description}
                        alignment="left"
                    />
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Class Type</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Rack Rate</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Partner Net</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {RATES.map((rate, i) => (
                                    <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-6 font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{rate.name}</td>
                                        <td className="py-6 text-sm text-gray-400 line-through">{rate.rack}</td>
                                        <td className="py-6 text-xl font-black text-brand-600 dark:text-brand-400">{rate.net}</td>
                                        <td className="py-6">
                                            <Badge variant="light" color="info" size="sm">{rate.commission}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2rem] border border-brand-100 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-500/5 space-y-4">
                        <ShieldCheck className="w-8 h-8 text-brand-600" />
                        <h5 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">Price Guarantee</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Seasonal rates are locked for all contracts signed before March 2026. Any price adjustments will be notified 60 days in advance.
                        </p>
                    </div>
                    <div className="p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                        <CreditCard className="w-8 h-8 text-amber-500" />
                        <h5 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">Payment Terms</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Net rates are payable via monthly invoice. Payments should be settled within the first 5 working days of the following month.
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyRates;
