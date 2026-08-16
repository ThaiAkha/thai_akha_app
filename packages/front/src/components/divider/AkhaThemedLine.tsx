import React from 'react';
import AkhaPixelLine from './AkhaPixelLine';
import { AkhaTheme } from './AkhaPixelPattern';

interface AkhaThemedLineProps {
  className?: string;
  size?: number;
  animate?: boolean;
  theme?: AkhaTheme;
  opacity?: number;
  geometry?: 'flower' | 'wok' | 'mountain' | 'none';
  length?: 'short' | 'medium' | 'long' | 'xl';
}

/**
 * AkhaThemedLine - A standardized wrapper for the themed divider system.
 * Refactored to remove hardcoded data and use the centralized AkhaPixelLine engine.
 */
const AkhaThemedLine: React.FC<AkhaThemedLineProps> = ({
  className,
  size = 10,
  animate = true,
  theme = 'history',
  opacity = 0.5,
  geometry = 'flower',
  length = 'long',
}) => {
  const finalTheme = theme || 'akha';

  return (
    <AkhaPixelLine
      geometry={geometry}
      length={length}
      size={size}
      theme={finalTheme}
      animate={animate}
      className={className}
      opacity={opacity}
    />
  );
};

export default AkhaThemedLine;
