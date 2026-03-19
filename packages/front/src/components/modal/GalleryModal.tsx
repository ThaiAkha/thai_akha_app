import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon } from '../ui/index';
import Modal from './Modal';
import ModalMediaHeader from './ModalMediaHeader';
import { cn } from '@thaiakha/shared/lib/utils';

export interface GalleryItem {
  image_url: string;
  title?: string;
  description?: string;
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
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) setIndex(startIndex);
  }, [isOpen, startIndex]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
    touchStartX.current = null;
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[index];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="cinema"
      size="full"
      hideCloseButton={false}
      className="bg-transparent shadow-none border-none p-0 w-full h-full flex flex-col items-center justify-center"
    >
      {/* ATMOSPHERIC BACKGROUND — dynamically follows current image */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <img
          key={`bg-${index}`}
          src={currentItem.image_url}
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-30 blur-3xl scale-125 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/90" />
      </div>

      {/* CLICK-OUTSIDE WRAPPER — clicking the dark area around the image closes */}
      <div
        className="w-full max-w-5xl mx-auto flex flex-col items-center relative z-50 px-4 py-10 overflow-y-auto no-scrollbar cursor-pointer"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* TITLE + DESCRIPTION + COUNTER outside the image */}
        <ModalMediaHeader
          counter={`${index + 1} / ${items.length}`}
          title={currentItem.title}
          description={currentItem.description}
        />

        {/* IMAGE BOX */}
        <div
          className="relative w-full aspect-[16/9] md:aspect-[16/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 bg-black/40 ring-1 ring-white/10 animate-in zoom-in-95 duration-500 group cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation arrows (desktop, appear on hover) */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 size-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-primary text-white items-center justify-center transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
          >
            <Icon name="chevron_left" size="xl" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 size-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-primary text-white items-center justify-center transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
          >
            <Icon name="chevron_right" size="xl" />
          </button>

          {/* Image */}
          <img
            key={index}
            src={currentItem.image_url}
            alt={currentItem.title}
            className={cn(
              "w-full h-full object-contain animate-in duration-500 fill-mode-both",
              direction > 0 ? "slide-in-from-right-8" : direction < 0 ? "slide-in-from-left-8" : "fade-in"
            )}
          />

          {/* QUOTE OVERLAY — inside the image, bottom-left */}
          {currentItem.quote && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <p className="font-display font-black italic text-white text-2xl md:text-3xl leading-tight drop-shadow-2xl max-w-xl">
                "{currentItem.quote}"
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION DOTS */}
        <div
          className="flex gap-2 items-center justify-center mt-6"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index ? "bg-primary w-8" : "bg-white/30 hover:bg-white/60 w-2"
              )}
            />
          ))}
        </div>

        {/* CLOSE BUTTON */}
        <div
          className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="mineral"
            size="xl"
            icon="close"
            onClick={onClose}
            className="rounded-full text-action border-action/20 hover:bg-action/10 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.6)]"
          >
            Close Gallery
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GalleryModal;
