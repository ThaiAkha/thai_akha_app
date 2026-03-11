
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { Typography, Icon } from './index';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'mineral' | 'cinema' | 'quiz';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  variant = 'mineral',
  size = 'md',
  className,
  hideCloseButton = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-full h-full rounded-none m-0',
  };

  const variantStyles = {
    mineral: 'bg-surface dark:bg-[#121212] border border-white/10 shadow-2xl',
    cinema: 'bg-black border-none shadow-none text-white',
    quiz: 'bg-surface dark:bg-[#18181b] border-2 border-quiz/30 shadow-[0_0_40px_rgba(254,202,42,0.15)]'
  };

  const backdropClasses = variant === 'cinema'
    ? 'bg-black/95 backdrop-blur-xl'
    : 'bg-black/60 backdrop-blur-md';

  return createPortal(
    /* 
       FIX: z-[1000] per superare Chat (100) e Sidebar (50). 
       Il valore precedente z-[3] era insufficiente kha! 
    */
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      
      {/* BACKDROP */}
      <div 
        className={cn("absolute inset-0 transition-opacity", backdropClasses)}
        onClick={onClose}
      />

      {/* PANEL */}
      <div
        className={cn(
          "relative z-10 w-full flex flex-col max-h-[90vh] overflow-hidden outline-none",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-cinematic",
          "rounded-[2.5rem]",
          variantStyles[variant],
          sizeClasses[size],
          className
        )}
      >
        {/* HEADER */}
        {(title || !hideCloseButton) && (
          <div className={cn(
            "flex items-center justify-between px-6 py-5 shrink-0",
            variant !== 'cinema' && "border-b border-white/5"
          )}>
            <div className="pr-8">
              {title && (
                <Typography variant="h4" className={cn("font-black uppercase tracking-tight", variant === 'quiz' && "text-quiz")}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="paragraphS" color="muted" className="mt-1 leading-snug">
                  {description}
                </Typography>
              )}
            </div>

            {!hideCloseButton && (
              <button 
                onClick={onClose}
                className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-desc hover:text-primary active:scale-90"
              >
                <Icon name="close" size="sm" />
              </button>
            )}
          </div>
        )}

        {/* CONTENT */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          // ✅ FIX: Usa 'no-scrollbar' (invisibile) per Cinema, 'custom-scrollbar' (stilizzata) per il resto
          variant === 'cinema' ? "no-scrollbar" : "custom-scrollbar",
          
          // Gestione Padding e Layout esistente
          variant === 'cinema' ? "p-0 flex items-center justify-center" : "p-6 lg:p-8"
        )}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
