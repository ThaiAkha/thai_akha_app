import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { TableOfContents } from '../../ui';
import type { TocItem, TocAccent } from '../../ui';
import SidebarCard from './SidebarCard';
import SidebarMenu from './SidebarMenu';
import SidebarClassCta from './SidebarClassCta';

interface InfoPageSidebarProps {
  currentSlug: string;
  onNavigate: (slug: string) => void;
  /** Voci TOC (id ancora + label). Omesso → nessun blocco TOC (es. policy/terms). */
  toc?: TocItem[];
  /** card_id in home_cards_front per la CTA. Omesso → nessuna CTA. Banner sostituibile per pagina. */
  ctaCardId?: string;
  /** Accento per mondo (ocean=FAQ, sunset=history…) → gradiente header + link. */
  accent?: TocAccent;
  /** Numerazione automatica del TOC (1., 2., …) — coincide col rail delle sezioni. */
  numberedToc?: boolean;
  tocTitle?: string;
  className?: string;
}

/**
 * InfoPageSidebar — sidebar modulare per le info-page: 3 blocchi coerenti,
 * tutti opzionali:
 *   1. TableOfContents (se `toc`)     → dentro SidebarCard (header + divider a tema)
 *   2. SidebarMenu (pagine footer "Information")
 *   3. SidebarClassCta (se `ctaCardId`) → banner promo 9:16 da home_cards_front
 * Riusabile su FAQ, policy, terms, about… cambiando accent/dividerTheme/ctaCardId.
 */
export const InfoPageSidebar: React.FC<InfoPageSidebarProps> = ({
  currentSlug,
  onNavigate,
  toc,
  ctaCardId,
  accent = 'ocean',
  numberedToc = false,
  tocTitle = 'On this page',
  className,
}) => (
  <div className={cn('flex flex-col [gap:var(--space-fluid-s)]', className)}>
    {toc && toc.length > 0 && (
      <SidebarCard title={tocTitle} icon="menu_book" accent={accent}>
        <TableOfContents items={toc} accent={accent} numbered={numberedToc} showHeader={false} labelClassName="font-accent tracking-tight [font-size:var(--text-fluid-paragraphM)] leading-snug" />
      </SidebarCard>
    )}

    <SidebarMenu currentSlug={currentSlug} onNavigate={onNavigate} accent={accent} />

    {ctaCardId && <SidebarClassCta cardId={ctaCardId} onNavigate={onNavigate} accent={accent} />}
  </div>
);

export default InfoPageSidebar;
