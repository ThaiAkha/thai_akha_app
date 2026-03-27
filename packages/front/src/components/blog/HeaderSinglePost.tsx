import React from 'react';
import {
    Typography,
    Badge,
    Button,
    Icon,
    AkhaPixelLine,
    MediaImage,
    AudioPlayer,
    AkhaQuote,
} from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface HeaderSinglePostProps {
    title: string;
    subtitle?: string | null;
    category?: string | null;
    primaryImage?: string | null;
    sectionIcon: string;
    audioAssetId?: string | null;
    hasAudio?: boolean;
    quote?: string | null;
    onShare: () => void;
}

const HeaderSinglePost: React.FC<HeaderSinglePostProps> = ({
    title,
    subtitle,
    category,
    primaryImage,
    sectionIcon,
    audioAssetId,
    hasAudio,
    quote,
    onShare,
}) => {
    return (
        <div className="flex flex-col gap-8">
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
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-6 lg:p-10 gap-3">
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto w-full px-6 md:px-0 mt-4 mb-6">
                {hasAudio && audioAssetId && (
                    <div className="w-full flex-1">
                        <AudioPlayer
                            assetId={audioAssetId}
                            hideTranscript={true}
                        />
                    </div>
                )}
                <Button
                    variant="social"
                    size="md"
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
            <AkhaPixelLine opacity={0.8} />
        </div>
    );
};

export default HeaderSinglePost;
