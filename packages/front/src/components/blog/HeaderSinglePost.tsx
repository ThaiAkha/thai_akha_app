import React from 'react';
import {
    Typography,
    Button,
    Icon,
    MediaImage,
    AudioPlayer,
    AkhaQuote,
} from '../ui/index';
import AkhaHistoryLine from './AkhaHistoryLine';
import { cn } from '@thaiakha/shared/lib/utils';

interface HeaderSinglePostProps {
    title: string;
    subtitle?: string | null;
    primaryImage?: string | null;
    audioAssetId?: string | null;
    hasAudio?: boolean;
    quote?: string | null;
    onShare: () => void;
}

const HeaderSinglePost: React.FC<HeaderSinglePostProps> = ({
    title,
    subtitle,
    primaryImage,
    audioAssetId,
    hasAudio,
    quote,
    onShare,
}) => {
    return (
        <div className="flex flex-col [gap:var(--space-fluid-l)]">
            {/* 1. HERO */}
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[2.5rem]">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {primaryImage ? (
                    <MediaImage
                        assetId={primaryImage}
                        showCaption={false}
                        fallbackAlt={title}
                        className="absolute inset-0"
                        imgClassName="w-full h-full object-cover object-bottom"
                    />
                ) : ( /* If no primaryImage, render a simple background div */
                    <div className="absolute inset-0 bg-surface" />
                )}

                {/* Overlay content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end [padding:var(--space-fluid-l)] [gap:var(--space-fluid-xs)]">
                    <Typography variant="h2" className="text-white max-w-2xl">
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography variant="paragraphM" className="text-white/65 max-w-xl hidden md:block">
                            {subtitle}
                        </Typography>
                    )}
                </div>
            </div>

            {/* 2. AUDIO PLAYER + SHARE BUTTON (md size) */}
            <div className="flex flex-col md:flex-row items-start justify-center [gap:var(--space-fluid-s)] max-w-2xl mx-auto w-full [padding-inline:var(--space-fluid-m)] md:[padding-inline:0]">
                {hasAudio && audioAssetId && (
                    <div className="w-full flex-1">
                        <AudioPlayer
                            assetId={audioAssetId}
                            hideTranscript={false}
                        />
                    </div>
                )}
                <Button
                    variant="social"
                    size="lg"
                    icon="share"
                    onClick={onShare}
                    className="whitespace-nowrap w-full md:w-auto shrink-0 px-8 py-4"
                />
            </div>

            {/* 4. QUOTE */}
            {quote && (
                <AkhaQuote variant="base" align="left" className="max-w-2xl mx-auto">
                    {quote}
                </AkhaQuote>
            )}

            {/* 5. DIVIDER */}
            <AkhaHistoryLine />
        </div>
    );
};

export default HeaderSinglePost;
