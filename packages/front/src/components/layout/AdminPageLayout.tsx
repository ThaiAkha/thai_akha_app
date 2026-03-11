import React from 'react';
import { cn } from '../../lib/utils';

interface AdminPageLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  children,
  loading = false,
  className
}) => {

  return (
    // 1. CONTAINER: Usa i token semantici (bg-background, text-desc)
    <div className="relative w-full min-h-[calc(100vh-80px)] lg:min-h-screen bg-background text-desc font-sans selection:bg-action selection:text-white overflow-x-hidden transition-colors duration-500">
      
      {/* 2. BACKGROUND TECNICO (Grid Pattern Adattivo) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Griglia Sottile: Nero al 5% in Light, Bianco al 5% in Dark */}
        <div className="absolute inset-0 
          bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] 
          dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] 
          bg-[size:4rem_4rem]" 
        />
        
        {/* Vignette Radiale: Sfuma verso il colore di sfondo corrente */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-background opacity-80" />
      </div>

      {/* 3. CONTENUTO PRINCIPALE */}
      <div className={cn("relative z-10 w-full h-full flex flex-col p-4 md:p-6 lg:p-8 animate-in fade-in duration-500", className)}>
        
        {/* LOADING STATE */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-4 opacity-50 animate-pulse">
            <div className="size-16 rounded-full border-4 border-desc/10 border-t-action animate-spin" />
            <span className="font-mono text-xs text-desc/60 uppercase tracking-widest">Loading System Data...</span>
          </div>
        ) : (
          <main className="flex-1 w-full">
            {children}
          </main>
        )}

      </div>
    </div>
  );
};

export default AdminPageLayout;