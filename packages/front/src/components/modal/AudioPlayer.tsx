import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useAudioAsset } from '../../hooks/useAudioAsset';
import { Typography, Icon } from '../ui';

interface AudioPlayerProps {
  /** UUID of the asset in audio_assets */
  assetId?: string;
  /** ID of the recipe category to fetch story from */
  categoryId?: string;
  /** Direct audio URL (public URL) */
  url?: string;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Extra className applied to the pill wrapper */
  className?: string;
  /** Hide transcript button */
  hideTranscript?: boolean;
  /** Display variant: full (default) or compact (circular icon only) */
  variant?: 'full' | 'compact';
  /** Show rewind button */
  showRewind?: boolean;
}

/**
 * Premium Audio Player Component (Mountain Pill Design)
 * 📐 Shape: Pill (rounded-full)
 * 🎨 Theme: Secondary (Mountain Glow)
 * 🔍 SEO: Embeds AudioObject JSON-LD & Hidden Transcript
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  assetId,
  categoryId,
  url,
  title: titleOverride,
  description: descriptionOverride,
  className,
  hideTranscript = false,
  variant = 'full',
  showRewind = true,
}) => {
  const { asset, loading, error } = useAudioAsset({ assetId, categoryId, url });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [eqBars, setEqBars] = useState([20, 40, 30, 60]);

  const audioSrc = url ?? asset?.audio_url;
  const displayTitle = titleOverride ?? asset?.title ?? 'Akha Kitchen Wisdom';
  const displayCaption = descriptionOverride ?? asset?.caption ?? 'Traditional voice story from the mountains.';

  // Format duration into MM:SS
  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const updateProgress = () => {
        const p = (audio.currentTime / audio.duration) * 100;
        setProgress(p || 0);
      };

      const onEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [audioSrc]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setEqBars([
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
        ]);
      }, 200);
    } else {
      setEqBars([20, 60, 30, 80]); // reset states
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return variant === 'compact' ? (
      <div className={cn("animate-pulse size-12 rounded-full bg-surface border border-border", className)} />
    ) : (
      <div className={cn("animate-pulse bg-surface border border-border rounded-full h-16 w-full", className)} />
    );
  }

  if (error || !audioSrc) return null;

  // ── COMPACT VARIANT: Circular play button only ──────────────────────────────────
  if (variant === 'compact') {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className={cn(
          "relative size-12 rounded-full flex items-center justify-center",
          "border-2 border-secondary bg-secondary/10 text-secondary",
          "hover:bg-secondary/20 transition-all duration-300",
          "active:scale-95",
          className
        )}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
        <Icon
          name={isPlaying ? "pause" : "play_arrow"}
          size="md"
          className={cn(isPlaying ? "" : "ml-0.5")}
        />
      </button>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <div
        className="group relative flex items-center bg-secondary/10 border-2 border-secondary/20 hover:border-secondary/40 rounded-full overflow-hidden shadow-sm transition-all w-full cursor-pointer select-none"
        onClick={(e) => {
          if (!audioRef.current) return;

          // First click: always start from beginning
          if (!isPlaying) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
            return;
          }

          // Already playing: allow seeking to clicked position
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newPercentage = Math.max(0, Math.min(1, clickX / rect.width));
          const duration = audioRef.current.duration;

          if (duration && isFinite(duration)) {
            audioRef.current.currentTime = newPercentage * duration;
          }
        }}
      >
        <audio ref={audioRef} src={audioSrc} preload="metadata" />

        {/* SEO METADATA (Hidden) */}
        <div className="hidden" aria-hidden="true" itemScope itemType="http://schema.org/AudioObject">
          <meta itemProp="name" content={displayTitle} />
          <meta itemProp="description" content={displayCaption} />
          <meta itemProp="encodingFormat" content={asset?.mime_type || 'audio/mpeg'} />
          <meta itemProp="contentUrl" content={audioSrc} />
          {asset?.transcript && <div itemProp="transcript">{asset.transcript}</div>}
        </div>

        {/* BASE LAYER (Unfilled - Transparent Secondary) */}
        <div className="flex items-center gap-4 w-full p-2 pr-6 relative z-0">
          {/* PLAY BUTTON (Outline/Transparent) */}
          <button
            className="relative z-20 size-12 rounded-full border-2 border-secondary flex items-center justify-center text-secondary shrink-0 hover:bg-secondary/20 transition-colors pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? "Pause mystery story" : "Play mystery story"}
          >
            <Icon
              name={isPlaying ? "pause" : "play_arrow"}
              size="lg"
              className={cn(isPlaying ? "" : "ml-1")}
            />
          </button>

          {/* REWIND BUTTON (appears when playing) */}
          {isPlaying && showRewind && (
            <button
              className="relative z-20 size-10 rounded-full border border-secondary flex items-center justify-center text-secondary shrink-0 hover:bg-secondary/20 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
              }}
              aria-label="Restart from beginning"
              title="Restart"
            >
              <Icon name="rewind" size="sm" />
            </button>
          )}

          {/* TEXT CONTENT & EQUALIZER */}
          <div className="flex-1 min-w-0 pointer-events-none flex flex-col justify-center gap-0.5">
            <div className="flex items-center justify-between gap-3">
              <Typography variant="h6" className="truncate text-secondary">
                {displayTitle}
              </Typography>
              <div className="flex items-center gap-2 shrink-0">
                <Typography variant="microLabel" className="text-secondary/70">
                  {formatTime(asset?.duration_seconds)}
                </Typography>
                {/* EQUALIZER */}
                <div className="flex items-end gap-[2px] h-4 opacity-80 w-4">
                  {eqBars.map((h, i) => (
                    <div key={i} className="w-[2px] bg-secondary rounded-t-[1px] transition-all duration-200" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <Typography variant="microLabel" className="truncate opacity-70 italic text-secondary/80">
              {displayCaption}
            </Typography>
          </div>
        </div>

        {/* PROGRESS LAYER (Filled - Solid Secondary with White Text inside) */}
        <div
          className="absolute inset-0 bg-secondary pointer-events-none transition-all duration-200 ease-linear z-30"
          style={{
            clipPath: `inset(0 ${100 - progress}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - progress}% 0 0)`
          }}
        >
          <div className="flex items-center gap-4 w-full p-2 pr-6 h-full">
            {/* PLAY BUTTON (White Outline) */}
            <div className="size-12 rounded-full border-2 border-white flex items-center justify-center text-white shrink-0">
              <Icon
                name={isPlaying ? "pause" : "play_arrow"}
                size="lg"
                className={cn(isPlaying ? "" : "ml-1")}
              />
            </div>

            {/* REWIND BUTTON (appears when playing) */}
            {isPlaying && showRewind && (
              <div className="size-10 rounded-full border border-white flex items-center justify-center text-white shrink-0">
                <Icon name="rewind" size="sm" />
              </div>
            )}

            {/* TEXT CONTENT & EQUALIZER (White) */}
            <div className="flex-1 min-w-0 pointer-events-none flex flex-col justify-center gap-0.5">
              <div className="flex items-center justify-between gap-3">
                <Typography variant="h6" className="truncate text-white">
                  {displayTitle}
                </Typography>
                <div className="flex items-center gap-2 shrink-0">
                  <Typography variant="microLabel" className="text-white/80">
                    {formatTime(asset?.duration_seconds)}
                  </Typography>
                  {/* EQUALIZER (White) */}
                  <div className="flex items-end gap-[2px] h-4 opacity-90 w-4">
                    {eqBars.map((h, i) => (
                      <div key={i} className="w-[2px] bg-white rounded-t-[1px] transition-all duration-200" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <Typography variant="microLabel" className="truncate opacity-90 italic text-white/80">
                {displayCaption}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSCRIPT ACCORDION */}
      {asset?.transcript && !hideTranscript && (
        <div className="px-4">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary hover:opacity-80 transition-opacity"
          >
            <Icon name={showTranscript ? "keyboard_arrow_up" : "keyboard_arrow_down"} size="sm" />
            {showTranscript ? "Hide Transcript" : "Read Transcript"}
          </button>

          <div className={cn(
            "mt-3 overflow-hidden transition-all duration-300",
            showTranscript ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border">
              <Typography variant="paragraphS" className="text-desc leading-relaxed italic">
                {asset.transcript}
              </Typography>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
