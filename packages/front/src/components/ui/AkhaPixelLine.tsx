import React from 'react';
import AkhaPixelPattern from './AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';
import { PatternName } from '@thaiakha/shared/data';

interface AkhaPixelLineProps {
  /** Size of each pixel in px */
  size?: number;
  /** Opacity of the divider (0 to 1) */
  opacity?: number;
  /** Optional custom pattern variant */
  variant?: PatternName;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to animate when coming into view */
  animate?: boolean;
}

/**
 * A premium mirrored pixel divider using traditional Akha patterns.
 * Features a progressive "drawing" animation from the center outwards.
 */
const AkhaPixelLine: React.FC<AkhaPixelLineProps> = ({
  size = 12,
  opacity = 0.3,
  variant = 'line',
  className,
  animate = true
}) => {
  return (
    <div 
      className={cn("flex justify-center items-center gap-4 py-16 overflow-hidden w-full", className)}
      style={{ opacity }}
    >
      <AkhaPixelPattern 
        variant={variant} 
        size={size} 
        expandFromCenter 
        animateInView={animate} 
      />
      <AkhaPixelPattern 
        variant={variant} 
        size={size} 
        expandFromCenter 
        animateInView={animate} 
        className="scale-x-[-1]" 
      />
    </div>
  );
};

export default AkhaPixelLine;
