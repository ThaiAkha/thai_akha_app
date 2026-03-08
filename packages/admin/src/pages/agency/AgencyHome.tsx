/**
 * 🏠 AGENCY HOME - Editorial Storyboard Layout
 *
 * Magazine-style dashboard with operational overview for agencies
 * Features, navigation cards, and quick booking CTA
 */

import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { contentService } from '../../services/content.service';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import FeatureCardsGrid from '../../components/dashboard/FeatureCardsGrid';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';
import BasicCard from '../../components/dashboard/BasicCard';
import CTABanner from '../../components/dashboard/CTABanner';

const AgencyHome: React.FC = () => {
    // ✅ Use hook for metadata (AppHeader handles setPageHeader automatically)
    const { pageMeta } = usePageMetadata('agency-home');
    const [homeCards, setHomeCards] = useState<any[]>([]);

    useEffect(() => {
        const loadHomeCards = async () => {
            try {
                // Load home cards from database (filtered for agency role)
                const cards = await contentService.getHomeCards();
                const agencyCards = cards.filter((card: any) => card.role === 'agency');
                console.log('🏠 Agency Home Cards loaded:', agencyCards);
                setHomeCards(agencyCards || []);
            } catch (error) {
                console.error("Failed to load agency home cards:", error);
            }
        };
        loadHomeCards();
    }, []);

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
                <div className="grid grid-cols-12 gap-8">
                    {/* MAIN CONTENT (9 col) - Features + CTA */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                        {/* Features Grid */}
                        <FeatureCardsGrid cards={featureCards} />

                        {/* CTA Banners */}
                        <div className="space-y-6 mt-6">
                            {ctaBanners.map((card: any) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title}
                                    description={card.description || card.card_description}
                                    ctaLabel={card.link_label || 'View More'}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    variant={card.variant || 'dark'}
                                    className="flex items-center justify-between gap-6 p-13"
                                />
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR (3 col) - Nav cards and Basic cards */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                        <div className="flex flex-col gap-6">
                            {leftCards.map((card: any) => {
                                const path = card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#';
                                if (card.card_type === 'nav') {
                                    return (
                                        <div key={card.id}>
                                            <DashboardNavCard
                                                path={path}
                                                iconName={card.icon_name}
                                                label={card.title || card.card_title}
                                                description={card.description || card.card_description}
                                                linkLabel={card.link_label}
                                            />
                                        </div>
                                    );
                                }

                                // default to BasicCard for 'basic' or other small items
                                return (
                                    <div key={card.id}>
                                        <BasicCard
                                            path={path}
                                            iconName={card.icon_name}
                                            label={card.title || card.card_title}
                                            description={card.description || card.card_description}
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
