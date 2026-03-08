import React from 'react';
import { cn } from '../../lib/utils'; // [Source 336]

export interface DividerProps {
  className?: string;
  vertical?: boolean;
  /**
   * Stile del divisore:
   * - default: Standard semantico (grigio chiaro/scuro)
   * - mineral: Per superfici vetrose (bianco trasparente)
   * - brand: Colore primario (Pink)
   * - action: Colore azione (Green)
   * - gradient: Sfumatura da trasparente a opaco (ottimo per sezioni)
   */
  variant?: 'default' | 'mineral' | 'brand' | 'action' | 'gradient'; 
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
}

const Divider: React.FC<DividerProps> = ({
  className,
  vertical = false,
  variant = 'default',
  label,
  labelPosition = 'center',
}) => {

  // 1. MAPPATURA STILI (System 4.8)
  const variantStyles = {
    // Standard: usa var(--color-border) definita in index.css [Source 567, 569]
    default: 'border-border', 
    
    // Mineral: Per card scure/glass (Source 579)
    mineral: 'border-white/10', 
    
    // Brand: Identità Pink
    brand: 'border-primary/50', 
    
    // Action: Success/Confirm Green
    action: 'border-action/50',

    // Gradient: Gestito via classi background, non border
    gradient: 'border-0 bg-gradient-to-r from-transparent via-border to-transparent h-px', 
  };

  // Stili specifici per il gradiente (override se necessario)
  const gradientOverrides = {
    brand: 'from-transparent via-primary/50 to-transparent',
    action: 'from-transparent via-action/50 to-transparent',
    mineral: 'from-transparent via-white/20 to-transparent',
    default: 'from-transparent via-border to-transparent',
  };

  // 2. LOGICA LABEL (Tipografia Accent)
  const labelStyles = "font-accent text-[10px] font-black uppercase tracking-[0.2em] text-desc opacity-60 whitespace-nowrap px-4";

  // Se c'è una LABEL, il layout è Flexbox
  if (label) {
    // Fix: Simplified ternary to avoid type narrowing issues kha
    const isGradient = variant === 'gradient';
    const lineClass = cn(
      "flex-1 border-t",
      isGradient ? gradientOverrides.brand : variantStyles[variant as keyof typeof variantStyles]
    );

    return (
      <div className={cn('flex items-center w-full py-4', className)}>
        {(labelPosition === 'center' || labelPosition === 'right') && (
          <div className={lineClass} />
        )}
        
        <span className={labelStyles}>
          {label}
        </span>

        {(labelPosition === 'center' || labelPosition === 'left') && (
          <div className={lineClass} />
        )}
      </div>
    );
  }

  // 3. DIVIDER VERTICALE
  if (vertical) {
    return (
      <div
        className={cn(
          'inline-block h-auto min-h-[1em] w-px self-stretch mx-2',
          variant === 'gradient' 
            ? 'bg-gradient-to-b from-transparent via-border to-transparent border-0' 
            : `border-l ${variantStyles[variant]}`,
          className
        )}
      />
    );
  }

  // 4. DIVIDER ORIZZONTALE STANDARD
  return (
    <hr
      className={cn(
        'w-full my-4 border-t-0', // Reset base
        variant === 'gradient'
          ? cn('h-px', variantStyles.gradient) // Usa background per gradient
          : cn('border-t', variantStyles[variant]), // Usa border per solidi
        className
      )}
    />
  );
};

export default Divider;