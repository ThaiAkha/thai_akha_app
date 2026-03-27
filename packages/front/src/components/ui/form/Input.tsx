import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
    value,
    defaultValue,
    ...props
  }, ref) => {

    // Determina se l'input ha contenuto
    const hasContent = value !== undefined
      ? String(value).length > 0
      : defaultValue !== undefined
        ? String(defaultValue).length > 0
        : false;

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-5 py-4 text-lg rounded-2xl',
    };

    // BACKGROUND: basato su stato e contenuto
    const bgStyle = cn(
      // Default mineral (nessun errore/successo)
      !error && !success && cn(
        'transition-colors duration-300',
        !hasContent && 'bg-black/5 dark:bg-white/5',
        hasContent && 'bg-black/10 dark:bg-white/10',
        'hover:bg-black/10 dark:hover:bg-white/10',
        'focus:bg-black/10 dark:focus:bg-white/10',
      ),

      // SUCCESS: verde action trasparente
      success && cn(
        'bg-action/5 dark:bg-action/10',
        'hover:bg-action/10 dark:hover:bg-action/15',
        'focus:bg-action/15 dark:focus:bg-action/20',
      ),

      // ERROR: rosso trasparente
      error && cn(
        'bg-red-500/5 dark:bg-red-500/10',
        'hover:bg-red-500/10 dark:hover:bg-red-500/15',
        'focus:bg-red-500/15 dark:focus:bg-red-500/20',
      ),
    );

    // BORDO: colorato in base allo stato
    const borderColor = cn(
      'border transition-colors duration-300',

      // Default (nessun errore/successo)
      !error && !success && cn(
        'border-black/10 dark:border-white/10',
        'hover:border-black/30 dark:hover:border-white/30',
        'focus:border-action/50',
      ),

      // SUCCESS: bordo action
      success && cn(
        'border-action/30 dark:border-action/40',
        'hover:border-action/60 dark:hover:border-action/70',
        'focus:border-action',
      ),

      // ERROR: bordo rosso
      error && cn(
        'border-red-500/30 dark:border-red-500/40',
        'hover:border-red-500/60 dark:hover:border-red-500/70',
        'focus:border-red-500',
      ),
    );

    // FOCUS RING: coerente con lo stato
    const focusRing = cn(
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      !error && !success && 'focus:ring-action/50',
      success && 'focus:ring-action/50',
      error && 'focus:ring-red-500/50',
    );

    // Testi - sempre leggibili (identici alla typography)
    const textStyle = cn(
      'text-gray-900 dark:text-gray-100',
      'placeholder:text-gray-700/40 dark:placeholder:text-gray-300/40',
    );

    // Disabled
    const disabledStyle = disabled && 'opacity-50 cursor-not-allowed grayscale';

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', className)}>

        {/* Label */}
        {label && (
          <label className={cn(
            'ml-1 font-sans text-xs font-semibold uppercase tracking-wider transition-colors duration-300',
            error ? 'text-red-600 dark:text-red-400' :
              success ? 'text-action dark:text-action' :
                'text-gray-700/80 dark:text-gray-300/80'
          )}>
            {label}
          </label>
        )}

        <div className="relative group">
          {/* Icona sinistra */}
          {leftIcon && (
            <div className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 flex items-center leading-none',
              error ? 'text-red-500/70 group-focus-within:text-red-500' :
                success ? 'text-action/70 group-focus-within:text-action' :
                  'text-gray-700/50 dark:text-gray-300/50 group-focus-within:text-action'
            )}>
              <span className="material-symbols-outlined text-[1.2em]">
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              'w-full transition-all duration-300 ease-cinematic',
              bgStyle,
              borderColor,
              focusRing,
              textStyle,
              disabledStyle,
              sizeStyles[size],
              leftIcon && 'pl-11',
              rightIcon && 'pr-11'
            )}
            {...props}
          />

          {/* Icona destra */}
          {rightIcon && (
            <div className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 flex items-center leading-none',
              error ? 'text-red-500/70' :
                success ? 'text-action/70' :
                  'text-gray-700/50 dark:text-gray-300/50'
            )}>
              <span className="material-symbols-outlined text-[1.2em]">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <p className={cn(
            'text-xs ml-1 font-normal italic transition-colors duration-300',
            error ? 'text-red-500' :
              success ? 'text-action' :
                'text-gray-500 dark:text-gray-500'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
