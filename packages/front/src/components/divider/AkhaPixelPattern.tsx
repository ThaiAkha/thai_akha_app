import React, { useEffect, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { AKHA_PATTERNS, PatternName } from '@thaiakha/shared/data';
import { motion } from 'framer-motion';

export type AkhaTheme = 'akha' | 'history' | 'kitchen' | 'news' | 'block_faq' | 'quiz' | 'cherry' | 'ingredients';
export type AnimationType = 'linear' | 'center-out' | 'sides-in' | 'random' | 'matrix';

export const AKHA_THEMES: Record<AkhaTheme, Record<number, string>> = {
  akha: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-primary)]',      // Rosso Brand
    2: 'bg-[var(--color-muted)]',        // Grigio/Bianco Neutrale
    3: 'bg-[var(--color-action)]',       // Verde Action
    4: 'bg-[var(--color-title)]',        // Dettaglio scuro
  },
  history: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-sunset-3)]',     // History Sunset — Red #d8392a
    2: 'bg-[var(--color-sunset-1)]',     // Gold #f2c24b
    3: 'bg-[var(--color-sunset-4)]',     // Magenta #b83a6e
    4: 'bg-[var(--color-sunset-6)]',     // Aubergine #4a2a5e
  },
  cherry: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-cherry-ai)]',       // Cherry AI — Cherry #E11B3C
    2: 'bg-[var(--color-cherry-ai-teal)]',  // Turquoise #45C3CD
    3: 'bg-[var(--color-cherry-ai-rose)]',  // Rose #EF4E71
    4: 'bg-[var(--color-cherry-ai-deep)]',  // Deep Teal #103F47
  },
  kitchen: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-recipe-5)]',     // Recipe Akha — Orange #dd6000
    2: 'bg-[var(--color-recipe-2)]',     // Green #99d973
    3: 'bg-[var(--color-recipe-3)]',     // Yellow #fae50d
    4: 'bg-[var(--color-recipe-6)]',     // Red #ca1f34
  },
  news: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-ice-4)]',        // News Ice — #2699a1
    2: 'bg-[var(--color-ice-2)]',        // #6ed6dd
    3: 'bg-[var(--color-ice-3)]',        // #39c6d0
    4: 'bg-[var(--color-ice-5)]',        // #19666b
  },
  block_faq: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-ocean-blue)]',   // Ocean Blue #0396c7
    2: 'bg-[var(--color-deep-blue)]',    // Deep Blue #016ca5
    3: 'bg-[var(--color-light-blue)]',   // Light Blue #90e0ef
    4: 'bg-white',                       // Bianco (accento/sparkle)
  },
  quiz: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-quiz-p)]',       // Quiz Set — Magenta #9b3357
    2: 'bg-[var(--color-quiz-3)]',       // Quiz Set — Gold #f7cb1b
    3: 'bg-[var(--color-quiz-1)]',       // Quiz Set — Green #7db23e
    4: 'bg-[var(--color-quiz-4)]',       // Quiz Set — Orange #e78b2e
  },
  ingredients: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-pantry-4)]',     // Ingredients Pantry — Paprika #c25a2e (primary)
    2: 'bg-[var(--color-pantry-3)]',     // Galangal #d98e3c
    3: 'bg-[var(--color-pantry-1)]',     // Lemongrass #8fa05a (fresh)
    4: 'bg-[var(--color-pantry-6)]',     // Cinnamon #3e2a1e (deep)
  }
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
        const variants: any = {
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