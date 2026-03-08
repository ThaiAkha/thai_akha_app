import React from 'react';
import { cn } from '../../lib/utils';

interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({
  htmlFor,
  required,
  children,
  className,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400',
        className
      )}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

export default Label;
