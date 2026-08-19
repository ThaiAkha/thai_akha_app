import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { AKHA_PATTERNS, PatternName } from '@thaiakha/shared/data';
import { motion, type Variants } from 'framer-motion';
import { AKHA_THEMES, type AkhaTheme, type AnimationType } from './AkhaPixelPattern.constants';

// Themes & types live in AkhaPixelPattern.constants.ts (react-refresh: components-only file).
export type { AkhaTheme, AnimationType } from './AkhaPixelPattern.constants';

/**
 * Standard divider Akha (2026-08-19): SOLO tre taglie di pixel.
 * 10 = separatori di sezione + geometrie (fiore/wok/mountain) · 8 = linee sotto
 * header/intestazioni · 6 = dentro le card (titoli, footer, FAQ, essentials).
 * Tutte scalano con `--akha-pixel-scale` (tokens.css: 0.5 a 375px → 1 a 1280px).
 */
export type AkhaPixelSize = 10 | 8 | 6;
/** Valore numerico della scala fluida letto dal CSS (registrata con @property → e' un numero). */
const readPixelScale = (el: Element): number => {
  const v = parseFloat(getComputedStyle(el).getPropertyValue('--akha-pixel-scale'));
  return Number.isFinite(v) && v > 0 ? v : 1;
};

interface AkhaPixelPatternProps {
  variant?: PatternName;
  data?: number[];
  columns?: number;
  /** Taglia del pixel: 10 | 8 | 6 (vedi standard in testa al file). */
  size?: AkhaPixelSize;
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
  /**
   * Riempie il contenitore RIPETENDO il pattern a pixel fissi (tile) e tagliandolo
   * alla larghezza disponibile (mai stirato: stessa trama in una card da 170px e da 660px).
   */
  fill?: boolean;
  opacity?: number;
  /** Add scale-up effect on hover for individual pixels */
  interactive?: boolean;
}

const AkhaPixelPattern: React.FC<AkhaPixelPatternProps> = ({
  variant,
  data: customData,
  columns: customCols,
  size = 10,
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
  const baseCols = patternConfig?.columns || customCols || 7;
  const gapPx = Math.max(1, Math.floor(size / 2));
  // Dimensioni in CSS: pixel e gap moltiplicati per la scala fluida.
  const px = `calc(${size}px * var(--akha-pixel-scale, 1))`;
  const gap = `calc(${gapPx}px * var(--akha-pixel-scale, 1))`;

  // fill = tile: quante copie del pattern servono per coprire il contenitore.
  const fillRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(1);
  useEffect(() => {
    if (!fill || !fillRef.current) return;
    const el = fillRef.current;
    const measure = () => {
      const scale = readPixelScale(el);
      const patternWidth = (baseCols * size + (baseCols - 1) * gapPx) * scale;
      const next = Math.max(1, Math.ceil(el.clientWidth / Math.max(1, patternWidth)));
      setCopies(prev => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill, baseCols, size, gapPx]);

  const baseData = activeData;
  const tiledData = fill && copies > 1 ? Array.from({ length: copies }, () => baseData).flat() : baseData;
  const activeCols = fill ? baseCols * copies : baseCols;

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

  const centerIndex = Math.floor(tiledData.length / 2);

  const grid = (
    <motion.div
      initial={animateInView ? "hidden" : undefined}
      whileInView={animateInView ? "visible" : undefined}
      viewport={{ once: true, margin: "-20px" }}
      className={cn("grid w-fit", className)}
      style={{
        gridTemplateColumns: `repeat(${activeCols}, ${px})`,
        gap,
        opacity
      }}
    >
      {tiledData.map((code, index) => {
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
              style={{ width: px, height: px }}
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
            width: px,
            height: px,
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? 'scale(1)' : 'scale(0)',
            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
          };
        } else {
          style = {
            width: px,
            height: px,
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

  // fill: il wrapper misura la larghezza e TAGLIA il pattern ripetuto (overflow-hidden).
  if (fill) {
    return (
      <div ref={fillRef} className="w-full overflow-hidden">
        {grid}
      </div>
    );
  }
  return grid;
};

export default AkhaPixelPattern;