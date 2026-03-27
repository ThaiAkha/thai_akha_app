import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, AkhaPixelPattern } from './index';

interface AkhaQuoteProps {
    /** Text content of the quote */
    children: React.ReactNode;
    /** Style variant: 'main' is larger (h3), 'base' is standard (h5) */
    variant?: 'main' | 'base';
    /** Content alignment and side-line position */
    align?: 'left' | 'right';
    /** Additional CSS classes */
    className?: string;
}

/**
 * AkhaQuote - A stylized quote component featuring traditional Akha vertical pixel patterns.
 * Designed for hero sections and highlighted story blocks.
 */
const AkhaQuote: React.FC<AkhaQuoteProps> = ({
    children,
    variant = 'main',
    align = 'left',
    className
}) => {
    const isMain = variant === 'main';
    const isRight = align === 'right';

    return (
        <blockquote 
            className={cn(
                "flex items-start gap-4 md:gap-6",
                isRight ? "flex-row-reverse text-right" : "flex-row text-left",
                className
            )}
        >
            {/* Akha Vertical Line */}
            <AkhaPixelPattern 
                variant="line_vertical" 
                size={isMain ? 10 : 8} 
                className={cn(
                    "shrink-0",
                    isMain ? "h-12 md:h-16" : "h-8 md:h-10"
                )}
                animateInView
            />

            {/* Quote Text */}
            <Typography
                variant={isMain ? 'h3' : 'h5'}
                className={cn(
                    "italic drop-shadow-md",
                    isMain ? "text-white/90" : "text-gray-800 dark:text-gray-200"
                )}
            >
                "{children}"
            </Typography>
        </blockquote>
    );
};

export default AkhaQuote;
