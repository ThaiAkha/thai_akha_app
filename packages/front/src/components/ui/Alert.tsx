import React from 'react';
import { cn } from '../../lib/utils';
import { Typography, Icon } from './index';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  list?: string[]; // 👈 NUOVO: Attiva la modalità "Lista Sostituti"
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  list,
  className = '',
  onClose,
}) => {

  // CONFIGURAZIONE STILI SYSTEM 4.8 (Mineral + Glow)
  const styles = {
    info: {
      container: "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]",
      icon: "info",
      bullet: "bg-blue-400"
    },
    success: {
      container: "bg-action/10 border-action/20 text-action shadow-action-glow",
      icon: "check_circle",
      bullet: "bg-action"
    },
    // 🟠 WARNING (Usato per Intolleranze/Lifestyle - Arancione)
    warning: {
      container: "bg-special/10 border-special/30 text-special shadow-glow-special",
      icon: "tips_and_updates",
      bullet: "bg-special"
    },
    // 🔴 ERROR (Usato per Allergie Critiche - Rosso)
    error: {
      container: "bg-allergy/10 border-allergy/30 text-allergy shadow-glow-allergy",
      icon: "health_and_safety", // Icona specifica per sicurezza
      bullet: "bg-allergy"
    },
  };

  const currentStyle = styles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-xl transition-all duration-500",
        "flex flex-col gap-4 group",
        currentStyle.container,
        className
      )}
    >
      {/* Background Shine Effect (Solo per Warning/Error) */}
      {(variant === 'warning' || variant === 'error') && (
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50" />
      )}

      {/* HEADER: Icona + Testi */}
      <div className="flex items-start gap-4 relative z-10">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 shrink-0 backdrop-blur-md">
           <Icon name={currentStyle.icon} size="md" className="animate-pulse-slow" />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          {title && (
            <Typography variant="h5" className="font-black uppercase tracking-tight leading-none mb-1 text-current">
              {title}
            </Typography>
          )}
          <Typography variant="body" className="text-sm font-medium opacity-90 leading-relaxed">
            {message}
          </Typography>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 rounded-full hover:bg-black/10 transition-colors opacity-60 hover:opacity-100"
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      {/* LISTA SOSTITUTI (Renderizzata solo se presente) */}
      {list && list.length > 0 && (
        <div className={cn(
            "relative z-10 pt-4 mt-1 border-t border-dashed", 
            variant === 'error' ? "border-allergy/30" : "border-white/10"
        )}>
           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 block">
             Safe Substitutions
           </span>
           
           <ul className="space-y-2">
             {list.map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-sm font-bold opacity-90">
                  {/* Pallino Tabulazione */}
                  <div className={cn("size-2 rounded-full shadow-sm ring-2 ring-opacity-30 ring-white", currentStyle.bullet)} />
                  {item}
               </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
};

export default Alert;