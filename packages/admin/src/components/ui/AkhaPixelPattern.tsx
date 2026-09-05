import React, { useEffect, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { AKHA_PATTERNS, PatternName } from '@thaiakha/shared/data';

const COLOR_MAP: Record<number, string> = {
    0: 'bg-transparent',
    1: 'bg-[#C0C0C0] shadow-[0_0_2px_white]',              // Argento
    2: 'bg-[#1A1A1A] shadow-[0_0_2px_#000]',               // Nero
    3: 'bg-primary-500 shadow-[0_0_2px_#E31F33]',          // Cherry Red
    4: 'bg-action-500 shadow-[0_0_2px_#98C93C]',           // Lime Green
    5: 'bg-quiz-p-500 shadow-[0_0_2px_#9b3357]',           // Magenta (Quiz Set)
    6: 'bg-quiz-s-500 shadow-[0_0_2px_#553a5b]',           // Violet (Quiz Set)
    7: 'bg-btn-p-500 shadow-[0_0_2px_#FF6D00]',            // Orange
    8: 'bg-btn-s-500 shadow-[0_0_2px_#1CA3E6]',            // Blue Light
    9: 'bg-secondary-600 shadow-[0_0_2px_#8D1A31]',        // Dark Cherry
};

interface AkhaPixelPatternProps {
    variant?: PatternName;
    data?: number[];
    columns?: number;
    size?: number;
    speed?: number;
    className?: string;
    loop?: boolean;
    loopDelay?: number;
    expandFromCenter?: boolean;
}

const AkhaPixelPattern: React.FC<AkhaPixelPatternProps> = ({
    variant,
    data: customData,
    columns: customCols,
    size = 12,
    speed = 40,
    className,
    loop = false,
    loopDelay = 1000,
    expandFromCenter = false
}) => {
    const patternConfig = variant ? AKHA_PATTERNS[variant] : null;
    const activeData = patternConfig?.data || customData || AKHA_PATTERNS.diamond.data;
    const activeCols = patternConfig?.columns || customCols || 7;

    const [visibleCount, setVisibleCount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    // Restart the reveal timer only when the counter is reset to 0 (loop), not on every tick.
    const isAtStart = visibleCount === 0;
    const activeLength = activeData.length;

    useEffect(() => {
        if (expandFromCenter) {
            const t = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(t);
        }

        let timeoutId: ReturnType<typeof setTimeout>;
        const interval = setInterval(() => {
            setVisibleCount((prev) => {
                if (prev < activeLength) return prev + 1;
                if (loop) {
                    clearInterval(interval);
                    timeoutId = setTimeout(() => setVisibleCount(0), loopDelay);
                    return prev;
                }
                clearInterval(interval);
                return prev;
            });
        }, speed);

        return () => {
            clearInterval(interval);
            clearTimeout(timeoutId);
        };
    }, [variant, customData, speed, loop, loopDelay, isAtStart, expandFromCenter, activeLength]);

    const centerIndex = Math.floor(activeData.length / 2);

    return (
        <div
            className={cn("grid gap-1 mx-auto w-fit", className)}
            style={{ gridTemplateColumns: `repeat(${activeCols}, ${size}px)` }}
        >
            {activeData.map((code, index) => {
                let style = {};

                if (expandFromCenter) {
                    const dist = Math.abs(index - centerIndex);
                    const delay = dist * (speed * 1.5);

                    style = {
                        width: size,
                        height: size,
                        opacity: isMounted ? 1 : 0,
                        transform: isMounted ? 'scale(1)' : 'scale(0)',
                        transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
                    };
                } else {
                    style = {
                        width: size,
                        height: size,
                        opacity: index < visibleCount ? 1 : 0.05,
                        transform: index < visibleCount ? 'scale(1)' : 'scale(0.8)',
                        transition: 'all 0.3s ease-out'
                    };
                }

                return (
                    <div
                        key={index}
                        style={style}
                        className={cn("rounded-[1px]", COLOR_MAP[code] || COLOR_MAP[0])}
                    />
                );
            })}
        </div>
    );
};

export default AkhaPixelPattern;
