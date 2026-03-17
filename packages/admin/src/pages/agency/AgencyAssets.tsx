import React from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
// Badge not needed here; header handled by PageHeaderWithBadge
import PageHeaderWithBadge from '../../components/common/PageHeaderWithBadge';
import {
    Download,
    Image as ImageIcon,
    Film,
    FileText,
    ExternalLink,
    Share2
} from 'lucide-react';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import PageMeta from '../../components/common/PageMeta';


const AgencyAssets: React.FC = () => {
    const { t } = useTranslation('pages');
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('agency-assets');

    const ASSETS = [
        { nameKey: 'agencyAssets.assetPhotos', type: 'ZIP/JPG', size: '2.4 GB', icon: <ImageIcon className="w-5 h-5" />, color: 'blue' },
        { nameKey: 'agencyAssets.assetVideo', type: 'MP4', size: '850 MB', icon: <Film className="w-5 h-5" />, color: 'amber' },
        { nameKey: 'agencyAssets.assetBrochure', type: 'PDF', size: '12 MB', icon: <FileText className="w-5 h-5" />, color: 'red' },
        { nameKey: 'agencyAssets.assetLogo', type: 'SVG/EPS', size: '4 MB', icon: <ImageIcon className="w-5 h-5" />, color: 'green' },
    ];

    return (
        <PageContainer variant="wide">
            <PageMeta
                title={pageMeta?.seoTitle || t('agencyAssets.titleFallback')}
                description={pageMeta?.description || t('agencyAssets.badgeFallback')}
            />
            <div className="pb-20 space-y-8">
                <div>
                    <PageHeaderWithBadge
                        badge={pageMeta?.badge || t('agencyAssets.badgeFallback')}
                        title={pageMeta?.titleMain || t('agencyAssets.titleFallback')}
                        titleHighlight={pageMeta?.titleHighlight}
                        description={pageMeta?.description}
                        alignment="left"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ASSETS.map((asset, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-64">
                            <div className="space-y-4">
                                <div className={`size-12 rounded-2xl bg-${asset.color}-50 dark:bg-${asset.color}-500/10 flex items-center justify-center text-${asset.color}-500 group-hover:scale-110 transition-transform`}>
                                    {asset.icon}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white tracking-tight leading-tight">{t(asset.nameKey)}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{asset.type} • {asset.size}</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-600 transition-colors border-t border-gray-50 dark:border-gray-800 pt-4">
                                <Download className="w-3 h-3" />
                                {t('agencyAssets.downloadFile')}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 relative h-80 rounded-[3rem] overflow-hidden group">
                        <img
                            src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
                            alt={t('agencyAssets.showcaseAlt')}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{t('agencyAssets.socialMediaTitle')}</h3>
                            <p className="text-white/70 text-sm max-w-sm mb-6 font-medium">{t('agencyAssets.socialMediaDesc')}</p>
                            <button className="w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-500 transition-colors">
                                {t('agencyAssets.accessFolder')} <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] p-10 border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center text-center space-y-4">
                        <Share2 className="w-10 h-10 text-brand-500" />
                        <h4 className="text-xl font-black uppercase italic text-gray-900 dark:text-white tracking-tight">{t('agencyAssets.needHelpTitle')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                            {t('agencyAssets.needHelpDesc')}
                        </p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:scale-105 active:scale-95 transition-all mb-4">
                            {t('agencyAssets.requestAssets')}
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyAssets;
