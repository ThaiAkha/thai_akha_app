import React from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
import PageHeaderWithBadge from '../../components/common/PageHeaderWithBadge';
import {
    Gavel,
    Clock,
    AlertCircle,
    Ban,
    CheckCircle2
} from 'lucide-react';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import PageMeta from '../../components/common/PageMeta';


const AgencyTerms: React.FC = () => {
    const { t } = useTranslation('pages');
    // ✅ AppHeader handles setPageHeader automatically
    // Hook only for metadata used in rendering (PageHeaderWithBadge)
    const { pageMeta } = usePageMetadata('agency-terms');

    return (
        <PageContainer variant="wide">
            <PageMeta
                title={pageMeta?.seoTitle || t('agencyTerms.metaTitle')}
                description={pageMeta?.description || t('agencyTerms.metaDesc')}
            />
            <div className="pb-20 space-y-8">
                <div>
                    <PageHeaderWithBadge
                        badge={pageMeta?.badge || t('agencyTerms.badgeFallback')}
                        title={pageMeta?.titleMain || t('agencyTerms.titleFallback')}
                        titleHighlight={pageMeta?.titleHighlight}
                        description={pageMeta?.description}
                        alignment="left"
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-10 shadow-sm space-y-8">
                        {/* CANCELLATION */}
                        <div className="flex gap-6">
                            <div className="size-12 shrink-0 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                                <Ban className="w-6 h-6" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">{t('agencyTerms.cancellationTitle')}</h4>
                                <ul className="space-y-2">
                                    {[
                                        t('agencyTerms.cancellationItem1'),
                                        t('agencyTerms.cancellationItem2'),
                                        t('agencyTerms.cancellationItem3'),
                                        t('agencyTerms.cancellationItem4'),
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="mt-1 size-1.5 rounded-full bg-red-400 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <hr className="border-gray-50 dark:border-gray-800" />

                        {/* PICKUP */}
                        <div className="flex gap-6">
                            <div className="size-12 shrink-0 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">{t('agencyTerms.logisticsTitle')}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {t('agencyTerms.logisticsDesc')}
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-50 dark:border-gray-800" />

                        {/* PAYMENT */}
                        <div className="flex gap-6">
                            <div className="size-12 shrink-0 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                                <Gavel className="w-6 h-6" />
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">{t('agencyTerms.invoicingTitle')}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {t('agencyTerms.invoicingDesc')}
                                </p>
                                <div className="flex items-center gap-2 mt-4">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('agencyTerms.verified')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-brand-500/5 border border-brand-500/20 rounded-2xl flex items-center gap-4">
                        <AlertCircle className="w-6 h-6 text-brand-500 shrink-0" />
                        <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                            {t('agencyTerms.customContract')}
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyTerms;
