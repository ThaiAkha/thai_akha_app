import React, { useEffect, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { AKHA_PATTERNS, PatternName } from '@thaiakha/shared/data';
import { motion, type Variants } from 'framer-motion';
import { AKHA_THEMES, type AkhaTheme, type AnimationType } from './AkhaPixelPattern.constants';

// Themes & types live in AkhaPixelPattern.constants.ts (react-refresh: components-only file).
export type { AkhaTheme, AnimationType } from './AkhaPixelPattern.constants';

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
  animateInView?: boolean;
  theme?: AkhaTheme;
  animationType?: AnimationType;
  /** Custom override for specific cases */
  colorMap?: Record<number, string>;
  /** Fill parent width using 1fr columns — each pixel keeps 1:1 aspect ratio */
  fill?: boolean;
  opacity?: number;
  /** Add scale-up effect on hover for individual pixels */
  interactive?: boolean;
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
  expandFromCenter = false,
  animateInView = false,
  colorMap,
  theme = 'akha',
  animationType,
  fill = false,
  opacity,
  interactive = false,
}) => {
  const activeColorMap = colorMap ?? AKHA_THEMES[theme] ?? AKHA_THEMES.akha;
  const activeAnimationType = animationType ?? (expandFromCenter ? 'center-out' : 'linear');
  const patternConfig = variant ? AKHA_PATTERNS[variant] : null;
  const activeData = patternConfig?.data || customData || AKHA_PATTERNS.diamond.data;
  const activeCols = patternConfig?.columns || customCols || 7;

  // Stato per animazione sequenziale standard (deprecated if animateInView is used)
  const [visibleCount, setVisibleCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (animateInView) return; // Skip legacy timer logic if using framer-motion

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `visibleCount === 0` restarts the loop on purpose; activeData derives from variant/customData
  }, [variant, customData, speed, loop, loopDelay, visibleCount === 0, expandFromCenter, animateInView]);

  const centerIndex = Math.floor(activeData.length / 2);

  return (
    <motion.div
      initial={animateInView ? "hidden" : undefined}
      whileInView={animateInView ? "visible" : undefined}
      viewport={{ once: true, margin: "-20px" }}
      className={cn("grid", fill ? "w-full" : "w-fit", className)}
      style={{
        gridTemplateColumns: fill ? `repeat(${activeCols}, 1fr)` : `repeat(${activeCols}, ${size}px)`,
        gap: `${Math.max(1, Math.floor(size / 2))}px`,
        opacity
      }}
    >
      {activeData.map((code, index) => {
        const row = Math.floor(index / activeCols);
        const col = index % activeCols;
        const distFromCenter = Math.abs(index - centerIndex);
        
        let delayFactor = index;
        switch (activeAnimationType) {
          case 'center-out':
            delayFactor = distFromCenter;
            break;
          case 'sides-in':
            delayFactor = centerIndex - distFromCenter;
            break;
          case 'random':
            delayFactor = Math.random() * activeData.length;
            break;
          case 'matrix':
            // Esempio: dall'alto al basso
            delayFactor = row + col * 0.5;
            break;
          case 'linear':
          default:
            delayFactor = index;
            break;
        }

        // Framer Motion Variants
        const variants: Variants = {
          hidden: {
            scale: 0,
            opacity: 0
          },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              delay: delayFactor * (speed / 1000),
              duration: 0.4,
              ease: "backOut"
            }
          }
        };

        if (animateInView) {
          return (
            <motion.div
              key={index}
              variants={variants}
              style={fill ? { height: size } : { width: size, height: size }}
              className={cn(
                "rounded-[1px]", 
                activeColorMap[code] || activeColorMap[0],
                interactive && code !== 0 ? "hover:scale-[1.8] transition-transform duration-[1200ms] hover:duration-200 ease-out hover:ease-in-out z-10 hover:z-50 cursor-pointer" : ""
              )}
            />
          );
        }

        // Legacy Fallback (keeping it to not break other pages using the component)
        let style = {};
        if (expandFromCenter || activeAnimationType === 'center-out') {
          const delay = distFromCenter * (speed * 1.5);
          style = {
            width: size,
            height: size,
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'scale(1)' : 'scale(0)',
            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
          };
        } else {
          style = {
            ...(fill ? { height: size } : { width: size, height: size }),
            opacity: index < visibleCount ? 1 : 0.05,
            transform: index < visibleCount ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.3s ease-out'
          };
        }

        return (
          <div
            key={index}
            style={style}
            className={cn(
              "rounded-[1px]", 
              activeColorMap[code] || activeColorMap[0],
              interactive && code !== 0 ? "hover:scale-[1.8] transition-transform duration-[1200ms] hover:duration-200 ease-out hover:ease-in-out z-10 hover:z-50 cursor-pointer" : ""
            )}
          />
        );
      })}
    </motion.div>
  );
};

export default AkhaPixelPattern;