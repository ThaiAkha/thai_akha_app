import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { AKHA_PATTERNS, PatternName } from '@thaiakha/shared/data';
import { AKHA_THEMES, type AkhaTheme, type AnimationType } from './AkhaPixelPattern.constants';

// Il ramo `animateInView` (e con lui framer-motion) sta in un chunk a parte: questo
// componente e' nel grafo statico della shell, tenerlo dentro significava 41 KB
// compressi di libreria di animazione nel chunk d'ingresso di ogni pagina.
const AkhaPixelGridInView = lazy(() => import('./AkhaPixelGridInView'));

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

/**
 * Orologio condiviso della fioritura in `loop` (AkhaLoader "bloom").
 * Ogni istanza montata legge la fase da qui invece di contare da zero: il loader
 * che subentra a un altro (fallback Suspense → gate profilo → PageLayout) mostra
 * lo stesso numero di pixel accesi, senza ripartire dal fiore vuoto.
 */
const LOOP_EPOCH_MS = typeof performance !== 'undefined' ? performance.now() : 0;
const loopPhase = (total: number, speed: number, loopDelay: number): number => {
  const step = Math.max(1, speed);
  const cycle = total * step + Math.max(0, loopDelay);
  const t = (performance.now() - LOOP_EPOCH_MS) % cycle;
  return Math.min(total, Math.floor(t / step));
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
  const total = activeData.length;
  const clockDriven = loop && !animateInView && !expandFromCenter;
  // In loop la fase iniziale viene dall'orologio condiviso: niente primo frame a fiore vuoto.
  const [visibleCount, setVisibleCount] = useState(() => (clockDriven ? loopPhase(total, speed, loopDelay) : 0));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (animateInView) return; // Skip legacy timer logic if using framer-motion

    if (expandFromCenter) {
      const t = setTimeout(() => setIsMounted(true), 100);
      return () => clearTimeout(t);
    }

    if (loop) {
      // Loop guidato dall'orologio, non da un contatore: ogni tick ricalcola la fase
      // dall'epoca condivisa, cosi' istanze montate in momenti diversi sono in sincrono
      // e la pausa a fine ciclo non richiede di riavviare l'intervallo (era il dep
      // `visibleCount === 0`, con il suo eslint-disable).
      const tick = () => setVisibleCount(loopPhase(total, speed, loopDelay));
      tick();
      const interval = setInterval(tick, Math.max(1, speed));
      return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < total) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [total, speed, loop, loopDelay, expandFromCenter, animateInView]);

  const centerIndex = Math.floor(tiledData.length / 2);

  /**
   * Griglia senza framer-motion: e' quella del loader, delle linee e dei tile.
   * `hidden` la rende allo stato iniziale dell'animazione (pixel a scala 0), che
   * e' esattamente cio' che serve come fallback mentre il chunk animato arriva:
   * stessa geometria, stesso ingombro, nessun salto di layout.
   */
  const staticGrid = (hidden = false) => (
    <div
      className={cn('grid w-fit', className)}
      style={{
        gridTemplateColumns: `repeat(${activeCols}, ${px})`,
        gap,
        opacity
      }}
    >
      {tiledData.map((code, index) => {
        const distFromCenter = Math.abs(index - centerIndex);

        let style: React.CSSProperties;
        if (hidden) {
          style = { width: px, height: px, opacity: 0, transform: 'scale(0)' };
        } else if (expandFromCenter || activeAnimationType === 'center-out') {
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
    </div>
  );

  const grid = animateInView ? (
    <Suspense fallback={staticGrid(true)}>
      <AkhaPixelGridInView
        tiledData={tiledData}
        activeCols={activeCols}
        px={px}
        gap={gap}
        opacity={opacity}
        className={className}
        speed={speed}
        animationType={activeAnimationType}
        colorMap={activeColorMap}
        interactive={interactive}
        baseLength={activeData.length}
      />
    </Suspense>
  ) : staticGrid();

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