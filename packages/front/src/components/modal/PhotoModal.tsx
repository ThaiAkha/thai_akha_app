import React from 'react';
import { Button, MediaImage } from '../ui/index';
import Modal from './Modal';
import ModalMediaHeader from './ModalMediaHeader';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  assetId?: string;
  title?: string;
  description?: string;
  quote?: string;
  buttonText?: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  image,
  assetId,
  title,
  description,
  quote,
  buttonText = "Close Photo",
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
      {/* ATMOSPHERIC BACKGROUND — blurred version of the photo */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <img
          src={image}
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-40 blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
      </div>

      {/* CLICK-OUTSIDE WRAPPER — clicking the dark area around the photo closes */}
      <div
        className="w-full max-w-7xl mx-auto flex flex-col items-center relative z-50 px-4 py-10 cursor-pointer"
        onClick={onClose}
      >
        {/* TITLE + DESCRIPTION outside the photo */}
        <ModalMediaHeader title={title} description={description} />

        {/* PHOTO BOX */}
        <div
          className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 bg-black ring-1 ring-white/10 animate-in zoom-in-95 duration-500 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <MediaImage
            assetId={assetId}
            url={image}
            fallbackAlt={title}
            showCaption={true}
            imgClassName="w-full h-full object-contain"
          />

          {/* QUOTE OVERLAY — inside the photo, bottom */}
          {quote && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <p className="font-display font-black italic text-white text-xl md:text-2xl leading-tight drop-shadow-2xl">
                "{quote}"
              </p>
            </div>
          )}
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

export default PhotoModal;
