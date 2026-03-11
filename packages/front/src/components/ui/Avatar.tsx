import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  initials?: string;
  className?: string;
  bordered?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  initials,
  className,
  bordered = true,
}) => {

  // 1. DIMENSIONI SCALARI
  const sizeClasses = {
    sm: 'size-8 text-[10px]',
    md: 'size-12 text-sm',
    lg: 'size-16 text-lg',
    xl: 'size-24 text-2xl',
    '2xl': 'size-32 text-4xl', // Per Profile Page
  };

  // 2. CONTENUTO LOGICO
  const renderContent = () => {
    // A. Immagine
    if (src) {
      return (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            // Fallback immediato se l'immagine rompe
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('fallback-active');
          }}
        />
      );
    }

    // B. Iniziali (Brand Gradient)
    if (initials) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-transparent to-action/20">
          <span className="font-display font-black uppercase italic tracking-tighter text-primary drop-shadow-sm">
            {initials.slice(0, 2)}
          </span>
        </div>
      );
    }

    // C. Icona Default (Mineral Style)
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/5 text-desc/40">
        <span className="material-symbols-outlined text-[1.5em]">person</span>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 group isolate",
        // Bordo Mineral: Sottile bianco trasparente
        bordered && "border-2 border-white/10 shadow-inner",
        sizeClasses[size],
        className
      )}
    >
      {renderContent()}
      
      {/* Fallback container (nascosto di default, appare via JS se img error) */}
      <div className="hidden fallback-active:flex absolute inset-0 items-center justify-center bg-white/5 text-desc/40">
         <span className="material-symbols-outlined text-[1.5em]">person_off</span>
      </div>
    </div>
  );
};

export default Avatar;