import React, { useRef, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useAudioAsset } from '../../hooks/useAudioAsset';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AudioPlayButtonProps {
  assetId?: string;
  url?: string;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({ assetId, url, className }) => {
  const { asset, loading } = useAudioAsset({ assetId, url });
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Render nothing while loading or when no asset is available
  if (loading || !asset || !asset.audio_url) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!audioRef.current) {
      audioRef.current = new Audio(asset.audio_url as string);
      audioRef.current.addEventListener('ended', () => setPlaying(false));
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={playing ? 'Pause audio' : 'Listen to audio'}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3',
        'text-xs font-sans font-semibold uppercase tracking-wide',
        'rounded-full border border-border bg-surface/80 backdrop-blur-sm',
        'text-primary transition-all duration-500 ease-out',
        'hover:bg-surface hover:border-primary/40 hover:shadow-sm',
        'active:scale-95',
        className,
      )}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {playing ? 'pause' : 'play_arrow'}
      </span>
      <span>{playing ? 'Pause' : 'Listen'}</span>
    </button>
  );
};

export default AudioPlayButton;
