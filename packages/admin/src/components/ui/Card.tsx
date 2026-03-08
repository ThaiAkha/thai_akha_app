import React from 'react';
import { cn } from '../../lib/utils';

export type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  size?: CardSize;
  className?: string;
  title?: string;
  subtitle?: string;
  interactive?: boolean;
  children: React.ReactNode;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Standardized Card component for consistent styling across the app
 * Supports:
 * - Simple: <Card><Card.Content>...</Card.Content></Card>
 * - With header: <Card title="Title"><Card.Content>...</Card.Content></Card>
 * - Full control: <Card><Card.Header .../><Card.Content .../></Card>
 */

// Header subcomponent
const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={cn(
    'border-b border-gray-100 dark:border-gray-800 pb-3 mb-4',
    className
  )}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);

// Content subcomponent
const CardContent: React.FC<CardContentProps> = ({ className, children }) => (
  <div className={cn('space-y-4', className)}>
    {children}
  </div>
);

// Footer subcomponent
const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => (
  <div className={cn(
    'border-t border-gray-100 dark:border-gray-800 pt-4 flex gap-2 justify-end',
    className
  )}>
    {children}
  </div>
);

// Main Card component
const Card: React.FC<CardProps> = ({
  size = 'md',
  className,
  title,
  subtitle,
  interactive = false,
  children
}) => {
  const sizes = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  };

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-300',
      'bg-white dark:bg-gray-900',
      'border-gray-100 dark:border-gray-800',
      interactive ? 'shadow-sm hover:shadow-md hover:translate-y-0.5 cursor-pointer' : 'shadow-sm',
      sizes[size],
      className
    )}>
      {(title || subtitle) && (
        <CardHeader title={title || ''} subtitle={subtitle} />
      )}
      {children}
    </div>
  );
};

// Type with subcomponents
interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
}

// Attach subcomponents
(Card as CardComponent).Header = CardHeader;
(Card as CardComponent).Content = CardContent;
(Card as CardComponent).Footer = CardFooter;

export default Card as CardComponent;
export { CardHeader, CardContent, CardFooter };
