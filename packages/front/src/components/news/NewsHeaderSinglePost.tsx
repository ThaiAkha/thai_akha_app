import React from 'react';
import { Typography, Button, AudioPlayer, Badge } from '../ui';
import { AkhaThemedLine } from '../blog';
import AkhaPixelLine from '../divider/AkhaPixelLine';
import { AkhaTheme } from '../divider/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';

interface NewsHeaderSinglePostProps {
  title: string;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  authorName?: string | null;
  categoryName?: string | null;
  audioAssetId?: string | null;
  hasAudio?: boolean;
  quote?: string | null;
  onShare: () => void;
  isCopied?: boolean;
  theme?: AkhaTheme;
}

export const NewsHeaderSinglePost: React.FC<NewsHeaderSinglePostProps> = ({
  title,
  subtitle,
  coverImageUrl,
  coverImageAlt,
  authorName,
  categoryName,
  audioAssetId,
  hasAudio,
  onShare,
  isCopied,
  theme,
}) => {
  return (
    <div className="flex flex-col [gap:var(--space-fluid-l)]">
      {/* 0. MOBILE TITLE BLOCK (hidden on md) */}
      <div className="md:hidden flex flex-col [gap:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)]">
        <Typography variant="h2" className="text-title leading-[1.1] tracking-tight">
          {title}
        </Typography>

        <AkhaPixelLine
          length="medium"
          size={6}
          opacity={0.8}
          animate={true}
          theme={theme as any}
          className="justify-start py-2"
        />

        {subtitle && (
          <Typography variant="paragraphM" className="text-desc leading-relaxed">
            {subtitle}
          </Typography>
        )}
      </div>

      {/* 1. HERO */}
      <div 
        className="relative w-full aspect-[16/9] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] isolate border-2 border-border/30"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
      >
        <div className="absolute inset-0 z-10 hidden md:block bg-gradient-to-t from-black via-black/60 to-black/0 mix-blend-multiply" />

        {coverImageUrl && coverImageUrl.trim() !== '' ? (
          <img
            src={coverImageUrl}
            alt={coverImageAlt || title}
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
        ) : (
          <div className="absolute inset-0 bg-surface" />
        )}

        {/* 1a. TOP BADGES (Left: Category, Right: Author) */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between [padding:var(--space-fluid-m)] md:[padding:var(--space-fluid-xl)]">
          {categoryName ? (
            <Badge 
              variant="mineral" 
              size="sm" 
              className="px-3 py-1 md:px-6 md:py-2.5 bg-white/10 border-white/20 text-white backdrop-blur-md"
            >
              {categoryName}
            </Badge>
          ) : <div />}
          {authorName && (
            <Badge
              variant="mineral"
              size="sm"
              className="px-3 py-1 md:px-6 md:py-2.5 bg-white/5 border-white/10 text-white/90 backdrop-blur-sm"
              icon="person"
            >
              {authorName}
            </Badge>
          )}
        </div>

        {/* Overlay content — desktop only */}
        <div className="absolute inset-0 z-20 hidden md:flex flex-col justify-end [padding:var(--space-fluid-2xl)]">
          <div className="flex flex-col [gap:var(--space-fluid-xs)] max-w-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <Typography variant="h1" className="text-white leading-[1.1] tracking-tight">
              {title}
            </Typography>
            
            <AkhaPixelLine
              geometry="none"
              length="medium"
              size={8}
              opacity={0.9}
              animate={true}
              theme={theme}
              className="[padding-block:var(--space-fluid-2xs)] justify-start"
            />
            
            {subtitle && (
              <Typography variant="paragraphM" className="text-white/80 max-w-3xl leading-relaxed">
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
      </div>

      {/* 3. AUDIO PLAYER + SHARE BUTTON */}
      <div className="flex flex-col md:flex-row items-start justify-center [gap:var(--space-fluid-s)] max-w-3xl mx-auto w-full [padding-inline:var(--space-fluid-m)] md:[padding-inline:0]">
        {hasAudio && audioAssetId && (
          <div className="w-full flex-1">
            <AudioPlayer
              assetId={audioAssetId}
              hideTranscript={false}
            />
          </div>
        )}
        <div className="relative group w-full md:w-auto">
          <Button
            variant={isCopied ? 'action' : 'social'}
            size="lg"
            icon={isCopied ? 'done' : 'share'}
            onClick={onShare}
            className={cn(
              "whitespace-nowrap w-full md:w-auto shrink-0 px-8 py-4 transition-all duration-300",
              isCopied && "scale-105"
            )}
          />
          {isCopied && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
              <div className="bg-brand-glass backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xl">
                <Typography variant="microLabel" className="text-white whitespace-nowrap">
                  Link Copied!
                </Typography>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. DIVIDER */}
      <AkhaThemedLine theme={theme} size={8} opacity={0.6} />
    </div>
  );
};

export default NewsHeaderSinglePost;
