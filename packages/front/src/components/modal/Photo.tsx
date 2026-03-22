import React from 'react';
import { Icon, MediaImage } from '../ui';
import { GalleryItem } from './GalleryModal';

interface PhotoProps {
  item: GalleryItem;
  onClick: (item: GalleryItem) => void;
}

export const Photo: React.FC<PhotoProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="group relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 cursor-pointer shadow-lg hover:-translate-y-2 transition-all duration-500 isolate"
    >
      <MediaImage 
        assetId={item.asset_id}
        url={item.image_url} 
        fallbackAlt={item.title || 'Photo'} 
        showCaption={false}
        imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
        <Icon name="zoom_in" className="text-white opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
};

export default Photo;
