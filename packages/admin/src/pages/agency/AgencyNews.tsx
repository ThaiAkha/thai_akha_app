import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { contentService } from '@thaiakha/shared/services';
import Badge from '../../components/ui/badge/Badge';
import { Clock, Calendar, ChevronRight, Newspaper } from 'lucide-react';
import ArticleModal from '../../components/agency/ArticleModal';
import PageMeta from '../../components/common/PageMeta';

interface Article {
    id: string;
    title: string;
    content: string;
    cover_image_url?: string;
    category?: string;
    created_at: string;
    author?: string;
    reading_time?: string;
}

const AgencyNews: React.FC = () => {
    const { t } = useTranslation('pages');
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('agency-news');
    const [news, setNews] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {

                // Load News Articles
                const latestNews = await contentService.getLatestNews();
                setNews(latestNews);
            } catch (error) {
                console.error('Error loading news:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <PageContainer variant="wide">
            <PageMeta
                title={pageMeta?.seoTitle || t('agencyNews.metaTitle')}
                description={pageMeta?.description || t('agencyNews.metaDesc')}
                ogImage={pageMeta?.ogImage}
                robots={pageMeta?.robots}
                canonicalUrl={pageMeta?.canonicalUrl}
                ogType={pageMeta?.ogType}
                twitterCard={pageMeta?.twitterCard}
            />

            {/* Hero Banner (from CMS metadata) */}
            {pageMeta && (
                <WelcomeHero
                    badge={pageMeta.badge || t('agencyNews.badgeFallback')}
                    titleMain={pageMeta.titleMain || t('agencyNews.titleFallback')}
                    titleHighlight={pageMeta.titleHighlight}
                    description={pageMeta.description}
                    imageUrl={pageMeta.imageUrl}
                    className="mb-8"
                />
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {loading ? (
                    // Skeleton Loading
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse space-y-4">
                            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                        </div>
                    ))
                ) : news.length > 0 ? (
                    news.map((article) => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="group relative bg-white dark:bg-white/[0.03] rounded-[32px] border border-gray-100 dark:border-gray-800 p-2 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10"
                        >
                            {/* Card Image Wrapper */}
                            <div className="relative aspect-video rounded-[26px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {article.cover_image_url ? (
                                    <img
                                        src={article.cover_image_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Newspaper className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Float Badge */}
                                {article.category && (
                                    <Badge
                                        variant="solid"
                                        color="primary"
                                        className="absolute top-4 left-4 px-4 py-1.5 text-[10px] uppercase font-black tracking-widest"
                                    >
                                        {article.category}
                                    </Badge>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-3">
                                <h3 className="line-clamp-2 text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">
                                    {article.title}
                                </h3>

                                <p className="line-clamp-3 text-sm font-medium text-gray-400 leading-relaxed">
                                    {article.content}
                                </p>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50 dark:border-gray-800/50">
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(article.created_at)}</span>
                                        </div>
                                        {article.reading_time && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{article.reading_time}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="size-8 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <Newspaper className="w-20 h-20 mx-auto opacity-10 mb-4" />
                        <h4 className="text-xl font-black uppercase text-gray-300">{t('agencyNews.noNews')}</h4>
                    </div>
                )}
            </div>

            {/* Modal Detail */}
            <ArticleModal
                article={selectedArticle}
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
            />
        </PageContainer>
    );
};

export default AgencyNews;
