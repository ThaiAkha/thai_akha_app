import React from 'react';
import { cn } from '../../lib/utils'; // [Source 339]

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'outline' | 'ghost' | 'filled' | 'mineral';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'mineral', // Default cambiato a Mineral per System 4.8
    size = 'md',
    error = false,
    success = false,
    disabled = false,
    fullWidth = true,
    leftIcon,
    rightIcon,
    label,
    helperText,
    type = 'text',
    ...props
  }, ref) => {

    // 1. Stili Varianti Aggiornati (System 4.8)
    const variantStyles = {
      default: 'bg-surface border-border text-title',
      outline: 'bg-transparent border-border text-title',
      ghost: 'bg-transparent border-0 text-title',
      filled: 'bg-slate-100 dark:bg-white/10 border-0 text-title',
      
      // ✨ NEW MINERAL STYLE (Vetro + Bordo Sottile)
      mineral: 'bg-white/5 border border-white/10 text-title placeholder:text-desc/40 focus:bg-white/10 focus:border-action/50'
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl', // Arrotondamento più morbido
      lg: 'px-5 py-4 text-lg rounded-2xl',
    };

    // 2. Stati di Feedback (Action Green / Error Red)
    const stateStyles = cn(
      error 
        ? 'border-red-500 focus:ring-red-500/30' 
        : success 
          ? 'border-action focus:ring-action/30' 
          : 'focus:ring-action/50', // Focus standard è Verde Action ora
      disabled && 'opacity-50 cursor-not-allowed grayscale'
    );

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        
        {label && (
          <label className="ml-1 font-accent text-[10px] font-black uppercase tracking-widest text-desc/70">
            {label}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-action text-desc/50">
              <span className="material-symbols-outlined text-[1.2em]">
                {leftIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full transition-all duration-300 ease-cinematic',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              variantStyles[variant],
              sizeStyles[size],
              stateStyles,
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-desc/50">
              <span className="material-symbols-outlined text-[1.2em]">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {helperText && (
          <p className={cn(
            'text-xs ml-1 font-medium',
            error ? 'text-red-500' : success ? 'text-action' : 'text-desc/60'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;