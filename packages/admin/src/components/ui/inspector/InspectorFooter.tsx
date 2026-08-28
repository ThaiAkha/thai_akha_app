import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export interface InspectorFooterProps {
  className?: string;
  children: React.ReactNode;
  /** sticky bottom-0: per i footer che vivono DENTRO un'area scrollabile (es. Calendar in edit). */
  sticky?: boolean;
  /**
   * padding-bottom inline (px se numero). Codifica il pb-[80px] dei report manager,
   * dove il footer deve scavalcare la bottom bar; senza, il p-4 di base resta intatto.
   */
  bottomOffset?: number | string;
}

export const InspectorFooter: React.FC<InspectorFooterProps> = ({ className, children, sticky, bottomOffset }) => (
  <div
    className={cn('p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-4', sticky && 'sticky bottom-0', className)}
    style={bottomOffset !== undefined ? { paddingBottom: bottomOffset } : undefined}
  >
    {children}
  </div>
);
