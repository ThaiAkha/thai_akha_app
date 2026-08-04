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
  | 'numericPrice' | 'numericStat' | 'numericMedium' | 'numericRegular';

export type TypographyColor =
  | 'primary' | 'secondary' | 'action' | 'quiz' | 'quiz-p' | 'btn-p' | 'btn-s' | 'ocean-blue'
  | 'default' | 'title' | 'sub' | 'muted' | 'inverse' | 'inherit' | 'white';

const VARIANT_STYLES: Record<TypographyVariant, { element: React.ElementType; className: string }> = {

  // --- DISPLAY & HERO ---
  display1: {
    element: 'h1',
    className: "font-display font-black italic leading-[0.85] tracking-tighter [font-size:var(--text-fluid-display1)] text-title"
  },
  display2: {
    element: 'h2',
    className: "font-display font-black italic leading-[0.9] tracking-tighter [font-size:var(--text-fluid-display2)] text-title"
  },

  // --- HEADINGS ---
  h1: { element: 'h1', className: "font-display font-black [font-size:var(--text-fluid-h1)] tracking-tight text-title" },
  h2: { element: 'h2', className: "font-display font-bold [font-size:var(--text-fluid-h2)] tracking-tight text-title" },
  h3: { element: 'h3', className: "font-display font-bold [font-size:var(--text-fluid-h3)] tracking-tight text-title" },
  h4: { element: 'h4', className: "font-display font-bold [font-size:var(--text-fluid-h4)] tracking-tight text-title" },
  h5: { element: 'h5', className: "font-display font-bold [font-size:var(--text-fluid-h5)] tracking-tight text-title" },
  h6: { element: 'h6', className: "font-display font-bold [font-size:var(--text-fluid-h6)] tracking-tight text-title" },

  // --- HERO SPECIFIC ---
  titleMain: { element: 'span', className: "font-display font-black [font-size:var(--text-fluid-hero)] tracking-[-0.02em] text-sub" },
  titleHighlight: { element: 'span', className: "font-display font-bold italic [font-size:var(--text-fluid-hero)] text-transparent bg-clip-text bg-gradient-to-r from-primary to-action" },

  // --- BODY / PARAGRAPHS ---
  body: { element: 'p', className: "font-sans font-normal leading-relaxed [font-size:var(--text-fluid-body)] text-desc" },
  paragraphS: { element: 'p', className: "font-sans font-normal leading-relaxed [font-size:var(--text-fluid-paragraphS)] text-desc" },
  paragraphM: { element: 'p', className: "font-sans font-normal leading-relaxed [font-size:var(--text-fluid-paragraphM)] text-desc" },
  paragraphL: { element: 'p', className: "font-sans font-normal leading-relaxed [font-size:var(--text-fluid-paragraphL)] text-desc" },

  // --- UI & ACCENTS ---
  accent: { element: 'span', className: "font-accent font-black uppercase tracking-[0.25em] [font-size:var(--text-fluid-accent)]" },
  badge: { element: 'span', className: "font-sans font-bold uppercase tracking-[0.25em] [font-size:var(--text-fluid-chip)]" },
  quote: { element: 'blockquote', className: "font-display font-light italic leading-relaxed [font-size:var(--text-fluid-quote)] border-l-4 border-primary pl-6 py-2 text-desc" },
  caption: { element: 'span', className: "font-sans [font-size:var(--text-fluid-caption)] italic text-muted" },

  // --- UI DATA ---
  microLabel: { element: 'span', className: "font-sans [font-size:var(--text-fluid-micro)] font-black uppercase tracking-widest text-muted" },
  fieldLabel: { element: 'label', className: "font-sans [font-size:var(--text-fluid-micro)] font-semibold uppercase tracking-wider text-desc" },

  // --- NUMERIC (font-numeric = Noto Sans + Noto Sans Thai) ---
  numericPrice: { element: 'span', className: "font-numeric font-bold [font-size:var(--text-fluid-numericPrice)] text-title" },
  numericStat: { element: 'span', className: "font-numeric font-bold [font-size:var(--text-fluid-numericStat)] text-primary" },
  numericMedium: { element: 'span', className: "font-numeric font-bold [font-size:var(--text-fluid-numericMedium)] text-title" },
  numericRegular: { element: 'span', className: "font-numeric font-normal [font-size:var(--text-fluid-body)] text-desc" },
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
  'quiz-p': "text-quiz-p",
  'btn-p': "text-btn-p",
  'btn-s': "text-btn-s",
  'ocean-blue': "text-ocean-blue",
  white: "text-white",
};

export interface TypographyProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
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