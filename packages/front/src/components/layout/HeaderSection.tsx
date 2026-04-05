import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import Typography from '../ui/Typography';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import Badge from '../ui/navigation/Badge';
export type HeaderSectionVariant = 'hero' | 'section' | 'history' | 'kitchen';
export type HeaderSectionAlign = 'left' | 'center' | 'right';

export interface HeaderSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
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
}) => {
  // Mappatura allineamento responsiva: Forza centro su mobile, rispetta prop su md+
  const alignmentClasses = {
    left: 'text-center items-center md:text-left md:items-start',
    center: 'text-center items-center',
    right: 'text-center items-center md:text-right md:items-end',
  }[align];

  // Mappatura semantica delle varianti tipografiche
  const getTitleVariant = () => {
    if (variant === 'hero') return 'titleMain';
    if (variant === 'history' || variant === 'kitchen') return 'h3';
    return 'h2';
  };

  const fromClass = GRADIENT_FROM[gradientFrom] || 'from-primary';
  const toClass = GRADIENT_TO[gradientTo] || 'to-action';

  // Helper per renderizzare il titolo
  const renderTitle = () => {
    const titleVariant = getTitleVariant();
    const AsTag = variant === 'hero' ? 'h1' : (variant === 'section' ? 'h2' : 'h3');

    if (!highlight) {
      return (
        <Typography variant={titleVariant} as={AsTag} color="title">
          {title}
        </Typography>
      );
    }

    return (
      <Typography
        variant={titleVariant}
        as={AsTag}
        color="title"
        className={cn("[column-gap:var(--space-fluid-xs)] flex flex-wrap", align === 'center' ? 'justify-center' : 'justify-center md:justify-start')}
      >
        <span>{title}</span>
        <Typography
          variant={variant === 'hero' ? 'titleHighlight' : titleVariant}
          as="span"
          className={cn(
            variant !== 'hero' && `text-transparent bg-clip-text bg-gradient-to-r ${fromClass} ${toClass}`,
            "pb-1"
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
        <div className="[margin-bottom:var(--space-fluid-s)]">
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
        <div className="[margin-bottom:var(--space-fluid-3xs)]">
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
          "[margin-top:var(--space-fluid-2xs)] [margin-bottom:var(--space-fluid-s)] opacity-90 hover:opacity-100 transition-opacity mx-auto md:mx-0",
          align === 'center' ? 'md:mx-auto' : (align === 'right' ? 'md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0')
        )}>
          <div className="block md:hidden">
            <AkhaPixelPattern variant="line_simple" size={5} speed={40} />
          </div>
          <div className="hidden md:block">
            <AkhaPixelPattern variant="line_simple" size={8} speed={40} />
          </div>
        </div>
      )}

      {/* 5. DESCRIPTION */}
      {!hideDescription && description && (
        <Typography
          variant={variant === 'hero' ? 'paragraphM' : 'body'}
          color="sub"
          className="max-w-2xl whitespace-pre-line"
        >
          {description}
        </Typography>
      )}

    </div>
  );
};

export default HeaderSection;
