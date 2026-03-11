import React from 'react';
import { Link } from 'react-router';
import { Heading, Paragraph } from '../typography';
import { ArrowRight } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

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
    dark: 'bg-gray-900 dark:bg-brand-600 text-white',
    brand: 'bg-brand-500 text-white',
    light: 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
  };

  const patternColors = {
    dark: 'text-gray-800',
    brand: 'text-brand-600',
    light: 'text-gray-100'
  };

  return (
    <Link
      to={ctaPath}
      className={cn(
        "rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between",
        "shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative",
        "transition-all hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1",
        "block no-underline",
        variantStyles[variant],
        className
      )}
    >
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
        <Heading level="h2" className="mb-2 !text-white">
          {title}
        </Heading>
        <Paragraph
          size="lg"
          className={cn(
            "!max-w-lg",
            variant === 'light'
              ? '!text-gray-600 dark:!text-gray-300'
              : '!text-white/70'
          )}
        >
          {description}
        </Paragraph>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            "px-6 py-3 text-md font-bold rounded-xl transition-all inline-flex items-center gap-2",
            "hover:scale-105 active:scale-95",
            variant === 'dark' || variant === 'brand'
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-brand-500 text-white hover:bg-brand-600'
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