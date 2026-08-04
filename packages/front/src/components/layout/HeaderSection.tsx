import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import Typography from '../ui/Typography';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import Badge from '../ui/navigation/Badge';
export type HeaderSectionVariant = 'hero' | 'hero-1' | 'hero2' | 'section' | 'history' | 'kitchen';
export type HeaderSectionAlign = 'left' | 'center' | 'right';

export interface HeaderSectionProps {
  title: string;
  subtitle?: React.ReactNode | string;
  description?: React.ReactNode | string;
  highlight?: string;
  tag?: string;
  variant?: HeaderSectionVariant;
  align?: HeaderSectionAlign;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideDivider?: boolean;
  hideDescription?: boolean;
  hideTag?: boolean;
  /** Theme color for the header divider pixel pattern */
  dividerTheme?: import('../divider/AkhaPixelPattern').AkhaTheme;
}

// 🛡️ MAPPE STATICHE PER TAILWIND V4
const GRADIENT_FROM: Record<string, string> = {
  'primary': 'from-primary',
  'action': 'from-action',
  'quiz-p': 'from-quiz-p',
  'quiz-s': 'from-quiz-s',
  'btn-p': 'from-btn-p',
  'btn-s': 'from-btn-s',
  'secondary': 'from-secondary',
  'allergy': 'from-allergy',
  // Cherry/FAQ ocean family
  'deep-ocean': 'from-deep-ocean',
  'deep-blue': 'from-deep-blue',
  'ocean-blue': 'from-ocean-blue',
  'sky-blue': 'from-sky-blue',
  'light-blue': 'from-light-blue',
  'pale-ice': 'from-pale-ice',
};

