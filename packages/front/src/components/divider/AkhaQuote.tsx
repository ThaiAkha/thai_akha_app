import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';
import AkhaPixelPattern from './AkhaPixelPattern';

interface AkhaQuoteProps {
    /** Text content of the quote */
    children: React.ReactNode;
    /** Style variant: 'main' is larger (h4), 'base' is standard (h4 compact) */
    variant?: 'main' | 'base';
    /** Content alignment and side-line position */
    align?: 'left' | 'right';
    /** Optional author / signature — always aligned right below the quote */
    author?: string;
    /** Additional CSS classes */
    className?: string;
    /** Text color from Design System tokens */
    color?: 'title' | 'sub' | 'muted' | 'inverse' | 'inherit' | 'primary' | 'secondary' | 'action';
    /** Optional theme override */
    theme?: any;
}

/**
 * AkhaQuote - A stylized quote component featuring traditional Akha vertical pixel patterns.
 * Designed for hero sections and highlighted story blocks.
 *
 * Variants: 'main' (larger pixel line, h4) | 'base' (compact pixel line, h4)
 * Use `author` for the signature line, always displayed right-aligned.
 */
const AkhaQuote: React.FC<AkhaQuoteProps> = ({
    children,
    variant = 'main',
    align = 'left',
    author,
    className,
    color,
    theme
}) => {
    const isMain = variant === 'main';
    const isRight = align === 'right';
 
    return (
        <div className={cn("flex flex-col [gap:var(--space-fluid-xs)]", className)}>
            <blockquote
                className={cn(
                    "m-0 p-0 flex items-start [gap:var(--space-fluid-m-xl)]",
                    isRight ? "flex-row-reverse text-right" : "flex-row text-left",
                )}
            >
                {/* Akha Vertical Line */}
                <AkhaPixelPattern
                    variant="line_vertical"
                    size={8}
                    theme={theme}
                    opacity={0.9}
                    className={cn(
                        "shrink-0",
                        isMain ? "h-12 md:h-16" : "h-8 md:h-10"
                    )}
                    animateInView
                />

                {/* Quote Text */}
                <Typography
                    variant={isMain ? "h4" : "paragraphL"}
                    color={color}
                    className={cn(
                        "italic",
                        isMain ? "font-bold" : ""
                    )}
                >
                    "{children}"
                </Typography>
            </blockquote>

            {/* Firma — sempre allineata a destra */}
            {author && (
                <Typography
                    variant="paragraphS"
                    color="muted"
                    className="text-right italic [padding-inline:var(--space-fluid-m)]"
                >
                    — {author}
                </Typography>
            )}
        </div>
    );
};

export default AkhaQuote;
