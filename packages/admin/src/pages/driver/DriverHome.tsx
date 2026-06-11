/**
 * 🏠 DRIVER HOME - Editorial Storyboard Layout
 *
 * Database-driven dashboard for drivers
 * Features, navigation cards, and quick actions from contentService
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
import { cn } from '@thaiakha/shared/lib/utils';
// BYPASS-PAYOUT (temporaneo) — vista form iniezione manuale payout, vedi _temp_driver_payout/
import DriverPayoutForm, { type PayoutEditTarget } from './DriverPayoutForm';
import DriverPayoutDashboard from './DriverPayoutDashboard';

const DriverHome: React.FC = () => {
    const { t, i18n } = useTranslation('common');
    // ✅ AppHeader handles setPageHeader automatically
    const { pageMeta } = usePageMetadata('driver-home');
    const [homeCards, setHomeCards] = useState<any[]>([]);
    // BYPASS-PAYOUT (temporaneo) — toggle tra form dichiarazione (default) e dashboard payout
    const [view, setView] = useState<'payout' | 'dashboard'>('payout');
    // BYPASS-PAYOUT — modifica da card: la dashboard passa il target, il form si apre precompilato
    const [editTarget, setEditTarget] = useState<PayoutEditTarget | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const openEdit = (target: PayoutEditTarget) => { setEditTarget(target); setView('payout'); };
    const goTab = (next: 'payout' | 'dashboard') => {
        if (next === 'payout') setEditTarget(null); // tab = form nuovo (oggi)
        setView(next);
    };

    useEffect(() => {
        const loadHomeCards = async () => {
            try {
                // Load home cards from database with current language
                const cards = await contentService.getHomeCards(i18n.language);
                const driverCards = cards.filter((card: any) => card.role === 'driver');
                console.log('🏠 Driver Home Cards loaded:', driverCards);
                setHomeCards(driverCards || []);
            } catch (error) {
                console.error("Failed to load driver home cards:", error);
            }
        };
        loadHomeCards();
    }, [i18n.language]);

    // Separate cards by type from database
    const featureCards = homeCards.filter(card => card.card_type === 'feature');
    const ctaBanners = homeCards.filter(card => card.card_type === 'cta');

    // Left column: nav and basic cards
    const leftCards = homeCards.filter(card =>
        card.card_type === 'nav' ||
        card.card_type === 'basic' ||
        card.slug === 'basic' ||
        card.card_slug === 'basic'
    );

    return (
        <PageContainer variant="wide">
            <div className="pb-[max(48px,env(safe-area-inset-bottom))]">
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

                {/* BYPASS-PAYOUT (temporaneo) — tab centrali: Dichiara servizio (default) / Dashboard */}
                <div className="my-[var(--space-fluid-m,1.5rem)] flex justify-center">
                    <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700/50 p-1 [gap:0.25rem]">
                        {([
                            { key: 'payout', label: 'Dichiara servizio' },
                            { key: 'dashboard', label: 'Dashboard' },
                        ] as const).map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => goTab(tab.key)}
                                className={cn(
                                    'px-4 h-10 rounded-lg text-sm font-bold transition-all duration-300',
                                    view === tab.key
                                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-green-600'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {view === 'payout' && (
                    <div className="flex justify-center">
                        <DriverPayoutForm
                            editTarget={editTarget}
                            onDone={() => setRefreshKey((k) => k + 1)}
                        />
                    </div>
                )}

                {/* BYPASS-PAYOUT — vista payout settimanale (sopra le card storiche) */}
                {view === 'dashboard' && (
                    <div className="flex justify-center mb-[var(--space-fluid-l,2rem)]">
                        <DriverPayoutDashboard onEdit={openEdit} refreshKey={refreshKey} />
                    </div>
                )}

                {/* ROW 2: MAIN CONTENT (Features + CTA) then SIDEBAR (Nav + Basic) */}
                <div className={cn('grid grid-cols-12 gap-8', view !== 'dashboard' && 'hidden')}>
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
                                    ctaLabel={card.link_label || t('fallback.viewMore')}
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

export default DriverHome;
