import React from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../layout/PageContainer';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { useHomeCards } from '../../hooks/useHomeCards';
import WelcomeHero from './WelcomeHero';
import FeatureCardsGrid from './FeatureCardsGrid';
import DashboardNavCard from './DashboardNavCard';
import BasicCard from './BasicCard';
import CTABanner, { type CTABannerProps } from './CTABanner';
import type { HomeCard } from './FeatureCardsGrid';

/**
 * Guscio unico delle 6 home admin (R4 del programma di refactoring).
 *
 * Le sei pagine avevano lo stesso identico scheletro copiato a mano - hero, griglia
 * feature, banner CTA, sidebar - e differivano solo per il ruolo, lo slug dei metadata
 * e per divergenze accidentali (chi filtrava anche le card `basic`, chi no; `gap-6`
 * contro `gap-8` in sidebar). Qui c'e' il superset, verificato invariante sui dati
 * veri: in `home_cards` solo il ruolo `agency` ha card `basic`, quindi renderizzare
 * anche quel ramo non cambia nulla per gli altri cinque.
 *
 * Il fetch passa da `useHomeCards` (TanStack Query, CLAUDE.md #17): prima erano sei
 * `useEffect` identici.
 */
const path = (card: HomeCard) =>
    card.target_path || card.page_slug ? `/${card.target_path || card.page_slug}` : '#';

const label = (card: HomeCard) => card.title || card.card_title || '';
const description = (card: HomeCard) => card.description || card.card_description || undefined;

interface HomeDashboardProps {
    /** Ruolo che filtra le card in `home_cards`. */
    role: string;
    /** Slug dei metadata in `site_metadata_admin` (es. 'manager-home'). */
    metaSlug: string;
    /** Classi extra sul contenitore (es. il padding safe-area della home driver). */
    className?: string;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ role, metaSlug, className }) => {
    const { t } = useTranslation('common');
    const { pageMeta } = usePageMetadata(metaSlug);
    const { homeCards } = useHomeCards(role);

    const featureCards = homeCards.filter((card) => card.card_type === 'feature');
    const ctaBanners = homeCards.filter((card) => card.card_type === 'cta');
    // Sidebar: nav + basic. Il confronto su slug/card_slug e' ereditato dalle pagine
    // che lo facevano, per non perdere card mal tipizzate a DB.
    const leftCards = homeCards.filter((card) =>
        card.card_type === 'nav' ||
        card.card_type === 'basic' ||
        card.slug === 'basic' ||
        card.card_slug === 'basic',
    );

    return (
        <PageContainer variant="wide">
            <div className={className}>
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Colonna principale: feature + CTA */}
                    <div className="lg:col-span-9 min-w-0">
                        <FeatureCardsGrid cards={featureCards} />
                        <div className="space-y-6">
                            {ctaBanners.map((card) => (
                                <CTABanner
                                    key={card.id}
                                    title={label(card)}
                                    description={card.description || card.card_description || ''}
                                    ctaLabel={card.cta_label || card.link_label || t('actions.viewMore')}
                                    ctaPath={path(card)}
                                    variant={(card.variant || 'dark') as CTABannerProps['variant']}
                                    className="flex items-center justify-between gap-6"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: nav card, e BasicCard per tutto il resto */}
                    <div className="lg:col-span-3 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                            {leftCards.map((card) => (
                                <div key={card.id}>
                                    {card.card_type === 'nav' ? (
                                        <DashboardNavCard
                                            path={path(card)}
                                            iconName={card.icon_name ?? undefined}
                                            label={label(card)}
                                            description={description(card)}
                                            linkLabel={card.link_label ?? undefined}
                                        />
                                    ) : (
                                        <BasicCard
                                            path={path(card)}
                                            iconName={card.icon_name ?? undefined}
                                            label={label(card)}
                                            description={description(card)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default HomeDashboard;
