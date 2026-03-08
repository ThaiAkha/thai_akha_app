import React from 'react';
import AkhaPixelPattern from './AkhaPixelPattern';
import { cn } from '../../lib/utils';

interface AkhaLoaderProps {
  /** 'spin' ruota tutto, 'bloom' usa l'effetto riempimento loop */
  variant?: 'spin' | 'bloom'; 
  size?: number;
  className?: string;
}

const AkhaLoader: React.FC<AkhaLoaderProps> = ({ 
  variant = 'bloom', // Default più elegante per il System 4.8
  size = 6, 
  className 
}) => {
  
  if (variant === 'spin') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {/* Container che ruota lentamente (3 secondi) */}
        <div className="animate-spin [animation-duration:3s]">
          <AkhaPixelPattern 
            variant="flower" 
            size={size} 
            speed={5} // Riempimento veloce iniziale
            className="scale-100"
          />
        </div>
      </div>
    );
  }

  // Variante 'bloom' (Il fiore nasce e rinasce)
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <AkhaPixelPattern 
        variant="flower" 
        size={size}
        speed={40}       // Velocità di "sbocciatura"
        loop={true}      // Loop attivo
        loopDelay={500}  // Pausa breve tra un ciclo e l'altro
      />
    </div>
  );
};

export default AkhaLoader;

