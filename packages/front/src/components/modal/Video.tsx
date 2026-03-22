import React from 'react';
import { Icon } from '../ui';

interface VideoProps {
  imageUrl?: string;
  onClick?: () => void;
  variant?: 'thumbnail' | 'inline';
  videoId?: string;
  title?: string;
}

export const Video: React.FC<VideoProps> = ({ 
  imageUrl, 
  onClick, 
  variant = 'thumbnail',
  videoId,
  title
}) => {
  if (variant === 'inline' && videoId) {
    return (
      <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 bg-black ring-1 ring-white/10 group animate-in zoom-in-95 duration-700">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&autohide=1`}
          title={title}
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 z-20 w-full h-full bg-black transition-opacity duration-1000"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick} 
      className="relative h-64 rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl border border-white/10"
    >
      {imageUrl && (
        <img 
          src={imageUrl} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-[2s]" 
          alt={title || "Watch Trailer"} 
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="size-14 rounded-full bg-primary/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-3 group-hover:bg-white group-hover:text-black transition-all">
          <Icon name="play_arrow" size="md" />
        </div>
        <span className="text-white font-black uppercase text-sm tracking-widest italic">{title || "Watch Trailer"}</span>
      </div>
    </div>
  );
};

export default Video;

