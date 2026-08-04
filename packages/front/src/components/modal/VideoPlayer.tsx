import React, { useState } from 'react';
import { Video } from './Video';
import VideoModal from './VideoModal';

/**
 * VideoPlayer — embed YouTube diretto.
 * I video vivono su YouTube: si passa il videoId (ID YouTube) inline, niente DB.
 * Cover: thumbnail YouTube di default, override opzionale via imageUrl.
 */
interface VideoPlayerProps {
  videoId: string;
  title?: string;
  imageUrl?: string;
  altText?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, imageUrl, altText, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!videoId) return null;

  const cover = imageUrl ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <>
      <Video
        videoId={videoId}
        title={title}
        imageUrl={cover}
        altText={altText}
        className={className}
        onClick={() => setIsModalOpen(true)}
      />

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoId={videoId}
        title={title}
        backgroundImage={cover}
      />
    </>
  );
};

export default VideoPlayer;
