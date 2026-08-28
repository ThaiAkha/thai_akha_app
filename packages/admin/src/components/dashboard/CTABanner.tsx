import React from 'react';
import { Link } from 'react-router';
import { Heading, Paragraph } from '../typography';
import { ArrowRight } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useFlash } from '../../hooks/useFlash';
import { FlashLayer } from '../ui/FlashLayer';

export interface CTABannerProps {
  /** Banner title */
  title: string;

  /** Banner description */
  description: string;

  /** CTA button label */
  ctaLabel: string;

  /** CTA button path */
  ctaPath: string;

  /** Visual variant */
  variant?: 'dark' | 'brand' | 'light';

  /** Custom className */
  className?: string;

  /** Show decorative pattern */
  showPattern?: boolean;
}

const CTABanner: React.FC<CTABannerProps> = ({
  title,
  description,
  ctaLabel,
  ctaPath,
  variant = 'dark',
  className,
  showPattern = true
}) => {

  const variantStyles = {
    dark: 'bg-gray-900 dark:bg-primary-600 text-white',
    brand: 'bg-primary-500 text-white',
    light: 'bg-gray-50 dark:bg-gray-800 text-title'
  };

  const patternColors = {
    dark: 'text-gray-800',
    brand: 'text-primary-600',
    light: 'text-gray-100'
  };

  const { flashes, onMouseMove, onClick } = useFlash();

  return (
    <Link
      to={ctaPath}
      onMouseMove={onMouseMove}
      onClick={onClick}
      className={cn(
        "rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between",
        "shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative isolate",
        "transition-all hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
        "block no-underline",
        variantStyles[variant],
        className
      )}
    >
      <FlashLayer flashes={flashes} />
      {/* Decorative Pattern */}
      {showPattern && (
        <div className={cn("absolute inset-0 opacity-20 pointer-events-none", patternColors[variant])}>
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {/* Pattern removed */}
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 max-w-2xl">
        <Heading level="h2" color={variant === 'light' ? 'default' : 'onDark'} className="mb-2">
          {title}
        </Heading>
        <Paragraph
          size="lg"
          color={variant === 'light' ? 'secondary' : 'onDark'}
          className="max-w-lg"
        >
          {description}
        </Paragraph>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            "px-6 py-3 text-base font-bold rounded-xl transition-all inline-flex items-center gap-2",
            "hover:scale-105 active:scale-95",
            variant === 'dark' || variant === 'brand'
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          )}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default CTABanner;