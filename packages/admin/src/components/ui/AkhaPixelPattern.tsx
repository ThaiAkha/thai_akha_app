import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { AKHA_PATTERNS, PatternName } from '../../data/pixelPatterns';

const COLOR_MAP: Record<number, string> = {
    0: 'bg-transparent',
    1: 'bg-[#E31F33] shadow-[0_0_2px_#E31F33]', // Rosso
    2: 'bg-[#C0C0C0] shadow-[0_0_2px_white]',    // Argento
    3: 'bg-[#98C93C] shadow-[0_0_2px_#98C93C]',  // Verde
    4: 'bg-[#1A1A1A] shadow-[0_0_2px_#000]',      // Nero
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

    useEffect(() => {
        if (expandFromCenter) {
            const t = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(t);
        }

        let timeoutId: ReturnType<typeof setTimeout>;
        const interval = setInterval(() => {
            setVisibleCount((prev) => {
                if (prev < activeData.length) return prev + 1;
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
    }, [variant, customData, speed, loop, loopDelay, visibleCount === 0, expandFromCenter]);

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
