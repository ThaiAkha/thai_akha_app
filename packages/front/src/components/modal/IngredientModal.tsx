import React, { useState, useEffect } from 'react';
import { Button, Icon, MediaImage, Typography, Badge } from '../ui/index';
import Modal from './Modal';
import HeaderSection from '../layout/HeaderSection';
import { cn } from '@thaiakha/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../i18n';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  startIndex?: number;
}

const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  items,
  startIndex = 0,
}) => {
  const [index, setIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);

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
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        <AnimatePresence mode="sync">
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
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-black/20 to-black/0" />
      </div>

      <div className="fixed inset-0 z-40 cursor-pointer" onClick={onClose} />

      <div className="relative z-50 w-[95vw] xl:w-[60vw] shrink-0 mx-auto flex flex-col items-center pointer-events-none [padding-block:var(--space-fluid-l)]">

        <div
          className="pointer-events-auto relative w-full h-[75vh] md:h-auto md:aspect-[2/1] rounded-[3rem] overflow-hidden border border-white/10 bg-surface animate-in zoom-in-105 fade-in duration-700 shadow-2xl flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation arrows */}
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
                enter: { opacity: 0, x: 50 },
                center: { zIndex: 1, opacity: 1, x: 0 },
                exit: { zIndex: 0, opacity: 0, x: -50 }
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) next();
                else if (swipe > swipeConfidenceThreshold) prev();
              }}
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row cursor-grab active:cursor-grabbing"
            >
              {/* Left Photo */}
              <div className="w-full aspect-square md:w-1/2 md:h-full relative bg-surface-elevated overflow-hidden shrink-0">
                {currentItem.image_url ? (
                  <MediaImage
                    url={currentItem.image_url}
                    fallbackAlt={currentItem.name_en}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover pointer-events-none"
                    showCaption={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="eco" size="xl" className="text-primary/40" />
                  </div>
                )}
              </div>

              {/* Right Content */}
              <div className="flex-1 md:w-1/2 h-[50%] md:h-full overflow-y-auto flex flex-col p-5 pb-16 md:p-8 md:pb-12 md:pr-16 lg:p-12 lg:pb-16 lg:pr-24">
                <div className="pointer-events-none mb-4">
                  <HeaderSection
                    title={currentItem.name_en}
                    align="left"
                    variant="kitchen"
                    hideSubtitle={true}
                    hideDescription={true}
                  />
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-numeric font-bold text-xl md:text-2xl text-action italic">{currentItem.name_th}</span>
                    {currentItem.phonetic && (
                      <span className="font-mono text-base md:text-lg tracking-widest text-muted/80">[{currentItem.phonetic}]</span>
                    )}
                  </div>
                </div>

                {/* Descrizione dal DB in formato HTML → render con prose come in
                    RecipeSingle (as="div" + recipe-prose), non testo grezzo. */}
                <Typography
                  as="div"
                  variant="paragraphM"
                  color="sub"
                  className="mt-2 md:mt-4 leading-relaxed pointer-events-none [&_strong]:font-bold [&_em]:italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline recipe-prose"
                  dangerouslySetInnerHTML={{ __html: currentItem.description || 'Every component tells a story of the Akha highlands.' }}
                />

              </div>
            </motion.div>
          </AnimatePresence>

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
                  i === index ? "bg-primary w-8" : "bg-border hover:bg-sub w-2"
                )}
              />
            ))}
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <div className="pointer-events-auto mt-6 md:[margin-top:var(--space-fluid-l)]">
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

export default IngredientModal;
