
import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outline' | 'interactive' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
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
  hoverable,
  shadow,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
    xl: 'p-16',
  };

  const roundedStyles = {
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
    '3xl': 'rounded-[3rem]',
    '4xl': 'rounded-[4rem]',
  };

  const variantStyles = {
    default: 'bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 shadow-2xl',
    
    // Glassmorphism ultra-pulito con bordo luminoso
    glass: 'bg-white/80 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]',
    
    outline: 'bg-transparent border-2 border-black/10 dark:border-white/10',
    
    // Interactive aggiunge un sollevamento fluido e un bordo che si illumina
    interactive: 'bg-white/90 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 hover:border-primary/50 hover:shadow-[0_40px_80px_-20px_rgba(227,31,51,0.2)] transition-all duration-700 cursor-pointer hover:-translate-y-2',
    
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
  <div className={cn('mb-8', className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn('text-3xl font-display font-black italic uppercase tracking-tighter text-title-light dark:text-title-dark mb-3 drop-shadow-sm', className)}>{children}</h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-base opacity-60 font-medium text-slate-600 dark:text-slate-400 leading-relaxed', className)}>{children}</p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('text-desc-light dark:text-desc-dark', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('mt-10 pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between', className)}>{children}</div>
);

export default Card;
