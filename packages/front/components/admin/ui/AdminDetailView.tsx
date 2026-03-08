import React from 'react';
import { cn } from '../../../lib/utils';
import { AdminHeader } from './index';

interface AdminDetailViewProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AdminDetailView: React.FC<AdminDetailViewProps> = ({
  children,
  title,
  subtitle,
  onClose,
  actions,
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full bg-surface relative", className)}>
      {/* HEADER - Unified with AdminHeader style */}
      <AdminHeader 
        title={title} 
        className="h-20 shrink-0" 
        actions={
          onClose && (
            <button 
              onClick={onClose}
              className="size-10 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-desc/40 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )
        }
      />

      {/* CONTENT (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </div>
      </div>

      {/* FOOTER ACTIONS (Sticky) */}
      {actions && (
        <div className="p-6 border-t border-border bg-surface shrink-0 z-10">
          <div className="flex flex-col gap-3">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDetailView;