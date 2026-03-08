import React from 'react';
import { cn } from '../../lib/utils';
import AkhaPixelPattern from './AkhaPixelPattern';

interface LoadingSpinnerProps {
  variant?: 'center' | 'fullscreen';
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'center',
  size = 16,
  className
}) => {
  const containerClasses = variant === 'fullscreen' 
    ? 'flex justify-center items-center h-screen'
    : 'flex justify-center items-center py-16';

  return (
    <div className={cn(containerClasses, className)}>
      <AkhaPixelPattern
        variant="diamond"
        size={size}
        speed={50}
        expandFromCenter
        className="opacity-80"
      />
    </div>
  );
};

export default LoadingSpinner;
