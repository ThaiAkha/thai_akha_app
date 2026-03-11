import React from 'react';
import { Modal, Typography, Button } from './index';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
  videoTitle?: string;
  description?: string;
  buttonText?: string;
  backgroundImage?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId,
  title = "Cinematic Experience",
  videoTitle,
  description,
  buttonText = "Close Video",
  backgroundImage = "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
}) => {
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
        <div className="w-full max-w-[90vw] px-6 md:px-12 text-center space-y-3 mb-12 md:mb-24 animate-in slide-in-from-top-4 duration-700">
          
          <div className="flex items-center justify-center gap-4 opacity-70 mb-2">
            <div className="h-px w-8 md:w-16 bg-white/30" />
            <span className="text-action text-[10px] md:text-[12px] tracking-[0.4em] font-black uppercase shadow-black drop-shadow-md whitespace-nowrap">
              {title}
            </span>
            <div className="h-px w-8 md:w-16 bg-white/30" />
          </div>

          {videoTitle && (
            <h2 className="text-3xl md:text-6xl lg:text-7xl font-display font-black italic uppercase tracking-tighter text-white drop-shadow-2xl leading-none py-2">
              {videoTitle}
            </h2>
          )}

          {description && (
            <Typography 
              variant="paragraphM" 
              className="text-white/80 max-w-2xl mx-auto drop-shadow-md font-medium"
            >
              {description}
            </Typography>
          )}
        </div>

        {/* B. PLAYER VIDEO (Box 16:9) */}
        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 bg-black group ring-1 ring-white/10">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 z-20 w-full h-full bg-black"
          />
        </div>

        {/* C. FOOTER BUTTON */}
        <div className="mt-16 md:mt-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
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

export default VideoModal;