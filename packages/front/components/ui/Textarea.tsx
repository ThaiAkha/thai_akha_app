// components/ui/Textarea.tsx
import React, { TextareaHTMLAttributes, forwardRef, useState } from 'react';
// Fix: Typography is a default export in Typography.tsx kha
import Typography from './Typography';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  showCount?: boolean;
  charCount?: boolean;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'default',
      resize = 'vertical',
      maxLength,
      showCount = false,
      charCount = false,
      rows = 4,
      className = '',
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCountValue, setCharCountValue] = useState(
      typeof value === 'string' ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength && e.target.value.length > maxLength) {
        return;
      }
      setCharCountValue(e.target.value.length);
      onChange?.(e);
    };

    const baseClasses = `
      px-4 py-3
      rounded-lg
      border
      transition-all
      duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-offset-1
      placeholder:text-gray-400
      dark:placeholder:text-gray-500
      ${resize === 'none' ? 'resize-none' : ''}
      ${resize === 'vertical' ? 'resize-y' : ''}
      ${resize === 'horizontal' ? 'resize-x' : ''}
      ${resize === 'both' ? 'resize' : ''}
      ${fullWidth ? 'w-full' : ''}
    `;

    const variantClasses = {
      default: `
        border-gray-300
        dark:border-gray-600
        bg-white
        dark:bg-gray-800
        text-gray-900
        dark:text-gray-100
        focus:border-blue-500
        focus:ring-blue-500/20
        dark:focus:border-blue-400
        dark:focus:ring-blue-400/20
      `,
      filled: `
        border-transparent
        bg-gray-100
        dark:bg-gray-700
        text-gray-900
        dark:text-gray-100
        focus:bg-white
        dark:focus:bg-gray-800
        focus:border-blue-500
        focus:ring-blue-500/20
        dark:focus:border-blue-400
        dark:focus:ring-blue-400/20
      `,
      outlined: `
        border-gray-300
        dark:border-gray-600
        bg-transparent
        text-gray-900
        dark:text-gray-100
        focus:border-blue-500
        focus:ring-blue-500/20
        dark:focus:border-blue-400
        dark:focus:ring-blue-400/20
      `,
    };

    const stateClasses = `
      ${disabled
        ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
        : 'cursor-text'
      }
      ${error
        ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:focus:border-red-400 dark:focus:ring-red-400/20'
        : ''
      }
    `;

    const textareaValue = value || '';

    return (
      <div className={`flex flex-col ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="mb-2">
            {/* Fix: Replaced invalid variant 'body2' with 'paragraphS' and removed non-existent 'weight' prop kha */}
            <Typography variant="paragraphS" className="text-gray-700 dark:text-gray-300">
              {label}
            </Typography>
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            rows={rows}
            className={`
              ${baseClasses}
              ${variantClasses[variant]}
              ${stateClasses}
              ${className}
            `}
            disabled={disabled}
            value={textareaValue}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {(showCount || charCount) && maxLength && (
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              {charCount && (
                <Typography
                  variant="caption"
                  className={`${charCountValue > maxLength * 0.9 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}
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
          <div className="mt-1">
            <Typography
              variant="caption"
              className={error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}
            >
              {error || helperText}
            </Typography>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;