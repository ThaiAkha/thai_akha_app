import React, { useState, useEffect } from 'react';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import { cn } from '../../lib/utils';

interface CinematicBackgroundProps {
  isLoaded: boolean;
  imageUrl: string;
  showPatterns?: boolean;
}

const CinematicBackground: React.FC<CinematicBackgroundProps> = ({ 
  isLoaded, 
  imageUrl,
  showPatterns = false 
}) => {
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    setImgReady(false);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImgReady(true);
  }, [imageUrl]);

  const show = isLoaded && imgReady;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      
      {/* 1. TEXTURE FOTOGRAFICA CON TRANSITION */}
      <div 
        className={cn(
            "absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out will-change-transform",
            show ? "opacity-[0.08] dark:opacity-[0.12] scale-100 blur-0" : "opacity-0 scale-110 blur-xl"
        )}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* 2. GRADIENT OVERLAYS (Sempre presenti per ammorbidire) */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-80" />

      {/* 3. ORNAMENTAL PATTERNS (Opzionali) */}
      {showPatterns && show && (
        <>
          <div className="absolute bottom-1/4 right-12 opacity-10 animate-pulse-slow hidden lg:block">
             <AkhaPixelPattern variant="diamond" size={8} />
          </div>
        </>
      )}
    </div>
  );
};

export default CinematicBackground;