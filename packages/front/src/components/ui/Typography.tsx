import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export type TypographyVariant =
  | 'display1' | 'display2'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'titleMain' | 'titleHighlight'
  | 'paragraphL' | 'paragraphM' | 'paragraphS' | 'body'
  | 'accent' | 'badge' | 'quote' | 'caption'
  | 'monoLabel' | 'statNumber' | 'microLabel' | 'fieldLabel';

export type TypographyColor =
  | 'primary' | 'secondary' | 'action' | 'quiz'
  | 'default' | 'title' | 'sub' | 'muted' | 'inverse' | 'inherit';

// MAPPA STILI CORRETTA - con scala progressiva
const VARIANT_STYLES: Record<TypographyVariant, { element: React.ElementType; className: string }> = {

  // --- DISPLAY & HERO ---
  display1: {
    element: 'h1',
    className: "font-display font-black uppercase italic leading-[0.85] tracking-tighter text-6xl md:text-7xl lg:text-8xl text-gray-900 dark:text-gray-100"
  },
  display2: {
    element: 'h2',
    className: "font-display font-black uppercase italic leading-[0.85] tracking-tighter text-4xl md:text-6xl lg:text-7xl text-gray-900 dark:text-gray-100"
  },

  // --- HEADINGS ---
  h1: { element: 'h1', className: "font-display font-black uppercase text-4xl md:text-5xl lg:text-6xl tracking-relaxed text-gray-900 dark:text-gray-100" },
  h2: { element: 'h2', className: "font-display font-bold uppercase text-3xl md:text-4xl lg:text-5xl tracking-relaxed text-gray-900 dark:text-gray-100" },
  h3: { element: 'h3', className: "font-display font-bold uppercase text-2xl md:text-3xl lg:text-4xl tracking-relaxed text-gray-900 dark:text-gray-100" },
  h4: { element: 'h4', className: "font-display font-bold uppercase text-xl md:text-2xl lg:text-3xl tracking-relaxed text-gray-900 dark:text-gray-200" },
  h5: { element: 'h5', className: "font-display font-bold uppercase text-lg md:text-xl lg:text-2xl tracking-relaxed text-gray-900 dark:text-gray-300" },
  h6: { element: 'h6', className: "font-display font-bold uppercase text-base md:text-lg lg:text-xl tracking-relaxed text-gray-900 dark:text-gray-400" },

  // --- HERO SPECIFIC ---
  titleMain: { element: 'span', className: "font-display font-black uppercase text-2xl md:text-4xl lg:text-5xl tracking-[-0.02em] text-gray-700 dark:text-gray-200" },
  titleHighlight: { element: 'span', className: "font-display font-light italic text-2xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-action" },

  // --- 4 PARAGRAFI CON SCALA PROGRESSIVA (body come base) ---
  body: {
    element: 'p',
    className: "font-sans font-normal leading-relaxed text-sm text-gray-800 dark:text-gray-300"
    // BASE: 16px
  },
  paragraphS: {
    element: 'p',
    className: "font-sans font-normal leading-relaxed text-base text-gray-800 dark:text-gray-300"
    // PIÙ PICCOLO: 14px (1 stop sotto body)
  },
  paragraphM: {
    element: 'p',
    className: "font-sans font-normal leading-relaxed text-lg text-gray-800 dark:text-gray-300"
    // PIÙ GRANDE: 18px (1 stop sopra body)
  },
  paragraphL: {
    element: 'p',
    className: "font-sans font-normal leading-relaxed text-xl text-gray-800 dark:text-gray-300"
    // MASSIMO: 20-24px (2 stop sopra body)
  },

  // --- UI & ACCENTS ---
  accent: { element: 'span', className: "font-accent font-black uppercase tracking-[0.25em] text-sm md:text-base" },
  badge: { element: 'span', className: "font-sans font-bold uppercase tracking-[0.25em] text-sm" },
  quote: { element: 'blockquote', className: "font-display font-light italic leading-relaxed text-xl md:text-2xl border-l-4 border-primary pl-6 py-2 text-gray-800 dark:text-gray-300" },
  caption: { element: 'span', className: "font-sans text-xs md:text-sm italic text-gray-700 dark:text-gray-500" },

  // --- UI DATA ---
  monoLabel: { element: 'span', className: "font-mono font-bold uppercase tracking-[0.2em] text-xs text-gray-700 dark:text-gray-500" },
  statNumber: { element: 'span', className: "font-mono font-black text-2xl md:text-4xl text-gray-900 dark:text-gray-100" },
  microLabel: { element: 'span', className: "font-sans text-[9px] md:text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-600" },
  fieldLabel: { element: 'label', className: "font-sans text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-300" },
};

// COLORI BRAND (invariati)
const COLOR_STYLES: Record<TypographyColor, string> = {
  default: "text-gray-800 dark:text-gray-300",
  title: "text-gray-900 dark:text-gray-100",
  sub: "text-gray-700 dark:text-gray-400",
  muted: "text-gray-500 dark:text-gray-500",
  inverse: "text-white dark:text-gray-900",
  inherit: "text-inherit",
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
  variant = 'body',
  children,
  className,
  as,
  color,
  ...props
}) => {
  const variantConfig = VARIANT_STYLES[variant] || VARIANT_STYLES['body'];
  const Tag = as || variantConfig.element;
  const colorClass = color ? COLOR_STYLES[color] : undefined;

  return (
    <Tag className={cn(variantConfig.className, colorClass, className)} {...props}>
      {children}
    </Tag>
  );
};

export default Typography;