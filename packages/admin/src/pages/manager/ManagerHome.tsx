/**
 * 🏠 MANAGER HOME - Editorial Storyboard Layout
 *
 * Magazine-style dashboard with operational overview
 * Features, navigation cards, and quick booking CTA
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
import { contentService } from '@thaiakha/shared/services';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import FeatureCardsGrid, { type HomeCard } from '../../components/dashboard/FeatureCardsGrid';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';
import CTABanner, { type CTABannerProps } from '../../components/dashboard/CTABanner';

const ManagerHome: React.FC = () => {
    const { t, i18n } = useTranslation('common');
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('manager-home');
    const [homeCards, setHomeCards] = useState<HomeCard[]>([]);

    useEffect(() => {
        const loadHomeCards = async () => {
            try {
                // Load home cards from database with current language
                const cards = await contentService.getHomeCards(i18n.language);
                // getHomeCards returns loose records: one cast to the card shape used by this page.
                const managerCards = cards.filter((card) => card.role === 'manager') as unknown as HomeCard[];
                console.log('🏠 Manager Home Cards loaded:', managerCards);
                setHomeCards(managerCards || []);
            } catch (error) {
                console.error("Failed to load manager home cards:", error);
            }
        };
        loadHomeCards();
    }, [i18n.language]);

    // Separate cards by type from database
    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const navCards = homeCards.filter(card => card.card_type === 'nav');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');

    return (
        <PageContainer variant="wide">
            <div>
                {/* ROW 1: HERO SECTION (full width) */}
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

                {/* ROW 2: MAIN CONTENT + SIDEBAR (inverted columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* MAIN CONTENT (9 col) - Features + CTA */}
                    <div className="lg:col-span-9 min-w-0">
                        {/* Features Grid */}
                        <FeatureCardsGrid cards={featureCards} />

                        {/* CTA Banners */}
                        <div className="space-y-6">
                            {ctaBanners.map((card) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title || ''}
                                    description={card.description || card.card_description || ''}
                                    ctaLabel={card.cta_label || card.link_label || t('actions.viewMore')}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    variant={(card.variant || 'dark') as CTABannerProps['variant']}
                                    className="flex items-center justify-between gap-6"
                                />
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR (3 col) - Nav cards */}
                    <div className="lg:col-span-3 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                            {navCards.map((card) => (
                                <div key={card.id}>
                                    <DashboardNavCard
                                        path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                        iconName={card.icon_name ?? undefined}
                                        label={card.title || card.card_title || ''}
                                        description={card.description || card.card_description || undefined}
                                        linkLabel={card.link_label ?? undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default ManagerHome;
