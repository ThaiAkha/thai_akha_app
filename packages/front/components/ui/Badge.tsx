import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon'; 

export interface BadgeProps {
  variant?: 'solid' | 'outline' | 'mineral' | 'brand' | 'allergy'; 
  children: React.ReactNode;
  className?: string;
  icon?: string;
  pulse?: boolean;
  active?: boolean; 
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  children,
  className,
  icon,
  pulse = false,
  active = false, 
  onClick,
}) => {

  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-500 select-none ease-cinematic";

  const variants = {
    solid: 'bg-action text-white shadow-lg shadow-action/20 border-t border-white/20 px-4 py-1 rounded-full text-[10px] md:text-[12px] font-accent font-black uppercase tracking-[0.15em]',
    
    brand: 'bg-primary text-white shadow-badge-glow border-t border-white/20 px-4 py-1 rounded-full text-[10px] md:text-[12px] font-accent font-black uppercase tracking-[0.15em]',
    
    outline: 'bg-transparent border border-current text-current opacity-80 px-4 py-1 rounded-full text-[10px] md:text-[12px] font-accent font-black uppercase tracking-[0.15em]',
    
    mineral: 'bg-action/5 dark:bg-action/15 backdrop-blur-md border border-action/20 shadow-sm text-action dark:text-white px-4 pt-3 pb-2 rounded-full text-[10px] md:text-[12px] font-accent font-black uppercase tracking-[0.15em]',
    
    /* ✨ REFACTORED ALLERGY VARIANT (System 4.8 Refined) */
    allergy: cn(
      "px-3 py-2 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest border transition-all duration-500", 
      active 
        ? "bg-allergy/30 border-allergy text-white shadow-glow-allergy glass-shine backdrop-blur-md" 
        : "bg-allergy/15 border-allergy/20 text-white/60 hover:text-white/80 hover:border-allergy/40 hover:bg-allergy/20"
    )
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component 
      onClick={onClick}
      className={cn(
        baseStyles, 
        variants[variant], 
        onClick && "cursor-pointer active:scale-95",
        className
      )}
    >
      {/* Icona Standard */}
      {icon && !pulse && <Icon name={icon} size="xs" />}
      
      {/* Icona Pulsante */}
      {icon && pulse && (
         <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
         </span>
      )}

      <span className="leading-none">{children}</span>
    </Component>
  );
};

export default Badge;