const GRADIENT_TO: Record<string, string> = {
  'primary': 'to-primary',
  'action': 'to-action',
  'quiz-p': 'to-quiz-p',
  'quiz-s': 'to-quiz-s',
  'btn-p': 'to-btn-p',
  'btn-s': 'to-btn-s',
  'secondary': 'to-secondary',
  'allergy': 'to-allergy',
  // Cherry/FAQ ocean family
  'deep-ocean': 'to-deep-ocean',
  'deep-blue': 'to-deep-blue',
  'ocean-blue': 'to-ocean-blue',
  'sky-blue': 'to-sky-blue',
  'light-blue': 'to-light-blue',
  'pale-ice': 'to-pale-ice',
};

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  subtitle,
  description,
  highlight,
  tag,
  variant = 'section',
  align = 'center',
  gradientFrom = 'primary',
  gradientTo = 'action',
  className,
  hideTitle,
  hideSubtitle,
  hideDivider,
  hideDescription,
  hideTag,
  dividerTheme,
}) => {
  // Se non specificato, inferiamo il tema dal gradiente (es. quiz-p -> quiz)
  const activeDividerTheme = dividerTheme || (gradientFrom === 'quiz-p' ? 'quiz' : 'akha');

  // Mappatura allineamento responsiva: Forza centro su mobile, rispetta prop su md+
  const alignmentClasses = {
    left: 'text-center items-center md:text-left md:items-start',
    center: 'text-center items-center',
    right: 'text-center items-center md:text-right md:items-end',
  }[align];

  // Mappatura semantica delle varianti tipografiche
  const getTitleVariant = () => {
    if (variant === 'hero' || variant === 'hero2') return 'titleMain';
    if (variant === 'hero-1') return 'display2';
    if (variant === 'history' || variant === 'kitchen') return 'h3';
    return 'h2';
  };

  const fromClass = GRADIENT_FROM[gradientFrom] || 'from-primary';
  const toClass = GRADIENT_TO[gradientTo] || 'to-action';

  // Helper per renderizzare il titolo
  const renderTitle = () => {
    const titleVariant = getTitleVariant();
    const AsTag = variant === 'hero' ? 'h1' : (variant === 'hero-1' || variant === 'hero2' || variant === 'section' || variant === 'kitchen' ? 'h2' : 'h3');

    if (!highlight) {
      return (
        <Typography
          variant={titleVariant}
          as={AsTag}
          color="title"
          className={cn(variant === 'hero-1' && "![font-size:calc(var(--text-fluid-display2)*0.9)] leading-[1]")}
        >
          {title}
        </Typography>
      );
    }

    return (
      <Typography
        variant={titleVariant}
        as={AsTag}
        color="title"
        // aria-label ensures crawlers and screen readers get "Title Highlight"
        // with a space — CSS column-gap provides visual spacing but creates no
        // text node between the two spans, resulting in "TitleHighlight" in textContent.
        aria-label={`${title} ${highlight}`}
        className={cn(
          "flex [column-gap:var(--space-fluid-xs)]",
          variant === 'hero-1' ? "flex-col" : "flex-wrap",
          align === 'center' && "justify-center items-baseline text-center",
          align === 'left' && [
            "justify-center md:justify-start text-center md:text-left",
            variant === 'hero-1' ? "items-center md:items-start" : "items-baseline"
          ],
          variant === 'hero-1' && "![font-size:calc(var(--text-fluid-display2)*0.9)] leading-[1.0] [gap:var(--space-fluid-xs)]"
        )}
      >
        <span aria-hidden="true" className={cn(variant === 'hero-1' && "mb-0")}>{title}</span>
        {' '}
        <Typography
          variant={(variant === 'hero' || variant === 'hero-1' || variant === 'hero2') ? 'titleHighlight' : titleVariant}
          as="span"
          aria-hidden="true"
          className={cn(
            "text-transparent bg-clip-text bg-gradient-to-r inline-block",
            fromClass,
            toClass,
            "pe-[0.25em]",
            variant === 'hero-1' ? "pt-1 pb-4" : "pb-1",
            variant === 'hero-1' && "![font-size:0.85em] leading-none"
          )}
        >
          {highlight}
        </Typography>
      </Typography>
    );
  };

  return (
    <div className={cn("w-full mx-auto flex flex-col", alignmentClasses, className)}>

      {/* 1. TAG BADGE - Dimensione "sm" e testo con gradiente dell'highlight */}
      {tag && !hideTag && (
        <div className="[margin-bottom:var(--space-fluid-xs)]">
          <Badge variant="mineral" color={gradientTo} size="sm">
            <Typography
              variant="badge"
              as="span"
              className={cn(
                "text-transparent bg-clip-text bg-gradient-to-r", // Svuota il testo e gli applica il gradiente
                fromClass,
                toClass
              )}
            >
              {tag}
            </Typography>
          </Badge>
        </div>
      )}

      {/* 2. TITLE + HIGHLIGHT */}
      {!hideTitle && (
        <div className={(variant === 'hero' || variant === 'hero-1' || variant === 'hero2') ? 'mb-0' : '[margin-bottom:0px]'}>
          {renderTitle()}
        </div>
      )}

      {/* 3. SUBTITLE */}
      {!hideSubtitle && subtitle && (
        <Typography
          variant="paragraphM"
          color="sub"
          className="[margin-bottom:var(--space-fluid-2xs)] font-medium"
        >
          {subtitle}
        </Typography>
      )}

      {/* 4. DIVIDER RESPONSIVE */}
      {!hideDivider && (
        <div className={cn(
          "[margin-top:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-m)] opacity-90 hover:opacity-100 transition-opacity mx-auto md:mx-0",
          align === 'center' ? 'md:mx-auto' : (align === 'right' ? 'md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0')
        )}>
          <AkhaPixelPattern variant="line_simple" size={8} speed={40} theme={activeDividerTheme} />
        </div>
      )}

      {/* 5. DESCRIPTION */}
      {!hideDescription && description && (
        <Typography
          variant={(variant === 'hero' || variant === 'hero-1' || variant === 'hero2') ? 'paragraphM' : 'body'}
          color="sub"
          className={cn("max-w-2xl whitespace-pre-line", variant === 'hero-1' && "leading-snug")}
        >
          {description}
        </Typography>
      )}

    </div>
  );
};

export default HeaderSection;
