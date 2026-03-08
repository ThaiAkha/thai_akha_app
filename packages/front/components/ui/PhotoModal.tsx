import React from 'react';
import { Modal, Button } from './index';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  title?: string;
  description?: string;
  buttonText?: string;
  backgroundImage?: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  image,
  title = "Photo View",
  description,
  buttonText = "Close Photo",
  backgroundImage = "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="cinema"
      size="full"
      hideCloseButton={true}
      className="bg-transparent shadow-none border-none p-0 w-full h-full flex flex-col items-center justify-center"
    >
      {/* 1. SFONDO ATMOSFERICO */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <img
          src={backgroundImage}
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-60 blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
      </div>

      {/* 2. CONTENUTO CENTRALE */}
      <div className="w-full flex flex-col items-center relative z-50">

        {/* A. HEADER TESTUALE */}
        <div className="w-full max-w-[90vw] px-6 md:px-12 text-center space-y-3 mb-8 md:mb-12 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center gap-4 opacity-70 mb-2">
            <div className="h-px w-8 md:w-16 bg-white/30" />
            <span className="text-action text-[10px] md:text-[12px] tracking-[0.4em] font-black uppercase shadow-black drop-shadow-md whitespace-nowrap">
              {title}
            </span>
            <div className="h-px w-8 md:w-16 bg-white/30" />
          </div>

          {description && (
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black italic uppercase tracking-tighter text-white drop-shadow-2xl leading-none py-2">
              "{description}"
            </h2>
          )}
        </div>

        {/* B. FOTO CONTAINER (Box Contenuto) */}
        {/* ✅ FIX: Aggiunto 'max-w-7xl mx-auto' per limitare la larghezza su Desktop ed evitare il full-screen eccessivo */}
        <div className="relative w-full max-w-7xl mx-auto aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 bg-black group ring-1 ring-white/10 animate-in zoom-in-95 duration-700 delay-100">
          <img
            src={image}
            alt={title}
            // Usa object-contain per vedere tutta la foto senza tagli, con bande nere cinematiche se necessario
            className="w-full h-full object-contain"
          />
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* C. FOOTER BUTTON */}
        <div className="mt-12 md:mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Button
            variant="mineral"
            size="xl"
            icon="close"
            onClick={onClose}
            className="rounded-full text-action border-action/20 hover:bg-action/10 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.6)]"
          >
            {buttonText}
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default PhotoModal;