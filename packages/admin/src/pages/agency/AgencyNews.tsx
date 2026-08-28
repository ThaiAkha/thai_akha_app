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
import { formatDateByLanguage } from '../../lib/dateFormatter';
import { Heading, Paragraph } from '../../components/typography';

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
    const { t, i18n } = useTranslation('pages');
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
                setNews(latestNews as unknown as Article[]);
            } catch (error) {
                console.error('Error loading news:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const formatDate = (dateStr: string) => {
        return formatDateByLanguage(dateStr, i18n.language, {
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
                                        className="absolute top-4 left-4 px-4 py-1.5 text-xs uppercase font-black tracking-widest"
                                    >
                                        {article.category}
                                    </Badge>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-3">
                                <Heading level="h4" className="line-clamp-2 font-black uppercase tracking-tighter leading-7 group-hover:text-primary-600 transition-colors">
                                    {article.title}
                                </Heading>

                                <Paragraph size="sm" color="secondary" className="line-clamp-3 font-medium leading-5">
                                    {article.content}
                                </Paragraph>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50 dark:border-gray-800/50">
                                    <div className="flex items-center gap-4 text-sub">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{formatDate(article.created_at)}</span>
                                        </div>
                                        {article.reading_time && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{article.reading_time}</span>
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
                        <Heading level="h4" color="muted" className="font-black uppercase leading-7">{t('agencyNews.noNews')}</Heading>
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
