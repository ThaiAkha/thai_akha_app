import React from 'react';
import { motion, useReducedMotion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@thaiakha/shared/lib/utils';

interface ScrollEntranceProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  viewportMargin?: string;
  className?: string;
  /**
   * Distance in pixels to slide up from.
   * Defaults to 40.
   */
  yDistance?: number;
}

/**
 * Premium Scroll Entrance Wrapper (Classic Slide Fade Up)
 * Uses framer-motion's whileInView for performant scroll-triggered animations.
 */
export const ScrollEntrance: React.FC<ScrollEntranceProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  viewportMargin = "-50px",
  className,
  yDistance = 40,
  ...props
}) => {
  // prefers-reduced-motion: niente slide (y=0) e transizione istantanea; il contenuto
  // resta comunque visibile subito (opacity 1 → 1).
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : yDistance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{
        duration: reduceMotion ? 0 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.21, 1.11, 0.81, 0.99], // Custom cinematic ease
      }}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollEntrance;
