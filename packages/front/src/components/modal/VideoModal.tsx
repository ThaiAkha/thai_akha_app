import React from 'react';
import { Button } from '../ui/index';
import Modal from './Modal';
import ModalMediaHeader from './ModalMediaHeader';
import { t } from '@thaiakha/shared/lib/ui-strings';

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
  buttonText = t.common.closeVideo,
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
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="Atmosphere"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
        )}
      </div>

      {/* CLICK-TO-CLOSE — tutto schermo */}
      <div className="fixed inset-0 z-40 cursor-pointer" onClick={onClose} />

      {/* CONTENT — centrato, non intercetta i click tranne gli elementi interattivi */}
      <div className="relative z-50 w-full max-w-7xl mx-auto flex flex-col items-center pointer-events-none [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-l)]">

        {/* TITLE + DESCRIPTION */}
        <div className="pointer-events-none w-full">
          <ModalMediaHeader title={title} description={description} />
        </div>

        {/* VIDEO BOX — sempre aspect-video */}
        <div
          className="pointer-events-auto relative w-[90%] aspect-video rounded-[3rem] overflow-hidden border border-white/10 bg-black animate-in zoom-in-95 duration-500"
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
        <div className="pointer-events-auto [margin-top:var(--space-fluid-l)]">
          <Button
            variant="outline"
            size="sm"
            icon="close"
            onClick={onClose}
            className="text-action border-action/20"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VideoModal;
