import React from 'react';
import { Button } from '../ui/index';
import Modal from './Modal';
import ModalMediaHeader from './ModalMediaHeader';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
  description?: string;
  buttonText?: string;
  backgroundImage?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId,
  title,
  description,
  buttonText = "Close Video",
  backgroundImage = '',
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
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <img
          src={backgroundImage}
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-40 blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
      </div>

      {/* CLICK-OUTSIDE WRAPPER — clicking the dark area around the video closes */}
      <div
        className="w-full max-w-7xl mx-auto flex flex-col items-center relative z-50 px-4 py-10 cursor-pointer"
        onClick={onClose}
      >
        {/* TITLE + DESCRIPTION outside the video, above */}
        <ModalMediaHeader title={title} description={description} />

        {/* VIDEO BOX — 16:9 */}
        <div
          className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 bg-black ring-1 ring-white/10 animate-in zoom-in-95 duration-500 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
            title={title}
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 z-20 w-full h-full bg-black"
          />
        </div>

        {/* CLOSE BUTTON */}
        <div
          className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          onClick={(e) => e.stopPropagation()}
        >
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
