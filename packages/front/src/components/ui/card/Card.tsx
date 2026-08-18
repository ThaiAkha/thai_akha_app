import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../index';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outline' | 'interactive' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'quiz';
  onClick?: () => void;
  hoverable?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  padding = 'md',
  rounded = '4xl', // Default più moderno e curvo
  onClick,
  shadow,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: '[padding:var(--space-fluid-s)]',
    md: '[padding:var(--space-fluid-m)]',
    lg: '[padding:var(--space-fluid-l)]',
    xl: '[padding:var(--space-fluid-xl)]',
  };

  const roundedStyles = {
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
    quiz: 'rounded-[2.5rem]',
    '3xl': 'rounded-[3rem]',
    '4xl': 'rounded-[4rem]',
  };

  const variantStyles = {
    default: 'bg-surface border-2 border-border shadow-2xl',

    // Glassmorphism ultra-pulito con bordo luminoso
    glass: 'bg-white/80 dark:bg-black/40 backdrop-blur-3xl border-2 border-white/20 dark:border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]',

    outline: 'bg-transparent border-2 border-black/10 dark:border-white/10',

    // Interactive aggiunge un sollevamento fluido e un bordo che si illumina
    interactive: 'bg-white/90 dark:bg-black/40 backdrop-blur-2xl border-2 border-white/20 dark:border-white/10 hover:border-primary/50 hover:shadow-[0_10px_10px_-10px_rgba(227,31,51,0.2)] transition-all duration-700 cursor-pointer hover:-translate-y-2',

    ghost: 'bg-transparent border-0',
  };

  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden isolate',
        variantStyles[variant],
        paddingStyles[padding],
        roundedStyles[rounded],
        shadow && shadowStyles[shadow],
        className
      )}
      onClick={onClick}
    >
      {/* Decorative inner light effect for glass variant */}
      {variant === 'glass' && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}

      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('[margin-bottom:var(--space-fluid-m)]', className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Typography variant="h3" className={cn('[margin-bottom:var(--space-fluid-2xs)] drop-shadow-sm', className)}>{children}</Typography>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Typography variant="paragraphS" className={cn('opacity-60', className)}>{children}</Typography>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Typography as="div" variant="body" className={className}>{children}</Typography>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('[margin-top:var(--space-fluid-l)] [padding-top:var(--space-fluid-m)] border-t border-border flex items-center justify-between', className)}>{children}</div>
);

export default Card;
