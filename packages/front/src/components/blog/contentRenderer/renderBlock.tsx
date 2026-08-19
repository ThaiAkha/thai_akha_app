/**
 * ContentRenderer - rendering di un singolo blocco (switch per tipo). Estratto da
 * ContentRenderer.tsx (#16 split monstre), DOM invariato.
 */
import React from 'react';
import { Typography, Icon, Card } from '../../ui';
import AkhaThemedLine from '../../divider/AkhaThemedLine';
import AkhaQuote from '../../divider/AkhaQuote';
import AkhaPixelPattern, { AkhaTheme } from '../../divider/AkhaPixelPattern';
import type { GalleryItem } from '../../modal/GalleryModal';
import MapBlock from '../../modal/MapBlock';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';
import { GalleryPhoto } from './GalleryPhoto';
import { slugify, type ContentBlock } from './contentParser';

export interface BlockContext {
  onPhotoClick: (assetId: string) => void;
  onPhotoLoaded: (assetId: string, item: GalleryItem) => void;
  isFirstParagraph: (i: number) => boolean;
  theme?: AkhaTheme;
}



export function renderBlock(block: ContentBlock, i: number, ctx: BlockContext): React.ReactNode {
  switch (block.type) {

    case 'paragraph': {
      const isBold = block.bold || ctx.isFirstParagraph(i);
      return (
        <Typography
          key={i}
          variant="paragraphL"
          color="default"
          className={`leading-loose${isBold ? ' font-bold' : ''} [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline transition-all`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.text) }}
        />
      );
    }

    case 'bullets':
      return (
        <ul key={i} className="space-y-3 pl-1">
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <Icon name="chevron_right" size="sm" className="text-action shrink-0 mt-1 opacity-70" />
              <Typography variant="paragraphM" color="default" className="leading-relaxed [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline transition-all" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
            </li>
          ))}
        </ul>
      );

    case 'heading': {
      const id = block.anchorId || slugify(block.text);
      const isLevel2 = block.level === 2;
      return (
        <div key={i} id={id} className="flex flex-col [gap:var(--space-fluid-2xs)] scroll-mt-24">
          <Typography
            variant={isLevel2 ? 'h2' : 'h3'}
            as={isLevel2 ? 'h2' : 'h3'}
            className="text-title leading-[1.15] tracking-tight [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline transition-all"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.text) }}
          />

          {isLevel2 && (
            <div className="w-full [padding-top:var(--space-fluid-3xs)] [padding-bottom:var(--space-fluid-2xs)]">
              <AkhaPixelPattern
                variant="line"
                size={6}
                theme={ctx.theme ?? 'kitchen'}
                opacity={0.9}
                animateInView
              />
            </div>
          )}

          {block.subtitle && (
            <Typography variant="paragraphS" color="muted" className="uppercase tracking-widest font-medium">
              {block.subtitle}
            </Typography>
          )}
        </div>
      );
    }

    case 'quote':
      return (
        <AkhaQuote key={i} variant="base" author={block.author} theme={ctx.theme}>
          {block.text}
        </AkhaQuote>
      );

    case 'photo':
      return (
        <GalleryPhoto
          key={`photo-${block.assetId}-${i}`}
          assetId={block.assetId}
          onOpen={ctx.onPhotoClick}
          onLoaded={ctx.onPhotoLoaded}
          theme={ctx.theme}
        />
      );

    case 'photo_grid':
      return (
        <div key={`photo-grid-${i}`} className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
          {block.assetIds.map((assetId, j) => (
            <GalleryPhoto
              key={`photo-grid-item-${assetId}-${i}-${j}`}
              assetId={assetId}
              onOpen={ctx.onPhotoClick}
              onLoaded={ctx.onPhotoLoaded}
              theme={ctx.theme}
            />
          ))}
        </div>
      );

    case 'divider':
      return (
        <div key={i} className="opacity-80">
          <AkhaThemedLine 
            size={10} 
            opacity={0.9} 
            theme={(ctx.theme ?? (block.theme === 'cooking' ? 'kitchen' : (block.theme ?? 'kitchen'))) as AkhaTheme} 
          />
        </div>
      );

    case 'map':
      return <div key={i}><MapBlock url={block.url} title={block.title} height={block.height} /></div>;

    case 'info_box': {
      const items = block.items || (block.text ? [block.text] : []);
      return (
        <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card
            variant="glass"
            padding="none"
            rounded="2xl"
            className="flex flex-col"
          >
            {/* ── Header — Centered Title ────────────────────────────── */}
            <div
              className="flex flex-col items-center text-center"
              style={{ padding: 'var(--space-fluid-l) var(--space-fluid-l) 0', gap: 'var(--space-fluid-xs)' }}
            >
              {block.title && (
                <Typography variant="h3" as="h3" color="title" className="font-bold leading-tight">
                  {block.title}
                </Typography>
              )}
              {block.subtitle && (
                <Typography variant="paragraphM" color="sub" className="font-medium opacity-80">
                  {block.subtitle}
                </Typography>
              )}
            </div>

            {/* ── Inner divider — matching FAQ card ───────────────────── */}
            <div style={{ margin: 'var(--space-fluid-l) var(--space-fluid-xl)' }}>
              <AkhaPixelPattern variant="line_divider" theme={ctx.theme} size={5} opacity={0.6} fill animateInView />
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <div className="flex-1" style={{ padding: '0 var(--space-fluid-l) var(--space-fluid-l)' }}>
              {items.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Icon name="chevron_right" size="xs" className="text-action shrink-0 mt-1.5 opacity-60" />
                      <Typography variant="paragraphM" color="muted" className="leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      );
    }

    case 'reward_cards':
      return (
        <div key={i} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [gap:var(--space-fluid-m)]">
          {block.items.map((item, j) => (
            <div
              key={j}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-surface/5 dark:bg-black/20 transition-all duration-300 hover:border-action/30 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-2/10">
                    <Icon name={item.icon ?? 'emoji_events'} size="xl" className="text-action/40" />
                  </div>
                )}
                {/* XP badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-sm text-white border border-white/10 rounded-full px-2 py-0.5 leading-tight">
                    {item.required_points} XP
                  </span>
                </div>
                {/* Physical/Digital badge */}
                {item.badge_type && (
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className={`text-[9px] font-black uppercase tracking-wider backdrop-blur-sm rounded-full px-2 py-0.5 leading-tight border ${
                      item.badge_type === 'digital'
                        ? 'bg-action/20 text-action border-action/30'
                        : 'bg-quiz-p/20 text-quiz-text border-quiz-p/30'
                    }`}>
                      {item.badge_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-col [gap:var(--space-fluid-3xs)] [padding:var(--space-fluid-s)]">
                <Typography variant="paragraphM" color="title" className="font-black leading-tight">
                  {item.label}
                </Typography>
                {item.description && (
                  <Typography variant="paragraphS" color="muted" className="leading-relaxed opacity-80">
                    {item.description}
                  </Typography>
                )}
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

// ─── Component
