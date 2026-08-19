/**
 * 🏠 AGENCY HOME - Editorial Storyboard Layout
 *
 * Magazine-style dashboard with operational overview for agencies
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
import BasicCard from '../../components/dashboard/BasicCard';
import CTABanner, { type CTABannerProps } from '../../components/dashboard/CTABanner';

const AgencyHome: React.FC = () => {
    const { t, i18n } = useTranslation('common');
    // ✅ Use hook for metadata (AppHeader handles setPageHeader automatically)
    const { pageMeta } = usePageMetadata('agency-home');
    const [homeCards, setHomeCards] = useState<HomeCard[]>([]);

    useEffect(() => {
        const loadHomeCards = async () => {
            try {
                // Load home cards from database with current language
                const cards = await contentService.getHomeCards(i18n.language);
                // getHomeCards returns loose records: one cast to the card shape used by this page.
                const agencyCards = cards.filter((card) => card.role === 'agency') as unknown as HomeCard[];
                console.log('🏠 Agency Home Cards loaded:', agencyCards);
                setHomeCards(agencyCards || []);
            } catch (error) {
                console.error("Failed to load agency home cards:", error);
            }
        };
        loadHomeCards();
    }, [i18n.language]);

    // Separate cards by type from database
    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');

    // Left column: keep order from DB and include both nav and basic cards
    const leftCards = homeCards.filter(card =>
        card.card_type === 'nav' ||
        card.card_type === 'basic' ||
        card.slug === 'basic' ||
        card.card_slug === 'basic'
    );

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

                {/* ROW 2: MAIN CONTENT (Features + CTA) then SIDEBAR (Nav + Basic) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* MAIN CONTENT (9 col) - Features + CTA */}
                    <div className="lg:col-span-9 min-w-0">
                        {/* Features Grid */}
                        <FeatureCardsGrid cards={featureCards} />

                        {/* CTA Banners */}
                        <div className="space-y-6 mt-6">
                            {ctaBanners.map((card) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title || ''}
                                    description={card.description || card.card_description || ''}
                                    ctaLabel={card.link_label || t('fallback.viewMore')}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    variant={(card.variant || 'dark') as CTABannerProps['variant']}
                                    className="flex items-center justify-between gap-6"
                                />
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR (3 col) - Nav cards and Basic cards */}
                    <div className="lg:col-span-3 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                            {leftCards.map((card) => {
                                const path = card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#';
                                if (card.card_type === 'nav') {
                                    return (
                                        <div key={card.id}>
                                            <DashboardNavCard
                                                path={path}
                                                iconName={card.icon_name ?? undefined}
                                                label={card.title || card.card_title || ''}
                                                description={card.description || card.card_description || undefined}
                                                linkLabel={card.link_label ?? undefined}
                                            />
                                        </div>
                                    );
                                }

                                // default to BasicCard for 'basic' or other small items
                                return (
                                    <div key={card.id}>
                                        <BasicCard
                                            path={path}
                                            iconName={card.icon_name ?? undefined}
                                            label={card.title || card.card_title || ''}
                                            description={card.description || card.card_description || undefined}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyHome;
