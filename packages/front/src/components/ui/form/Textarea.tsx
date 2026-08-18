import React, { TextareaHTMLAttributes, forwardRef, useState } from 'react';
import Typography from '../Typography';
import { cn } from '@thaiakha/shared/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  success?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  showCount?: boolean;
  charCount?: boolean;
  rows?: number;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      maxLength,
      showCount = false,
      charCount = false,
      rows = 4,
      className,
      containerClassName,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCountValue, setCharCountValue] = useState(
      typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength && e.target.value.length > maxLength) {
        return;
      }
      setCharCountValue(e.target.value.length);
      onChange?.(e);
    };

    const hasContent = value !== undefined
      ? String(value).length > 0
      : defaultValue !== undefined
        ? String(defaultValue).length > 0
        : false;

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

    // BORDER
    const borderColor = cn(
      'border transition-colors duration-300',
      !error && !success && 'border-[var(--field-border)] hover:border-[var(--field-border-hover)] focus:border-action/50',
      success && 'border-action/30 hover:border-action/60 focus:border-action',
      error && 'border-red-500/30 hover:border-red-500/60 focus:border-red-500',
    );

    // FOCUS RING
    const focusRing = cn(
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      error ? 'focus:ring-red-500/50' : 'focus:ring-action/50',
    );

    // TEXT
    const textStyle = 'text-title placeholder:text-muted';

    const baseClasses = cn(
      '[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-xs)] rounded-xl transition-all duration-300 ease-cinematic',
      resize === 'none' && 'resize-none',
      resize === 'vertical' && 'resize-y',
      resize === 'horizontal' && 'resize-x',
      resize === 'both' && 'resize',
      fullWidth && 'w-full',
      disabled && 'opacity-50 cursor-not-allowed grayscale'
    );


    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', containerClassName)}>
        {/* Label */ }
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

        <div className="relative">
          <textarea
            ref={ref}
            rows={rows}
            className={cn(baseClasses, bgStyle, borderColor, focusRing, textStyle, className)}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {(showCount || charCount) && maxLength && (
            <div className="absolute bottom-2 right-2 flex items-center space-x-1 shadow-glow-glass px-2 py-1 rounded bg-[var(--field-fill)]">
              {charCount && (
                <Typography
                  variant="caption"
                  className={cn(charCountValue > maxLength * 0.9 ? 'text-amber-600' : 'text-muted')}
                >
                  {charCountValue}
                </Typography>
              )}
              {showCount && (
                <>
                  <Typography variant="caption" className="text-muted">
                    /
                  </Typography>
                  <Typography variant="caption" className="text-muted">
                    {maxLength}
                  </Typography>
                </>
              )}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn(
            'text-xs ml-1 font-normal italic transition-colors duration-300',
            error ? 'text-red-500' :
              success ? 'text-action' :
                'text-muted'
          )}>
            {typeof error === 'string' ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
