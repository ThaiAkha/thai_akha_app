import React from 'react';
import { cn } from '../../lib/utils';

// 1. DEFINIZIONE VARIANTI
export type TypographyVariant = 
  | 'display1' | 'display2' 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'titleMain' | 'titleHighlight' 
  | 'paragraphL' | 'paragraphM' | 'paragraphS'
  | 'accent' | 'badge' | 'quote' | 'caption' | 'body';

export type TypographyColor = 
  | 'primary' | 'secondary' | 'action' | 'quiz'
  | 'default' | 'title' | 'muted' | 'inverse' | 'inherit';

// 2. MAPPA STILI (System 4.8 Visual Scale)
const VARIANT_STYLES: Record<TypographyVariant, { element: React.ElementType; className: string }> = {
  
  // --- DISPLAY & HERO ---
  display1: { element: 'h1', className: "font-display font-black uppercase italic leading-[0.85] tracking-tighter text-6xl md:text-8xl lg:text-9xl" },
  display2: { element: 'h2', className: "font-display font-black uppercase italic leading-[0.9] tracking-tight text-4xl md:text-6xl" },
  
  // --- HEADINGS (Gerarchia Semantica) ---
  h1: { element: 'h1', className: "font-display font-black uppercase text-4xl md:text-6xl tracking-tighter" },
  h2: { element: 'h2', className: "font-display font-bold uppercase text-3xl md:text-5xl tracking-tight" },
  h3: { element: 'h3', className: "font-display font-bold uppercase text-2xl md:text-4xl" },
  h4: { element: 'h4', className: "font-display font-bold uppercase text-xl md:text-2xl tracking-tight" },
  h5: { element: 'h5', className: "font-display font-bold uppercase text-lg md:text-xl tracking-normal" },
  h6: { element: 'h6', className: "font-display font-bold uppercase text-sm md:text-base tracking-widest opacity-90" },

  // --- HERO SPECIFIC ---
  titleMain: { element: 'span', className: "font-display font-black uppercase text-2xl md:text-4xl lg:text-6xl tracking-[-0.02em]" },
  titleHighlight: { element: 'span', className: "font-display font-light italic text-1xl md:text-3xl lg:text-5xl" },

  // --- BODY TEXT ---
  paragraphL: { element: 'p', className: "font-sans font-light leading-relaxed text-lg md:text-2xl opacity-90" },
  paragraphM: { element: 'p', className: "font-sans font-light leading-relaxed text-base md:text-xl opacity-90" },
  paragraphS: { element: 'p', className: "font-sans font-medium leading-relaxed text-sm md:text-base" },
  body:       { element: 'p', className: "font-sans text-base leading-relaxed" },

  // --- UI & ACCENTS ---
  accent:  { element: 'span', className: "font-accent font-black uppercase tracking-[0.25em] text-sm md:text-base" },
  badge:   { element: 'span', className: "font-accent text-[10px] md:text-xs uppercase tracking-[0.2em] font-black" },
  quote:   { element: 'blockquote', className: "font-display font-light italic leading-relaxed text-2xl md:text-3xl border-l-4 border-primary pl-6 py-2" },
  caption: { element: 'span', className: "font-sans text-xs md:text-sm italic opacity-60" },
};

// 3. MAPPA COLORI SEMANTICI
const COLOR_STYLES: Record<TypographyColor, string> = {
  default: "text-desc",        
  title: "text-title",         
  muted: "text-desc/60",       
  inverse: "text-background",  
  inherit: "text-inherit",     
  
  // Brand
  primary: "text-primary",
  secondary: "text-secondary",
  action: "text-action",
  quiz: "text-quiz",
};

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'paragraphM', 
  children, 
  className, 
  as,
  color, 
  ...props 
}) => {
  const variantConfig = VARIANT_STYLES[variant] || VARIANT_STYLES['paragraphM'];
  const Tag = as || variantConfig.element;

  // Logica Colore Automatica
  let appliedColor = color;
  if (!appliedColor) {
    const isHeading = variant.startsWith('h') || variant.startsWith('display') || variant.startsWith('title');
    appliedColor = isHeading ? 'title' : 'default';
  }

  return (
    <Tag 
      className={cn(
        variantConfig.className, 
        COLOR_STYLES[appliedColor], 
        className 
      )} 
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Typography;