import React from 'react';
import {
    Typography,
    Button,
    MediaImage,
    AudioPlayer,
    AkhaQuote,
    Badge,
    ShareButton,
} from '../ui/index';
import AkhaThemedLine from '../divider/AkhaThemedLine';
import AkhaPixelLine from '../divider/AkhaPixelLine';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';

interface HeaderSinglePostProps {
    title: string;
    subtitle?: string | null;
    primaryImage?: string | null;      // now a direct URL from cover_data.image_url
    primaryImageAlt?: string | null;   // from cover_data.alt_text
    audioAssetId?: string | null;
    hasAudio?: boolean;
    quote?: string | null;
    authorName?: string | null;        // from author.name
    categoryName?: string | null;      // category title
    /** Active diet label (e.g. "VEGAN") — shown as a badge below category on the hero image */
    dietLabel?: string | null;
    onShare: () => void;
    isCopied?: boolean;
    theme?: string;
}

const HeaderSinglePost: React.FC<HeaderSinglePostProps> = ({
    title,
    subtitle,
    primaryImage,
    primaryImageAlt,
    audioAssetId,
    hasAudio,
    quote,
    authorName,
    categoryName,
    dietLabel,
    onShare,
    isCopied,
    theme,
}) => {
    return (
        <div className="flex flex-col [gap:var(--space-fluid-l)]">
            {/* 1. HERO */}
            <div 
                className="relative w-full aspect-[16/9] overflow-hidden rounded-[2rem] md:rounded-[3.5rem] isolate border-2 border-border/30"
                style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
            >
                <div className="absolute inset-0 z-10 hidden md:block bg-gradient-to-t from-black via-black/60 to-black/0 mix-blend-multiply" />

                {primaryImage && primaryImage.trim() !== '' ? (
                    <img
                        src={primaryImage}
                        alt={primaryImageAlt || title}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-bottom"
                    />
                ) : (
                    <div className="absolute inset-0 bg-surface" />
                )}

                {/* Top Badges (Left: Category, Right: Author + Diet) */}
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
                    {(authorName || dietLabel) && (
                        <div className="flex flex-col items-end [gap:var(--space-fluid-2xs)]">
                            {authorName && (
                                <Badge
                                    variant="mineral"
                                    size="sm"
                                    className="px-3 py-1 md:px-6 md:py-2.5 bg-white/5 border-white/10 text-white/90 backdrop-blur-sm"
                                    icon="person"
                                >
                                    {t('blog:byAuthor')} {authorName}
                                </Badge>
                            )}
                            {dietLabel && (
                                <Badge
                                    variant="mineral"
                                    size="sm"
                                    icon="eco"
                                    className="px-3 py-1 md:px-6 md:py-2.5 bg-action/80 border-action/40 text-white backdrop-blur-md"
                                >
                                    {dietLabel}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Overlay content - desktop only */}
                <div className="absolute inset-0 z-20 hidden md:flex flex-col justify-end [padding:var(--space-fluid-2xl)]">
                    <div className="flex flex-col [gap:var(--space-fluid-xs)] max-w-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        <Typography variant="h1" className="text-white leading-[1.1] tracking-tight">
                            {title}
                        </Typography>

                        <AkhaPixelLine
                            length="medium"
                            size={7}
                            opacity={0.8}
                            animate={true}
                            theme={theme as any}
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

            {/* 2. MOBILE TITLE BLOCK — below photo on mobile, hidden on md+ (title is overlay on hero) */}
            {/* MOBILE TITLE BLOCK — aria-hidden="true" because this is a visual-only duplicate of the
                desktop hero content (title + subtitle). The desktop hero block is the canonical
                accessible content; this block is CSS-shown on mobile but must be hidden from
                screen readers to prevent text being read twice (T05 duplicate text fix).
                Screen readers on mobile will read the desktop hero content (which is in the DOM
                even when visually hidden by md:hidden). */}
            <div className="md:hidden flex flex-col [gap:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)]" aria-hidden="true">
                <Typography variant="h2" as="p" className="text-title leading-[1.1] tracking-tight">
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

            {/* 3. AUDIO PLAYER + SHARE BUTTON (md size) */}
            <div className="flex flex-col md:flex-row items-start justify-center [gap:var(--space-fluid-s)] max-w-3xl mx-auto w-full [padding-inline:var(--space-fluid-m)] md:[padding-inline:0]">
                {hasAudio && audioAssetId && (
                    <AudioPlayer
                        assetId={audioAssetId}
                        hideTranscript={false}
                        className="w-full md:w-[720px]"
                    />
                )}
                <ShareButton onShare={onShare} isCopied={isCopied} />
            </div>

            {/* 4. QUOTE */}
            {quote && (
                <AkhaQuote variant="base" align="left" className="max-w-3xl mx-auto">
                    {quote}
                </AkhaQuote>
            )}

            {/* 5. DIVIDER */}
            <AkhaThemedLine theme={theme as any} className="![padding-bottom:0]" />
        </div>
    );
};

export default HeaderSinglePost;
