/**
 * 🏠 ADMIN HOME - Editorial Storyboard Layout
 *
 * Magazine-style dashboard with feature cards and CTA banners
 * Inspired by Stitch "Editorial Storyboard V3" design
 */

import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { contentService } from '@thaiakha/shared/services';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import FeatureCardsGrid from '../../components/dashboard/FeatureCardsGrid';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';
import CTABanner from '../../components/dashboard/CTABanner';

const AdminHome: React.FC = () => {
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('admin-home');
    const [homeCards, setHomeCards] = useState<any[]>([]);

    useEffect(() => {
        const loadHomeCards = async () => {
            try {
                // Load home cards from database
                const cards = await contentService.getHomeCards();
                // Filter cards by role: only show admin cards for admin users
                const roleCards = cards.filter(c => c.role === 'admin');
                console.log('🏠 Admin Home Cards loaded:', roleCards);
                setHomeCards(roleCards || []);
            } catch (error) {
                console.error("Failed to load admin home cards:", error);
            }
        };
        loadHomeCards();
    }, []);

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
                <div className="grid grid-cols-12 gap-8">
                    {/* MAIN CONTENT (9 col) - Features + CTA */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                        {/* Features Grid */}
                        <FeatureCardsGrid cards={featureCards} />

                        {/* CTA Banners */}
                        <div className="space-y-6">
                            {ctaBanners.map((card: any) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title}
                                    description={card.description || card.card_description}
                                    ctaLabel={card.cta_label || card.link_label || 'View More'}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    variant={card.variant || 'dark'}
                                    className="flex items-center justify-between gap-6 p-13"
                                />
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR (3 col) - Nav cards */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                        <div className="flex flex-col gap-8">
                            {navCards.map((card: any) => (
                                <div key={card.id}>
                                    <DashboardNavCard
                                        path={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                        iconName={card.icon_name}
                                        label={card.title || card.card_title}
                                        description={card.description || card.card_description}
                                        linkLabel={card.link_label}
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

export default AdminHome;
