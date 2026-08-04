import React from 'react';
import { useFrontHomeCards } from '../../../hooks/useFrontHomeCards';
import { Typography, Icon } from '../../ui';
import type { TocAccent } from '../../ui';
import { SkeletonBase } from '../../skeleton/atoms';
import { cn } from '@thaiakha/shared/lib/utils';

interface SidebarClassCtaProps {
  /** card_id in home_cards_front (es. 'sidebar-cta-classes'). Banner sostituibile per pagina. */
  cardId: string;
  onNavigate: (page: string) => void;
  /** Accento per mondo → colore dell'icona "go". */
  accent?: TocAccent;
  className?: string;
}

// Colore icona "go" = colore link del mondo (su chip bianco).
const ICON_COLOR: Record<TocAccent, string> = {
  ocean: 'text-ocean-blue',
  sunset: 'text-sunset-6',
  brand: 'text-primary',
  ingredients: 'text-pantry-4',
};

/**
 * SidebarClassCta — card CTA quadrata (1:1) con foto full-bleed:
 *  • icona "go" (colore link) in un chip in alto a destra,
 *  • overlay nero in basso, kicker (link_label es. "Go to") + titolo (title es. "Cooking Class").
 * Dati dalla tabella home_cards_front (title, link_label, image, target).
 */
export const SidebarClassCta: React.FC<SidebarClassCtaProps> = ({ cardId, onNavigate, accent = 'ocean', className }) => {
  const { cards, loading } = useFrontHomeCards([cardId]);

  if (loading) {
    return <SkeletonBase className={cn('w-full aspect-square rounded-2xl', className)} />;
  }

  const card = cards.find(c => c.card_id === cardId);
  if (!card) return null;

  const image = Array.isArray(card.cover_data)
    ? card.cover_data[0]?.image_url
    : (card.cover_data as any)?.image_url;
  const href = card.target_path || '/';
  const linkTarget = href.startsWith('/') ? href.substring(1) : href;
  const kicker = card.link_label; // es. "Go to"

  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; // nuova scheda nativa
        e.preventDefault();
        onNavigate(linkTarget);
      }}
      aria-label={`${kicker ?? ''} ${card.title}`.trim()}
      className={cn(
        'group relative block w-full aspect-square rounded-2xl overflow-hidden shadow-theme-md',
        'transition-transform duration-300 hover:-translate-y-0.5',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        className
      )}
    >
      {image ? (
        <img
          src={image}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-2" />
      )}

      {/* Icona "go" (colore link) — chip in alto a destra */}
      <div className="absolute top-3 right-3 z-10 size-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <Icon name="arrow_outward" size="sm" className={ICON_COLOR[accent]} />
      </div>

      {/* Overlay nero sotto le scritte */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Kicker (es. "Go to") + titolo (es. "Cooking Class") */}
      <div className="absolute inset-x-0 bottom-0 [padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-2xs)]">
        {kicker && (
          <Typography variant="microLabel" className="font-accent text-white/80 uppercase tracking-widest font-bold">
            {kicker}
          </Typography>
        )}
        <Typography variant="h3" className="font-accent text-white font-black uppercase leading-tight drop-shadow-lg">
          {card.title}
        </Typography>
      </div>
    </a>
  );
};

export default SidebarClassCta;
