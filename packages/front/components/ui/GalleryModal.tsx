import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Typography, Icon } from './index';
import { cn } from '../../lib/utils';

export interface GalleryItem {
  image_url: string;
  title?: string;
  description?: string;
  quote?: string;
  icons?: string[];
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
  startIndex = 0
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
      hideCloseButton={true}
      // Aggiunto overflow-y-auto per schermi piccoli
      className="bg-transparent shadow-none border-none p-4 md:p-0 w-full h-full flex flex-col items-center justify-center overflow-y-auto"
    >
      {/* 1. SFONDO ATMOSFERICO */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <img
          key={`bg-${index}`}
          src={currentItem.image_url}
          alt="Atmosphere"
          // Opacità leggermente più bassa per far risaltare il box centrale
          className="w-full h-full object-cover opacity-30 blur-3xl scale-125 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/90" />
      </div>

      {/* 2. CONTENUTO CENTRALE */}
      {/* Rimosso h-full per permettere al contenuto di centrarsi naturalmente */}
      <div 
        className="w-full max-w-7xl mx-auto flex flex-col items-center relative z-50 py-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* HEADER INFO */}
        <div className="w-full px-6 text-center space-y-4 mb-8 md:mb-12 animate-in slide-in-from-top-6 duration-700">
           <div className="flex items-center justify-center gap-4 opacity-80">
              <div className="h-[1px] w-8 md:w-20 bg-gradient-to-r from-transparent to-white/40" />
              <span className="text-action text-[10px] md:text-[13px] tracking-[0.5em] font-black uppercase drop-shadow-md">
                {index + 1} / {items.length} — {currentItem.title}
              </span>
              <div className="h-[1px] w-8 md:w-20 bg-gradient-to-l from-transparent to-white/40" />
           </div>
        </div>

        {/* BOX IMMAGINE PRINCIPALE */}
        {/* Cambiato max-w-[90vw] in max-w-full e aggiunto aspect dinamico */}
        <div className="relative w-full aspect-[4/5] md:aspect-video rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 bg-black/40 group ring-1 ring-white/10 animate-in zoom-in-95 duration-700">
          
          {/* Frecce Desktop Interne al limite della card */}
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

          {/* Immagine */}
          <img
            key={index}
            src={currentItem.image_url}
            alt={currentItem.title}
            className={cn(
              "w-full h-full object-contain animate-in duration-500 fill-mode-both",
              direction > 0 ? "slide-in-from-right-8" : direction < 0 ? "slide-in-from-left-8" : "fade-in"
            )}
          />
          
          {/* Gradienti Interni */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />

          {/* ICONS & QUOTE INTERNE (Style Thai Akha) */}
          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-end gap-6 z-20 pointer-events-none">
             {currentItem.quote && (
               <div className="max-w-xl animate-in slide-in-from-bottom-4 duration-700 delay-200">
                 <Typography variant="h4" className="text-white font-display font-black italic leading-tight drop-shadow-2xl tracking-wide">
                   "{currentItem.quote}"
                 </Typography>
               </div>
             )}
             
             {currentItem.icons && currentItem.icons.length > 0 && (
               <div className="flex gap-2 animate-in fade-in duration-700 delay-300">
                 {currentItem.icons.map((icon, i) => (
                   <div key={i} className="size-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                     <Icon name={icon} size="sm" />
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* FOOTER - DESCRIZIONE E CHIUSURA */}
        <div className="mt-8 md:mt-12 text-center w-full max-w-3xl px-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
           {currentItem.description && (
             <Typography variant="paragraphL" className="text-white/70 italic mb-10 leading-relaxed">
               {currentItem.description}
             </Typography>
           )}
           <Button 
              variant="mineral" 
              size="xl" 
              icon="close" 
              onClick={onClose} 
              className="rounded-full !px-12 py-6 text-action border-action/30 bg-black/20 backdrop-blur-md hover:bg-action hover:text-black transition-all shadow-2xl"
           >
             Close Gallery
           </Button>
        </div>

      </div>
    </Modal>
  );
};

export default GalleryModal;