import React, { useState } from 'react';
import { Icon, Typography } from '../ui';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface VideoProps {
  videoId: string;
  imageUrl?: string;
  altText?: string;
  title?: string;
  className?: string;
  onClick?: () => void;
}

export const Video: React.FC<VideoProps> = ({ 
  videoId,
  imageUrl, 
  altText,
  title,
  className,
  onClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div className={`flex flex-col [gap:var(--space-fluid-s)] ${className || ''}`}>
      <div 
        className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group/video bg-black aspect-video cursor-pointer"
        onClick={!isPlaying ? handleClick : undefined}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 w-full h-full">
            {imageUrl && (
              <img 
                src={imageUrl} 
                className="w-full h-full object-cover opacity-80 group-hover/video:scale-105 transition-all duration-[2s]" 
                alt={altText || title || t.components.media.videoThumbnail} 
              />
            )}
            <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 bg-gradient-to-t from-black/50 to-transparent">
              <div className="size-12 sm:size-14 rounded-full bg-primary/90 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover/video:bg-primary group-hover/video:scale-110 shadow-lg transition-transform">
                <Icon name="play_arrow" size="md" />
              </div>
            </div>
          </div>
        ) : (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&autohide=1&autoplay=1`}
            title={title}
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 z-20 w-full h-full bg-black animate-in fade-in duration-500"
          />
        )}
      </div>
      {title && (
        <Typography variant="h6" className="text-title text-center font-bold px-4">
          {title}
        </Typography>
      )}
    </div>
  );
};

export default Video;
