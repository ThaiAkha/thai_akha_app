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

    // BACKGROUND: based on state and content
    const bgStyle = cn(
      !error && !success && cn(
        'transition-colors duration-300',
        !hasContent && 'bg-black/5 dark:bg-white/5',
        hasContent && 'bg-black/10 dark:bg-white/10',
        'hover:bg-black/10 dark:hover:bg-white/10',
        'focus:bg-black/10 dark:focus:bg-white/10',
      ),
      success && cn(
        'bg-action/5 dark:bg-action/10',
        'hover:bg-action/10 dark:hover:bg-action/15',
        'focus:bg-action/15 dark:focus:bg-action/20',
      ),
      error && cn(
        'bg-red-500/5 dark:bg-red-500/10',
        'hover:bg-red-500/10 dark:hover:bg-red-500/15',
        'focus:bg-red-500/15 dark:focus:bg-red-500/20',
      ),
    );

    // BORDER
    const borderColor = cn(
      'border transition-colors duration-300',
      !error && !success && cn(
        'border-black/10 dark:border-white/10',
        'hover:border-black/30 dark:hover:border-white/30',
        'focus:border-action/50',
      ),
      success && cn(
        'border-action/30 dark:border-action/40',
        'hover:border-action/60 dark:hover:border-action/70',
        'focus:border-action',
      ),
      error && cn(
        'border-red-500/30 dark:border-red-500/40',
        'hover:border-red-500/60 dark:hover:border-red-500/70',
        'focus:border-red-500',
      ),
    );

    // FOCUS RING
    const focusRing = cn(
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      !error && !success && 'focus:ring-action/50',
      success && 'focus:ring-action/50',
      error && 'focus:ring-red-500/50',
    );

    // TEXT
    const textStyle = cn(
      'text-gray-900 dark:text-gray-100',
      'placeholder:text-gray-700/40 dark:placeholder:text-gray-300/40',
    );

    const baseClasses = cn(
      'px-4 py-3 rounded-xl transition-all duration-300 ease-cinematic',
      resize === 'none' && 'resize-none',
      resize === 'vertical' && 'resize-y',
      resize === 'horizontal' && 'resize-x',
      resize === 'both' && 'resize',
      fullWidth && 'w-full',
      disabled && 'opacity-50 cursor-not-allowed grayscale'
    );

    const textareaValue = value !== undefined ? value : defaultValue || '';

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', containerClassName)}>
        {/* Label */ }
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
            <div className="absolute bottom-2 right-2 flex items-center space-x-1 shadow-glow-glass px-2 py-1 rounded bg-black/5 dark:bg-white/5">
              {charCount && (
                <Typography
                  variant="caption"
                  className={cn(charCountValue > maxLength * 0.9 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500')}
                >
                  {charCountValue}
                </Typography>
              )}
              {showCount && (
                <>
                  <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
                    /
                  </Typography>
                  <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
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
                'text-gray-500 dark:text-gray-500'
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
