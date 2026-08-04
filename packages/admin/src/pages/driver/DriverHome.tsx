/**
 * 🏠 DRIVER HOME — card dashboard (same scheme as the other roles).
 * The declare-service / payout system moved to its own page (/driver-payout),
 * reached from the "Declare service" card.
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
import { contentService } from '@thaiakha/shared/services';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import FeatureCardsGrid from '../../components/dashboard/FeatureCardsGrid';
import DashboardNavCard from '../../components/dashboard/DashboardNavCard';
import BasicCard from '../../components/dashboard/BasicCard';
import CTABanner from '../../components/dashboard/CTABanner';

const DriverHome: React.FC = () => {
    const { t, i18n } = useTranslation('common');
    const { pageMeta } = usePageMetadata('driver-home');
    const [homeCards, setHomeCards] = useState<any[]>([]);

    useEffect(() => {
        const loadHomeCards = async () => {
            try {
                const cards = await contentService.getHomeCards(i18n.language);
                setHomeCards(cards.filter((card: any) => card.role === 'driver') || []);
            } catch (error) {
                console.error("Failed to load driver home cards:", error);
            }
        };
        loadHomeCards();
    }, [i18n.language]);

    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');
    const leftCards = homeCards.filter(card => card.card_type === 'nav' || card.card_type === 'basic');

    return (
        <PageContainer variant="wide">
            <div className="pb-[max(48px,env(safe-area-inset-bottom))]">
                {/* ROW 1: HERO (full width) */}
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

                {/* ROW 2: MAIN (features + CTA) + SIDEBAR (nav/basic) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-9 min-w-0">
                        <FeatureCardsGrid cards={featureCards} />
                        <div className="space-y-6 mt-6">
                            {ctaBanners.map((card: any) => (
                                <CTABanner
                                    key={card.id}
                                    title={card.title || card.card_title}
                                    description={card.description || card.card_description}
                                    ctaLabel={card.link_label || t('fallback.viewMore')}
                                    ctaPath={card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#'}
                                    variant={card.variant || 'dark'}
                                    className="flex items-center justify-between gap-6"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
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

export default DriverHome;
