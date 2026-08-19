import React, { useState } from 'react';
import { Typography } from '../Typography';
import { Icon } from '../Icon';
import MediaImage from '../../modal/MediaImage';
import Button, { type ButtonVariant } from '../navigation/Button';
import { RippleLink } from '../RippleLink';
import { cn } from '@thaiakha/shared/lib/utils';
import AkhaPixelPattern from '../../divider/AkhaPixelPattern';

// ── Tipi ──────────────────────────────────────────────────────────────────────

export interface CardItem {
  id?: string | number;
  title: string;
  desc: string;
  link: string;
  image: string;
  icon?: string;
  stats?: Array<{
    label?: string;
    value: string;
    color: 'action' | 'gray';
  }>;
}

export interface InfoCardProps {
  card: CardItem;
  index?: number;
  onNavigate: (page: string, topic?: string) => void;
  layout?: 'vertical' | 'horizontal';
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  showDivider?: boolean;
  titleVariant?: "h1" | "h2" | "h3" | "h4" | "h5" | "display1" | "display2";
  linkLabel?: string;
  buttonSize?: "xs" | "sm" | "md" | "lg";
  buttonVariant?: ButtonVariant;
}

// ── Componente ────────────────────────────────────────────────────────────────

const InfoCard: React.FC<InfoCardProps> = ({
  card,
  onNavigate,
  layout = 'vertical',
  showDivider = false,
  titleVariant,
  linkLabel,
  buttonSize,
  buttonVariant,
}) => {
  const [imgError, setImgError] = useState(false);
  const isHorizontal = layout === 'horizontal';

  // CONVENZIONE LINK (guidata dal DB, non hardcoded):
  // `card.link` deriva da home_cards_front.target_path.
  //   • inizia con "http…" → link ESTERNO → apre in nuova scheda (target=_blank + rel noopener).
  //   • path relativo (es. "recipes") → navigazione SPA interna, stessa scheda (onNavigate).
  // Non esiste (né serve) una colonna "open_in_new_tab": il comportamento è dedotto
  // dallo schema dell'URL. Per far aprire un esterno in nuova scheda basta mettere
  // l'URL completo in target_path (es. https://www.thaiakhakitchen.com).
  const isExternal = card.link.startsWith('http');
  const href = isExternal ? card.link : (card.link === 'home' ? '/' : `/${card.link}`);

  return (
    <RippleLink
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onNavigate={isExternal ? undefined : () => onNavigate(card.link)}
      className={cn(
        'group relative flex w-full overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-action-400',
        'rounded-[2rem]',
        'bg-surface border-2 border-border',
        'transition-all duration-500 ease-cinematic',
        'hover:border-action hover:shadow-[0_10px_40px_-10px_rgba(var(--action-ch)/0.25)] hover:-translate-y-1',
        'active:scale-[0.99] active:duration-150', // touch feedback
        isHorizontal ? 'flex-row min-h-[140px]' : 'flex-col',
      )}
    >
      {/* ── Immagine ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden shrink-0',
          isHorizontal
            ? 'w-32 md:w-48 self-stretch'
            : 'w-full aspect-video',
        )}
      >
        {/* Flash hover */}
        <div className="absolute inset-0 z-20 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-[0.12] pointer-events-none" />
        {/* Overlay base */}
        <div className="absolute inset-0 z-10 bg-black/10 dark:bg-black/20 pointer-events-none" />

        {card.image && !imgError ? (
          <MediaImage
            url={card.image}
            fallbackAlt={card.title}
            showCaption={false}
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <Icon name="image" size="md" className="text-muted opacity-30" />
          </div>
        )}
      </div>

      {/* ── Contenitore Testo + Footer (Necessario per layout horizontal) ───────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Contenuto ────────────────────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col min-w-0 [padding:var(--space-fluid-m)]"
        >
          {/* Titolo — default: h4 visual size, h3 semantic element (under section H2).
              Callers can override titleVariant to force a different visual + semantic level.
              Fixes D04 H2→H4 heading-level skip. */}
          <Typography
            variant={titleVariant || "h4"}
            as={titleVariant ? undefined : "h3"}
            color="title"
            className="group-hover:text-action transition-colors duration-300 leading-tight"
          >
            {card.title}
          </Typography>

          {showDivider && (
            <div className="my-3 flex justify-left">
              <AkhaPixelPattern
                variant="line_simple_medium"
                size={6}
                opacity={0.9}
                animateInView={true}
              />
            </div>
          )}

          {/* Descrizione */}
          <Typography
            variant="paragraphM"
            color="sub"
            className={cn(
              'mt-1',
              isHorizontal ? 'line-clamp-2' : 'line-clamp-3',
            )}
          >
            {card.desc}
          </Typography>

          {/* In horizontal, se non ci sono stats, mettiamo l'explore qui o lo lasciamo nel footer? 
              Il design prevede un Explore button. Lo mettiamo nel footer. */}
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="mt-auto flex flex-col">
          {/* Divider - Solo se ci sono stats */}
          {card.stats && card.stats.length > 0 && (
            <div className={cn(
              "[padding-inline:var(--space-fluid-m)] w-full",
              isHorizontal ? "mt-2" : "mt-4"
            )}>
              <AkhaPixelPattern variant="line_divider" size={6} opacity={0.8} fill={true} />
            </div>
          )}

          {/* flex-wrap: a mezza colonna (~170px) stats + bottone vanno a capo invece di schiacciarsi. */}
          <div className={cn(
            "flex flex-wrap items-center justify-between [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-m)]",
            isHorizontal ? "pt-4" : "pt-[var(--space-fluid-m)]"
          )}>
            <div className="flex [gap:var(--space-fluid-m)]">
              {/* Stat 1 */}
              {card.stats?.[0] && (
                <div className="flex flex-col">
                  <Typography variant="microLabel" color="sub" className="leading-none mb-1">
                    {card.stats[0].label}
                  </Typography>
                  <Typography variant="numericMedium" className="font-bold text-action">
                    {card.stats[0].value}
                  </Typography>
                </div>
              )}

              {/* Stat 2 */}
              {card.stats?.[1] && (
                <div className="flex flex-col">
                  <Typography variant="microLabel" color="sub" className="leading-none mb-1">
                    {card.stats[1].label}
                  </Typography>
                  <Typography variant="numericMedium" className="font-bold text-title">
                    {card.stats[1].value}
                  </Typography>
                </div>
              )}
            </div>

            {/* Pulsante Explore */}
            <Button
              variant={buttonVariant || "brand"}
              size={buttonSize || "sm"}
              icon="arrow_forward"
              iconPosition="right"
            >
              {linkLabel || "Explore"}
            </Button>
          </div>
        </div>
      </div>
    </RippleLink>
  );
};

export default InfoCard;