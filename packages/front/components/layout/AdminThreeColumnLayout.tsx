import React from 'react';
import { cn } from '../../lib/utils';
import { Typography } from '../ui/index';
import AdminPageLayout from './AdminPageLayout';

interface AdminThreeColumnLayoutProps {
  // Main Slot Contents
  leftContent: React.ReactNode;   // Sidebar / Filters / Staging
  centerContent: React.ReactNode; // Main Workspace / Grid / Map
  rightContent: React.ReactNode;  // Inspector / Details / Form
  
  // Header Actions (Optional)
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  
  // Configuration
  loading?: boolean;
  className?: string;
}

/**
 * AdminThreeColumnLayout (System 4.8)
 * Standardized console with three distinct panes.
 * Optimized for high-density operations like Logistics, Inventory, and Market Planning.
 */
export const AdminThreeColumnLayout: React.FC<AdminThreeColumnLayoutProps> = ({
  leftContent,
  centerContent,
  rightContent,
  title,
  subtitle,
  actions,
  loading = false,
  className
}) => {
  return (
    <AdminPageLayout loading={loading} className="p-0 lg:p-0 overflow-hidden">
      <div className={cn(
        "flex flex-col h-screen lg:h-[calc(100vh-80px)] w-full overflow-hidden",
        "bg-background transition-colors duration-500",
        className
      )}>
        
        {/* --- OPTIONAL TOP BAR --- */}
        {(title || actions) && (
          <header className="h-20 shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-8 flex items-center justify-between z-40">
            <div className="flex flex-col">
              {title && (
                <Typography variant="h4" className="text-title uppercase font-black italic leading-none tracking-tight">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" className="text-desc/50 uppercase font-bold tracking-widest mt-1">
                  {subtitle}
                </Typography>
              )}
            </div>
            <div className="flex items-center gap-4">
              {actions}
            </div>
          </header>
        )}

        {/* --- MAIN PANE GRID --- */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* 1. LEFT PANE (Filters/Staging) - 280px */}
          <aside className={cn(
            "w-full lg:w-[280px] shrink-0 flex flex-col overflow-y-auto custom-scrollbar z-20",
            "border-b lg:border-b-0 lg:border-r border-border",
            "bg-surface/30 dark:bg-black/20 backdrop-blur-sm",
            "light:bg-slate-100" // Light mode specific contrast
          )}>
            {leftContent}
          </aside>

          {/* 2. CENTER PANE (Main Workspace) - Fluid */}
          <main className={cn(
            "flex-1 flex flex-col min-w-0 overflow-hidden relative z-10",
            "bg-background/50"
          )}>
            {centerContent}
          </main>

          {/* 3. RIGHT PANE (Inspector/Form) - 350px */}
          <aside className={cn(
            "hidden xl:flex w-[350px] shrink-0 flex-col overflow-y-auto custom-scrollbar z-30 shadow-2xl",
            "border-l border-border",
            "bg-surface dark:bg-[#121212]",
            "light:bg-white light:shadow-slate-200" // Elevated contrast for forms in Light Mode
          )}>
            {rightContent}
          </aside>

        </div>
      </div>
    </AdminThreeColumnLayout>
  );
};

export default AdminThreeColumnLayout;