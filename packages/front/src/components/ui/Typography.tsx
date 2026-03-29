import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * Typography variants — Thai Akha Kitchen Design System v4
 *
 * Display: display1/display2 — hero giganteschi
 * Headings: h1-h6 — titoli sezione, no uppercase
 * Hero: titleMain/titleHighlight — span hero specifici
 * Body: paragraphL/M/S, body — testo corpo
 * UI: accent/badge/caption/quote/microLabel/fieldLabel
 * Numeric: numericPrice/numericStat/numericRegular — usa font-numeric (Noto Sans)
 *
 * @see docs/typography-v4.md
 * @see docs/Agent-Typography.md
 */
export type TypographyVariant =
  | 'display1' | 'display2'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'titleMain' | 'titleHighlight'
  | 'paragraphL' | 'paragraphM' | 'paragraphS' | 'body'
  | 'accent' | 'badge' | 'quote' | 'caption'
  | 'microLabel' | 'fieldLabel'
  | 'numericPrice' | 'numericStat' | 'numericRegular';

export type TypographyColor =
  | 'primary' | 'secondary' | 'action' | 'quiz'
  | 'default' | 'title' | 'sub' | 'muted' | 'inverse' | 'inherit';

const VARIANT_STYLES: Record<TypographyVariant, { element: React.ElementType; className: string }> = {

  // --- DISPLAY & HERO ---
  display1: {
    element: 'h1',
    className: "font-display font-black italic leading-[0.85] tracking-tighter text-5xl md:text-7xl lg:text-8xl text-title"
  },
  display2: {
    element: 'h2',
    className: "font-display font-black italic leading-[0.85] tracking-tighter text-4xl md:text-6xl lg:text-7xl text-title"
  },

  // --- HEADINGS ---
  h1: { element: 'h1', className: "font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight md:tracking-relaxed text-title" },
  h2: { element: 'h2', className: "font-display font-bold text-2xl md:text-3xl lg:text-4xl tracking-tight md:tracking-relaxed text-title" },
  h3: { element: 'h3', className: "font-display font-bold text-xl md:text-2xl lg:text-3xl tracking-tight md:tracking-relaxed text-title" },
  h4: { element: 'h4', className: "font-display font-bold text-lg md:text-xl lg:text-2xl tracking-tight md:tracking-relaxed text-title" },
  h5: { element: 'h5', className: "font-display font-bold text-base md:text-lg lg:text-xl tracking-tight md:tracking-relaxed text-title" },
  h6: { element: 'h6', className: "font-display font-bold text-sm md:text-base lg:text-lg tracking-tight md:tracking-relaxed text-title" },

  // --- HERO SPECIFIC ---
  titleMain: { element: 'span', className: "font-display font-black text-2xl md:text-4xl lg:text-5xl tracking-[-0.02em] text-sub" },
  titleHighlight: { element: 'span', className: "font-display font-bold italic text-2xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-action" },

  // --- BODY / PARAGRAPHS ---
  body: { element: 'p', className: "font-sans font-normal leading-relaxed text-base md:text-base lg:text-lg text-desc" },
  paragraphS: { element: 'p', className: "font-sans font-normal leading-relaxed text-sm md:text-sm lg:text-base text-desc" },
  paragraphM: { element: 'p', className: "font-sans font-normal leading-relaxed text-base md:text-lg lg:text-xl text-desc" },
  paragraphL: { element: 'p', className: "font-sans font-normal leading-relaxed text-lg md:text-xl lg:text-2xl text-desc" },

  // --- UI & ACCENTS ---
  accent: { element: 'span', className: "font-accent font-black uppercase tracking-[0.25em] text-sm md:text-base" },
  badge: { element: 'span', className: "font-sans font-bold uppercase tracking-[0.25em] text-sm" },
  quote: { element: 'blockquote', className: "font-display font-light italic leading-relaxed text-xl md:text-2xl border-l-4 border-primary pl-6 py-2 text-desc" },
  caption: { element: 'span', className: "font-sans text-xs md:text-sm italic text-muted" },

  // --- UI DATA ---
  microLabel: { element: 'span', className: "font-sans text-[10px] md:text-xs font-black uppercase tracking-widest text-muted" },
  fieldLabel: { element: 'label', className: "font-sans text-xs font-semibold uppercase tracking-wider text-desc" },

  // --- NUMERIC (font-numeric = Noto Sans + Noto Sans Thai) ---
  numericPrice: { element: 'span', className: "font-numeric font-bold text-2xl md:text-4xl text-title" },
  numericStat: { element: 'span', className: "font-numeric font-bold text-xl md:text-3xl text-primary" },
  numericRegular: { element: 'span', className: "font-numeric font-normal text-base md:text-lg text-desc" },
};

const COLOR_STYLES: Record<TypographyColor, string> = {
  default: "text-desc",
  title: "text-title",
  sub: "text-sub",
  muted: "text-muted",
  inverse: "text-inverse",
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