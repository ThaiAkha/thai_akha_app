import React from 'react';
import { MediaImage } from '../ui';

interface GalleryProps {
  imageUrl: string;
  onClick: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ imageUrl, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-square rounded-[2.5rem] overflow-hidden border-2 border-primary/30 cursor-pointer shadow-2xl hover:-translate-y-2 transition-all duration-500 isolate"
    >
      <MediaImage 
        url={imageUrl} 
        fallbackAlt="View Gallery" 
        showCaption={false}
        imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white font-black uppercase border border-white/10">
          View Gallery
        </span>
      </div>
    </div>
  );
};

export default Gallery;
