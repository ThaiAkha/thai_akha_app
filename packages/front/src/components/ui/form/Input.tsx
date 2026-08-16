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

    // Size styles — fluid padding (Regola #6) + 48px+ touch target on md/lg
    const sizeStyles = {
      sm: '[padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] min-h-[2.5rem] text-sm rounded-[calc(var(--radius-input)*0.75)]',
      md: '[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)] min-h-[3rem] text-base rounded-[var(--radius-input)]',
      lg: '[padding-inline:var(--space-fluid-l)] [padding-block:var(--space-fluid-s)] min-h-[3.25rem] text-lg rounded-[calc(var(--radius-input)*1.5)]',
    };

    // BACKGROUND: mineral fill via field tokens (adapts in dark via html.dark — no `dark:`)
    const bgStyle = cn(
      !error && !success && cn(
        'transition-colors duration-300',
        hasContent ? 'bg-[var(--field-fill-strong)]' : 'bg-[var(--field-fill)]',
        'hover:bg-[var(--field-fill-strong)] focus:bg-[var(--field-fill-strong)]',
      ),
      success && 'bg-action/5 hover:bg-action/10 focus:bg-action/15',
      error && 'bg-red-500/5 hover:bg-red-500/10 focus:bg-red-500/15',
    );

    // BORDER: state-driven, default uses field-border tokens
    const borderColor = cn(
      'border transition-colors duration-300',
      !error && !success && 'border-[var(--field-border)] hover:border-[var(--field-border-hover)] focus:border-action/50',
      success && 'border-action/30 hover:border-action/60 focus:border-action',
      error && 'border-red-500/30 hover:border-red-500/60 focus:border-red-500',
    );

    // FOCUS RING: coerente con lo stato
    const focusRing = cn(
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      error ? 'focus:ring-red-500/50' : 'focus:ring-action/50',
    );

    // Testo input + placeholder — token semantici
    const textStyle = 'text-title placeholder:text-muted';

    // Disabled
    const disabledStyle = disabled && 'opacity-50 cursor-not-allowed grayscale';

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', className)}>

        {/* Label */}
        {label && (
          <label className={cn(
            'ml-1 font-sans text-xs font-semibold uppercase tracking-wider transition-colors duration-300',
            error ? 'text-red-600' :
              success ? 'text-action' :
                'text-sub'
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
                  'text-muted group-focus-within:text-action'
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
                  'text-muted'
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
                'text-muted'
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
