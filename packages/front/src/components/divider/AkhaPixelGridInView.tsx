import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { motion, type Variants } from 'framer-motion';
import type { AnimationType } from './AkhaPixelPattern.constants';

/**
 * Griglia Akha con entrata a scomparsa (`animateInView`): l'unico ramo che usa
 * framer-motion.
 *
 * Vive in un file suo perche' AkhaPixelPattern e' nel grafo statico della shell
 * (il loader di pagina lo monta), quindi il suo import teneva 126 KB di libreria
 * (41 compressi) nel chunk d'ingresso di OGNI pagina. Il ramo animato serve solo
 * ai divider dentro la pagina, che arrivano comunque dopo: qui si carica con
 * `lazy` e nel frattempo il padre mostra la stessa griglia allo stato "hidden",
 * cosi' la geometria e' identica e nulla salta (2026-09-05).
 *
 * Riceve i valori GIA' calcolati dal padre: la misura di `fill` e il
 * ResizeObserver restano uno solo, nel file base.
 */
export interface AkhaPixelGridInViewProps {
  tiledData: number[];
  activeCols: number;
  px: string;
  gap: string;
  opacity?: number;
  className?: string;
  speed: number;
  animationType: AnimationType;
  colorMap: Record<number, string>;
  interactive: boolean;
  /** Lunghezza del pattern base: la scala dei ritardi di 'random' era su questa, non sul tile. */
  baseLength: number;
}

const AkhaPixelGridInView: React.FC<AkhaPixelGridInViewProps> = ({
  tiledData, activeCols, px, gap, opacity, className,
  speed, animationType, colorMap, interactive, baseLength,
}) => {
  const centerIndex = Math.floor(tiledData.length / 2);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className={cn('grid w-fit', className)}
      style={{ gridTemplateColumns: `repeat(${activeCols}, ${px})`, gap, opacity }}
    >
      {tiledData.map((code, index) => {
        const row = Math.floor(index / activeCols);
        const col = index % activeCols;
        const distFromCenter = Math.abs(index - centerIndex);

        let delayFactor = index;
        switch (animationType) {
          case 'center-out':
            delayFactor = distFromCenter;
            break;
          case 'sides-in':
            delayFactor = centerIndex - distFromCenter;
            break;
          case 'random':
            delayFactor = Math.random() * baseLength;
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

        const variants: Variants = {
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { delay: delayFactor * (speed / 1000), duration: 0.4, ease: 'backOut' },
          },
        };

        return (
          <motion.div
            key={index}
            variants={variants}
            style={{ width: px, height: px }}
            className={cn(
              'rounded-[1px]',
              colorMap[code] || colorMap[0],
              interactive && code !== 0 ? 'hover:scale-[1.8] transition-transform duration-[1200ms] hover:duration-200 ease-out hover:ease-in-out z-10 hover:z-50 cursor-pointer' : ''
            )}
          />
        );
      })}
    </motion.div>
  );
};

export default AkhaPixelGridInView;
