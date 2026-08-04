import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useAudioAsset } from '../../hooks/useAudioAsset';
import { Typography, Icon } from '../ui';
import { t } from '@thaiakha/shared/lib/ui-strings';

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
  /** Optional manual duration in seconds (overrides database) */
  duration?: number;
  /** Optional manual transcript text (overrides database) */
  transcript?: string;
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
  duration: durationOverride,
  transcript: transcriptOverride,
}) => {
  const { asset, loading, error } = useAudioAsset({ assetId, categoryId, url });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [eqBars, setEqBars] = useState([20, 40, 30, 60, 45, 25, 55, 35]);

  const audioSrc = url ?? asset?.audio_url;
  const displayTitle = titleOverride ?? asset?.title ?? t.components.audioPlayer.fallbackTitle;
  const displayCaption = descriptionOverride ?? asset?.caption ?? t.components.audioPlayer.fallbackDesc;
  const displayDuration = durationOverride ?? asset?.duration_seconds;
  const displayTranscript = transcriptOverride ?? asset?.transcript;

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
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setEqBars(Array.from({ length: 8 }, () => Math.random() * 80 + 20));
      }, 200);
    } else {
      setEqBars([20, 60, 30, 80, 40, 20, 50, 30]); // reset states
    }
    return () => {
      if (interval) clearInterval(interval);
    };
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
        aria-label={isPlaying ? t.components.audioPlayer.pauseAudio : t.components.audioPlayer.playAudio}
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
      <div className="rounded-full bg-surface shadow-sm">
        <div
          className="group relative flex items-center bg-secondary/10 border-2 border-secondary/20 hover:border-secondary/40 rounded-full overflow-hidden transition-all w-full cursor-pointer select-none"
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
            {displayTranscript && <div itemProp="transcript">{displayTranscript}</div>}
          </div>

          {/* BASE LAYER (Unfilled - Transparent Secondary) */}
          <div className="flex items-center gap-4 w-full py-2 px-2 relative z-0">
            {/* LEFT GROUP: play + rewind */}
            <div className="flex items-center gap-3 shrink-0">
              {/* PLAY BUTTON (Outline/Transparent) */}
              <button
                className="relative z-20 size-12 rounded-full border-2 border-secondary flex items-center justify-center text-secondary shrink-0 hover:bg-secondary/20 transition-colors pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? t.components.audioPlayer.pauseStory : t.components.audioPlayer.playStory}
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
                  className="relative z-20 size-12 rounded-full border-2 border-secondary flex items-center justify-center text-secondary shrink-0 hover:bg-secondary/20 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  aria-label={t.components.audioPlayer.restartAria}
                  title={t.components.audioPlayer.restartTitle}
                >
                  <Icon name="rewind" size="sm" />
                </button>
              )}
            </div>

            {/* TEXT CONTENT & EQUALIZER */}
            <div className="flex-1 min-w-0 pointer-events-none flex flex-col justify-center [gap:var(--space-fluid-3xs)]">
              {/* as="p": player track title — UI label, not a page section heading (fixes D04). */}
              <Typography variant="h6" as="p" className="truncate text-secondary-400">
                {displayTitle}
              </Typography>
              <Typography variant="microLabel" className="truncate opacity-70 italic text-secondary-400">
                {displayCaption}
              </Typography>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* DIVIDER */}
              <div className="h-8 w-px bg-secondary/30 shrink-0" />

              {/* TIME + EQ RECTANGLE */}
              <div
                className="flex flex-col items-center justify-center rounded-full bg-secondary shrink-0 size-12 [gap:var(--space-fluid-2xs)]"
              >
                <Typography variant="numericRegular" className="text-[10px] leading-none text-white font-medium">
                  {formatTime(displayDuration)}
                </Typography>
                <div className="flex items-end justify-center gap-[2px] h-3">
                  {eqBars.map((h, i) => (
                    <div key={i} className="w-[1.5px] bg-white rounded-t-[1px] transition-all duration-200" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* TRANSCRIPT BUTTON (Base layer) */}
              {!hideTranscript && displayTranscript && (
                <button
                  className={cn(
                    "relative z-20 size-12 rounded-full border-2 flex items-center justify-center pointer-events-auto shrink-0 transition-colors",
                    showTranscript
                      ? "border-secondary bg-secondary text-white hover:bg-secondary/90"
                      : "border-secondary text-secondary hover:bg-secondary/20"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTranscript(!showTranscript);
                  }}
                  aria-label={showTranscript ? t.components.audioPlayer.hideTranscript : t.components.audioPlayer.readTranscript}
                >
                  <Icon name="FileText" size="lg" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* PROGRESS LAYER (Filled - Solid Secondary with White Text inside) */}
          <div
            className="absolute inset-0 bg-secondary pointer-events-none transition-all duration-200 ease-linear z-30 rounded-full overflow-hidden"
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
              WebkitClipPath: `inset(0 ${100 - progress}% 0 0)`
            }}
          >
            <div className="flex items-center gap-4 w-full py-2 px-4 h-full">
              {/* LEFT GROUP: play + rewind */}
              <div className="flex items-center gap-3 shrink-0">
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
                  <div className="size-12 rounded-full border-2 border-white flex items-center justify-center text-white shrink-0">
                    <Icon name="rewind" size="sm" />
                  </div>
                )}
              </div>

              {/* TEXT CONTENT & EQUALIZER (White) */}
              <div className="flex-1 min-w-0 pointer-events-none flex flex-col justify-center [gap:var(--space-fluid-2xs)]">
                {/* as="p": expanded player track title — UI label, not a heading (fixes D04). */}
                <Typography variant="h6" as="p" className="truncate text-white">
                  {displayTitle}
                </Typography>
                <Typography variant="microLabel" className="truncate opacity-90 italic text-white/80">
                  {displayCaption}
                </Typography>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* DIVIDER */}
                <div className="h-8 w-px bg-white/30 shrink-0" />

                {/* TIME + EQ RECTANGLE (inverted) */}
                <div
                  className="flex flex-col items-center justify-center rounded-full bg-white shrink-0 size-12 [gap:var(--space-fluid-2xs)]"
                >
                  <Typography variant="numericRegular" className="text-[10px] leading-none font-medium" style={{ color: 'var(--color-secondary)' }}>
                    {formatTime(displayDuration)}
                  </Typography>
                  <div className="flex items-end justify-center gap-[2px] h-3">
                    {eqBars.map((h, i) => (
                      <div key={i} className="w-[1.5px] rounded-t-[1px] transition-all duration-200" style={{ height: `${h}%`, backgroundColor: 'var(--color-secondary)' }} />
                    ))}
                  </div>
                </div>

                {/* TRANSCRIPT BUTTON (Progress layer) */}
                {!hideTranscript && displayTranscript && (
                  <div
                    className={cn(
                      "size-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      showTranscript
                        ? "border-white bg-white text-secondary"
                        : "border-white text-white"
                    )}
                  >
                    <Icon name="FileText" size="lg" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSCRIPT ACCORDION */}
      {displayTranscript && !hideTranscript && (
        <div className="[padding-inline:var(--space-fluid-s)]">
          <div className={cn(
            "grid transition-all duration-300 overflow-hidden",
            showTranscript ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="[padding:var(--space-fluid-s)] rounded-2xl bg-surface border border-border [margin-top:var(--space-fluid-xs)]">
                <Typography variant="paragraphS" className="text-desc leading-relaxed italic">
                  {displayTranscript}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
