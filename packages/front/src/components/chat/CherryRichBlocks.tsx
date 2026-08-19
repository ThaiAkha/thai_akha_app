import React, { useMemo, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';
import type {
  NodeBlock,
  NodeLinkCard,
  NodeGallery,
  NodeAudio,
  ChatOption,
} from '@thaiakha/shared/data/chatFlowData';
import type { MediaAsset } from '@thaiakha/shared';
import { useMediaAssets } from '../../hooks/useMediaAsset';
import { AudioPlayer } from '../modal/AudioPlayer';

interface ResolvedImg {
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  name?: string;
}

interface CherryRichBlocksProps {
  blocks: NodeBlock[];
  /** Click su una linkCard → riusa il gestore opzioni (nav + inject page-intro L1). */
  onLink: (opt: ChatOption) => void;
  /** Segna link/nodo come visitato (memoria ragnatela). Opzionale. */
  onVisit?: (id: string, meta?: Record<string, unknown>) => void;
}

function pickImg(
  assets: Record<string, MediaAsset>,
  assetId?: string,
  imageUrl?: string,
): ResolvedImg | null {
  if (assetId && assets[assetId]) {
    const a = assets[assetId];
    return { url: a.image_url, alt: a.alt_text ?? '', width: a.width, height: a.height };
  }
  if (imageUrl) return { url: imageUrl, alt: '' };
  return null;
}

/**
 * CherryRichBlocks — disegna i blocchi ricchi (linkCard / gallery) IN CODA al
 * messaggio, dopo la trascrizione. Mai dentro il testo. La gallery apre un modal
 * statico (chiudi → torni alla chat). La linkCard naviga e (via onLink) può
 * iniettare l'L1 della pagina di destinazione.
 */
export const CherryRichBlocks: React.FC<CherryRichBlocksProps> = ({ blocks, onLink, onVisit }) => {
  // Raccogli tutti gli asset_id referenziati → risoluzione batch.
  const assetIds = useMemo(() => {
    const ids: string[] = [];
    for (const b of blocks) {
      if (b.kind === 'linkCard' && b.assetId) ids.push(b.assetId);
      if (b.kind === 'gallery' && b.assetIds) ids.push(...b.assetIds);
    }
    return ids;
  }, [blocks]);

  const { assets } = useMediaAssets(assetIds);
  const [modal, setModal] = useState<{ title?: string; imgs: ResolvedImg[] } | null>(null);

  if (!blocks || blocks.length === 0) return null;

  const handleLinkClick = (card: NodeLinkCard) => {
    onVisit?.(card.pageIntroNodeId ?? card.title, {
      kind: 'linkCard',
      action: card.action ?? null,
      slug: card.data?.slug ?? null,
    });
    onLink({
      label: card.title,
      nextId: card.pageIntroNodeId ?? 'ROOT',
      action: card.action ?? undefined,
      data: card.data,
    });
  };

  const openGallery = (g: NodeGallery) => {
    const imgs: ResolvedImg[] = [];
    if (g.assetIds) for (const id of g.assetIds) { const r = pickImg(assets, id); if (r) imgs.push(r); }
    if (g.imageUrls) for (const u of g.imageUrls) imgs.push({ url: u, alt: '' });
    if (imgs.length === 0) return;
    if (g.names) imgs.forEach((im, k) => { im.name = g.names![k]; im.alt = im.alt || g.names![k] || ''; });
    onVisit?.(`gallery:${g.title ?? 'photos'}`, { kind: 'gallery', count: imgs.length });
    setModal({ title: g.title, imgs });
  };

  return (
    <div className="w-full mt-3 flex flex-col [gap:var(--space-fluid-2xs)] animate-in fade-in duration-700">
      {blocks.map((b, i) => {
        if (b.kind === 'linkCard') {
          const img = pickImg(assets, b.assetId, b.imageUrl);
          // ── HERO: foto grande (16/10) + titolo sotto — per le pagine principali ──
          if (b.layout === 'hero') {
            return (
              <button
                key={`lc-${i}`}
                onClick={() => handleLinkClick(b)}
                className={cn(
                  'group flex flex-col text-left w-full overflow-hidden',
                  'rounded-2xl border border-cherry-static/25 bg-surface',
                  'hover:border-cherry-ai/50 hover:shadow-md active:scale-[0.99] transition-all duration-300',
                )}
              >
                {img && (
                  <span className="block w-full aspect-[16/10] bg-surface-2 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </span>
                )}
                <span className="flex flex-col [padding:var(--space-fluid-xs)] [gap:2px]">
                  <Typography as="span" variant="paragraphM" className="font-bold text-title leading-tight line-clamp-2">
                    {b.title}
                  </Typography>
                  {b.description && (
                    <Typography as="span" variant="caption" color="sub" className="leading-snug line-clamp-2">
                      {b.description}
                    </Typography>
                  )}
                  <Typography as="span" variant="microLabel" color="primary" className="uppercase tracking-widest font-black mt-0.5">
                    Open ›
                  </Typography>
                </span>
              </button>
            );
          }
          // ── COMPACT: orizzontale stile sibling (default) ──
          return (
            <button
              key={`lc-${i}`}
              onClick={() => handleLinkClick(b)}
              className={cn(
                'group flex items-stretch text-left w-full overflow-hidden',
                'rounded-2xl border border-cherry-static/25 bg-surface',
                'hover:border-cherry-ai/50 hover:shadow-md active:scale-[0.99] transition-all duration-300',
              )}
            >
              {img && (
                <span className="shrink-0 w-20 sm:w-24 bg-surface-2 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.alt}
                    loading="lazy"
                    width={img.width ?? undefined}
                    height={img.height ?? undefined}
                    className="w-full h-full object-cover"
                  />
                </span>
              )}
              <span className="flex-1 min-w-0 flex flex-col justify-center [padding:var(--space-fluid-2xs)] [gap:2px]">
                <Typography as="span" variant="paragraphS" className="font-bold text-title leading-tight line-clamp-2">
                  {b.title}
                </Typography>
                {b.description && (
                  <Typography as="span" variant="caption" color="sub" className="leading-snug line-clamp-2">
                    {b.description}
                  </Typography>
                )}
                <Typography as="span" variant="microLabel" color="primary" className="uppercase tracking-widest font-black mt-0.5">
                  Open ›
                </Typography>
              </span>
            </button>
          );
        }

        // ── AUDIO: riusa AudioPlayer (assetId→audio_assets o url diretto) ──
        if (b.kind === 'audio') {
          const au = b as NodeAudio;
          return (
            <div key={`au-${i}`} className="w-full">
              {au.title && (
                <Typography
                  as="span"
                  variant="microLabel"
                  className="block mb-1.5 uppercase tracking-widest font-black [color:var(--text-cherry-ai)]"
                >
                  {au.title}
                </Typography>
              )}
              <AudioPlayer assetId={au.assetId} url={au.url} hideTranscript className="w-full" />
            </div>
          );
        }

        // gallery
        const g = b as NodeGallery;
        const thumbs: ResolvedImg[] = [];
        if (g.assetIds) for (const id of g.assetIds) { const r = pickImg(assets, id); if (r) thumbs.push(r); }
        if (g.imageUrls) for (const u of g.imageUrls) thumbs.push({ url: u, alt: '' });
        if (thumbs.length === 0) return null;
        // ── GRID: 3 colonne 1:1 (stile ingredienti in ricetta) → apre la modal ──
        if (g.layout === 'grid') {
          return (
            <button
              key={`gl-${i}`}
              onClick={() => openGallery(g)}
              className={cn(
                'w-full text-left flex flex-col [gap:6px]',
                'rounded-2xl border border-cherry-static/25 bg-surface [padding:6px]',
                'hover:border-cherry-ai/50 active:scale-[0.99] transition-all duration-300',
              )}
            >
              <span className="grid grid-cols-3 [gap:6px]">
                {thumbs.slice(0, 3).map((t, k) => (
                  <img
                    key={k}
                    src={t.url}
                    alt={t.alt}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </span>
              <Typography as="span" variant="microLabel" className="uppercase tracking-widest font-black [color:var(--text-cherry-ai)] px-1">
                {g.title ?? 'Ingredients'} · view all {thumbs.length} ›
              </Typography>
            </button>
          );
        }
        // ── STRIP: thumb sovrapposte (default) ──
        return (
          <button
            key={`gl-${i}`}
            onClick={() => openGallery(g)}
            className={cn(
              'flex items-center [gap:var(--space-fluid-2xs)] w-full text-left',
              'rounded-2xl border border-cherry-static/25 bg-surface [padding:6px]',
              'hover:border-cherry-ai/50 active:scale-[0.99] transition-all duration-300',
            )}
          >
            <span className="flex -space-x-3 shrink-0">
              {thumbs.slice(0, 3).map((t, k) => (
                <img
                  key={k}
                  src={t.url}
                  alt={t.alt}
                  loading="lazy"
                  className="size-12 rounded-xl object-cover border-2 border-surface"
                />
              ))}
            </span>
            <span className="flex flex-col min-w-0">
              <Typography as="span" variant="paragraphS" className="font-bold text-title leading-tight line-clamp-1">
                {g.title ?? 'Photo gallery'}
              </Typography>
              <Typography as="span" variant="microLabel" className="uppercase tracking-widest font-black [color:var(--text-cherry-ai)]">
                View {thumbs.length} photos ›
              </Typography>
            </span>
          </button>
        );
      })}

      {/* ── Gallery modal (statico — chiudi e torni alla chat) ── */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={modal.title ?? 'Photo gallery'}
          onClick={() => setModal(null)}
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between [padding:var(--space-fluid-s)] shrink-0">
            <Typography variant="paragraphM" className="font-bold text-white line-clamp-1">
              {modal.title ?? 'Gallery'}
            </Typography>
            <button
              onClick={(e) => { e.stopPropagation(); setModal(null); }}
              aria-label="Close gallery"
              className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto [padding:var(--space-fluid-s)] flex flex-col [gap:var(--space-fluid-s)] custom-scrollbar"
          >
            {/* MAIN ingredient — full-width (logica recipe showroom) */}
            {modal.imgs[0] && (
              <figure className="flex flex-col [gap:6px]">
                <img src={modal.imgs[0].url} alt={modal.imgs[0].alt} loading="lazy" className="w-full aspect-square rounded-2xl object-cover" />
                <figcaption className="flex items-center gap-2">
                  <span className="text-[0.6rem] uppercase tracking-widest font-black [color:var(--text-cherry-ai-deep)]">Main</span>
                  <Typography as="span" variant="paragraphS" className="font-bold text-white">{modal.imgs[0].name ?? modal.imgs[0].alt}</Typography>
                </figcaption>
              </figure>
            )}
            {/* REGULAR ingredients — 2 colonne 1:1 */}
            {modal.imgs.length > 1 && (
              <div className="grid grid-cols-2 [gap:var(--space-fluid-s)]">
                {modal.imgs.slice(1).map((img, k) => (
                  <figure key={k} className="flex flex-col [gap:4px]">
                    <img src={img.url} alt={img.alt} loading="lazy" className="w-full aspect-square rounded-2xl object-cover" />
                    {(img.name || img.alt) && (
                      <figcaption><Typography as="span" variant="caption" className="text-white/70">{img.name ?? img.alt}</Typography></figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CherryRichBlocks;
