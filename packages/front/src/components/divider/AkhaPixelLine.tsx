import React from 'react';
import AkhaPixelPattern, { AkhaTheme, AnimationType } from './AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';
import { PatternName } from '@thaiakha/shared/data';

interface AkhaPixelLineProps {
  /** Size of each pixel in px */
  size?: number;
  /** Opacity of the divider (0 to 1) */
  opacity?: number;
  /** Length of the divider line */
  length?: 'short' | 'medium' | 'long' | 'xl';
  /** Central geometry (if omitted, acts as a simple line) */
  geometry?: 'flower' | 'wok' | 'mountain' | 'none';
  /** Color kit to use */
  theme?: AkhaTheme;
  /** Animation style */
  animationType?: AnimationType;
  /** Add scale-up effect on hover for individual pixels */
  interactive?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to animate when coming into view */
  animate?: boolean;
}

/**
 * A highly modular pixel divider using traditional Akha patterns.
 * Supports lengths (short/medium/long), color themes, and central geometries (flower/wok/mountain).
 */
const AkhaPixelLine: React.FC<AkhaPixelLineProps> = ({
  size = 10,
  opacity = 0.8,
  length = 'long',
  geometry = 'none',
  theme = 'akha',
  animationType,
  interactive = false,
  className,
  animate = true,
}) => {
  // Mappiamo le lunghezze ai pattern di linea definiti in data
  const linePatternMap: Record<string, PatternName> = {
    short: 'line_simple',        // ~11 cols
    medium: 'line_simple_medium',// ~22 cols
    long: 'line_simple_medium',  // Uniformed to simple_medium as per latest design audit
    xl: 'line_divider',
  };
  const lineVariant = linePatternMap[length] || 'line_simple_medium';

  // Se c'è una geometria centrale, disegnamo la linea specchiata.
  // Se non c'è geometria (none), disegnamo solo una linea continua al centro.
  const hasGeometry = geometry !== 'none';

  return (
    <div
      className={cn(
        "flex items-center justify-center [gap:var(--space-fluid-m)] [padding-block:var(--space-fluid-l)] overflow-hidden w-full",
        className
      )}
      style={{ opacity }}
    >
      {hasGeometry ? (
        <>
          {/* Left Line */}
          <div className="flex-1 flex justify-end overflow-hidden">
            <AkhaPixelPattern
              variant={lineVariant}
              size={size}
              theme={theme}
              animationType={animationType ?? 'center-out'}
              animateInView={animate}
              interactive={interactive}
              className="scale-x-[-1]"
            />
          </div>

          {/* Central Geometry */}
          <AkhaPixelPattern
            variant={geometry as PatternName}
            size={size}
            theme={theme}
            animationType={animationType ?? 'matrix'}
            animateInView={animate}
            interactive={interactive}
          />

          {/* Right Line */}
          <div className="flex-1 overflow-hidden">
            <AkhaPixelPattern
              variant={lineVariant}
              size={size}
              theme={theme}
              animationType={animationType ?? 'center-out'}
              animateInView={animate}
              interactive={interactive}
            />
          </div>
        </>
      ) : (
        /* Simple Continuous Line */
        <AkhaPixelPattern
          variant={lineVariant}
          size={size}
          theme={theme}
          animationType={animationType ?? 'sides-in'}
          animateInView={animate}
          interactive={interactive}
        />
      )}
    </div>
  );
};

export default AkhaPixelLine;
