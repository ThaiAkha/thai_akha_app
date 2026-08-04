import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Composable primitives for the admin master-detail "Inspector" panel.
 * The 12 feature inspectors are conceptually parallel but structurally divergent;
 * these primitives normalize them to the DS baseline (docs/ADMIN_DS_BASELINE_2027.md)
 * without forcing a single rigid shell. Adopt incrementally, behavior-invariant.
 */

export const InspectorShell: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('flex-1 flex flex-col overflow-hidden', className)}>{children}</div>
);

interface InspectorHeaderProps {
  /** Big value line (e.g. selected record name). */
  title: string;
  /** Small overline label above the title. */
  subtitle?: string;
  onClose?: () => void;
  /** Extra controls rendered before the close button. */
  actions?: React.ReactNode;
  /** Optional leading element (e.g. an avatar) rendered before the text. */
  leading?: React.ReactNode;
  /** 'lg' increases header height + text size for a more readable, prominent header. */
  size?: 'sm' | 'lg';
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({ title, subtitle, onClose, actions, leading, size = 'sm' }) => {
  const lg = size === 'lg';
  return (
    <div className={cn('px-4 shrink-0 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50', lg ? 'h-20' : 'h-16')}>
      <div className="flex items-center gap-3 min-w-0">
        {leading}
        <div className="flex flex-col min-w-0">
          {subtitle && <span className={cn('font-bold uppercase tracking-widest text-gray-500', lg ? 'text-sm' : 'text-xs')}>{subtitle}</span>}
          <span className={cn('font-bold text-gray-900 dark:text-white truncate', lg ? 'text-xl' : 'text-sm')}>{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/** Scrollable body. Pass padding via className (e.g. "p-4 space-y-3") — inspectors vary. */
export const InspectorBody: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('flex-1 overflow-y-auto no-scrollbar', className)}>{children}</div>
);

interface InspectorEmptyProps {
  icon: React.ReactNode;
  hint: string;
}

export const InspectorEmpty: React.FC<InspectorEmptyProps> = ({ icon, hint }) => (
  <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 opacity-60 space-y-2">
    {icon}
    <span className="text-xs font-medium">{hint}</span>
  </div>
);

export const InspectorFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-4', className)}>
    {children}
  </div>
);
