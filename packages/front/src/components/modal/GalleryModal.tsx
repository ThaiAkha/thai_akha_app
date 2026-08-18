import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon, MediaImage } from '../ui/index';
import Modal from './Modal';
import ModalMediaHeader from './ModalMediaHeader';
import { cn } from '@thaiakha/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '../ui/index';
import { t } from '../../i18n';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export interface GalleryItem {
  image_url: string;
  asset_id?: string;
  title?: string;
  title_highlight?: string;
  subtitle?: string;
  description?: string;
  caption?: string;
  quote?: string;
  icons?: string[];
  photo_id?: number;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  startIndex?: number;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  items,
  startIndex = 0,
}) => {
  const [index, setIndex] = useState(startIndex);
  const [, setDirection] = useState(0);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) setIndex(startIndex);
  }, [isOpen, startIndex]);

  // Keep the active thumbnail visible in the strip (horizontal scroll only).
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, index, items.length]);

  const next = () => {
    if (!items.length) return;
    setDirection(1);
    setIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    if (!items.length) return;
    setDirection(-1);
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  // Framer Motion physically handles drag offset and velocity now, 
  // so we can drop the old touch custom events


  if (!isOpen || items.length === 0) return null;

  const currentItem = items[index];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="cinema"
      size="full"
      hideCloseButton={true}
      className="bg-transparent shadow-none border-none p-0 w-full h-full flex flex-col items-center justify-center"
    >
      {/* ATMOSPHERIC BACKGROUND — true crossfade + cinematic overlay */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        <AnimatePresence mode="sync">
          {currentItem.image_url && (
            <motion.img
              key={index}
              src={currentItem.image_url}
              alt="Atmosphere"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        {/* Layer 1: Multiplying darkner */}
        <div className="absolute inset-0 bg-black/90 mix-blend-multiply" />
        {/* Layer 2: Subtle secondary tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-black/20 to-black/0" />
      </div>

      {/* CLICK-TO-CLOSE — tutto schermo */}
      <div className="fixed inset-0 z-40 cursor-pointer" onClick={onClose} />

      <div className="relative z-50 w-[95vw] xl:w-[60vw] shrink-0 mx-auto flex flex-col items-center pointer-events-none [padding-block:var(--space-fluid-l)]">

        {/* TITLE + DESCRIPTION outside the image (COUNTER REMOVED) */}
        <div className="pointer-events-none w-full">
          <ModalMediaHeader
            title={currentItem.title}
            highlight={currentItem.title_highlight}
            subtitle={currentItem.subtitle}
            description={currentItem.description}
          />
        </div>

        <div
          className="pointer-events-auto relative w-full aspect-video rounded-[3rem] overflow-hidden border border-white/10 bg-black animate-in zoom-in-105 fade-in duration-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation arrows (desktop) */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 size-10 md:size-16 rounded-full border border-white/10 bg-black/40 backdrop-blur-md hover:bg-primary text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            <Icon name="chevron_left" size="xl" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 size-10 md:size-16 rounded-full border border-white/10 bg-black/40 backdrop-blur-md hover:bg-primary text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            <Icon name="chevron_right" size="xl" />
          </button>

          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={index}
              variants={{
                enter: { opacity: 0, scale: 1.55 },
                center: { zIndex: 1, opacity: 1, scale: 1 },
                exit: { zIndex: 0, opacity: 0, scale: 1 }
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) next();
                else if (swipe > swipeConfidenceThreshold) prev();
              }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            >
              {/* Image */}
              <MediaImage
                assetId={currentItem.asset_id}
                url={currentItem.image_url}
                fallbackAlt={currentItem.title}
                showCaption={true}
                imgClassName="w-full h-full object-contain pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* QUOTE OVERLAY */}
          {currentItem.quote && (
            <div className="absolute bottom-0 left-0 right-0 [padding:var(--space-fluid-l)] [padding-top:var(--space-fluid-2xl)] bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
              <Typography
                variant="h3"
                className="font-black italic text-white leading-tight drop-shadow-2xl max-w-2xl [padding-bottom:var(--space-fluid-xl)]"
              >
                "{currentItem.quote}"
              </Typography>
            </div>
          )}

          {/* INTERNAL PAGINATION DOTS */}
          <div
            className="absolute bottom-6 left-0 right-0 z-50 pointer-events-auto flex gap-2 items-center justify-center drop-shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 shadow-sm",
                  i === index ? "bg-primary w-8" : "bg-white/50 hover:bg-white w-2"
                )}
              />
            ))}
          </div>
        </div>

        {/* THUMBNAIL STRIP — direct navigation, horizontal scroll (swipe-friendly).
            Dark-glass modal aesthetic (white/X allowed: cinema variant is always dark). */}
        {items.length > 1 && (
          <div
            className="pointer-events-auto w-full max-w-full overflow-x-auto no-scrollbar [margin-top:var(--space-fluid-m)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex [gap:var(--space-fluid-xs)] w-max mx-auto [padding-inline:var(--space-fluid-m)]">
              {items.map((item, i) => (
                <button
                  key={item.asset_id ?? `${item.image_url}-${i}`}
                  ref={i === index ? activeThumbRef : undefined}
                  onClick={() => goTo(i)}
                  aria-label={item.title || `Photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'relative shrink-0 size-14 md:size-20 rounded-xl overflow-hidden border-2 transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    i === index
                      ? 'border-primary opacity-100'
                      : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/40',
                  )}
                >
                  <img
                    src={item.image_url}
                    alt={item.title || ''}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CLOSE BUTTON — same style as PhotoModal */}
        <div className="pointer-events-auto [margin-top:var(--space-fluid-l)]">
          <Button
            variant="outline"
            size="sm"
            icon="close"
            onClick={onClose}
            className="text-action border-action/20"
          >
            {t('components:gallery.closeGallery')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GalleryModal;
