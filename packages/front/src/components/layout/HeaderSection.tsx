import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, Badge } from '../ui/index';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';

export type HeaderSectionVariant = 'hero' | 'section' | 'history' | 'kitchen';
export type HeaderSectionAlign = 'left' | 'center' | 'right';

interface HeaderSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  /** Part of the title to highlight with a gradient (for 'section' variant) */
  highlight?: string;
  /** Badge text (often used in 'kitchen' variant) */
  tag?: string;
  variant?: HeaderSectionVariant;
  align?: HeaderSectionAlign;
  /** Custom gradient start color (e.g., 'primary', 'quiz', 'action') */
  gradientFrom?: string;
  /** Custom gradient end color (e.g., 'action', 'secondary') */
  gradientTo?: string;
  className?: string;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideDivider?: boolean;
  hideDescription?: boolean;
}

/**
 * Reusable Header component with 4 visual variants to unify section titles across the app.
 */
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
}) => {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  // Helper to render the title with an optional highlighted (gradient) portion
  const renderTitle = (TagVariant: any, extraClass: string = "") => {
    if (!highlight || !title.includes(highlight)) {
      return (
        <Typography variant={TagVariant} className={extraClass}>
          {title}
        </Typography>
      );
    }

    const parts = title.split(highlight);
    return (
      <Typography variant={TagVariant} className={cn(extraClass, "inline-block mb-0")}>
        {parts[0]}
        <span className={cn(
          "text-transparent bg-clip-text bg-gradient-to-r inline-block px-6 -ml-6 -mr-6",
          `from-${gradientFrom} to-${gradientTo}`
        )}>
          {highlight}
        </span>
        {parts[1]}
      </Typography>
    );
  };

  return (
    <div className={cn("w-full flex flex-col gap-4", alignmentClasses, className)}>

      {/* 1. HERO VARIANT (Big Display Title + Pixel Pattern) */}
      {variant === 'hero' && (
        <div className={cn("space-y-4 mb-4", alignmentClasses)}>
          <Typography
            variant="titleMain"
            className=""
          >
            {title}
          </Typography>
          <div className="opacity-60 mt-4">
            <AkhaPixelPattern
              variant="line_simple"
              size={8}
              speed={25}
              expandFromCenter={align === 'center'}
              animateInView={true}
              className={cn("gap-2", align === 'center' ? "mx-auto" : "")}
            />
          </div>
          {subtitle && (
            <Typography variant="h5" color="sub">
              {subtitle}
            </Typography>
          )}
        </div>
      )}

      {/* 2. SECTION VARIANT (Standard H2 with Gradient Support) */}
      {variant === 'section' && (
        <div className={cn("flex flex-col", alignmentClasses)}>
          {!hideTitle && renderTitle("titleMain")}
          {(!hideSubtitle && subtitle) && (
            <Typography variant="h5" color="sub" className="mt-2">
              {subtitle}
            </Typography>
          )}
          {!hideDivider && (
            <div className="opacity-60 my-6">
              <AkhaPixelPattern
                variant="line_simple"
                size={6}
                speed={25}
                expandFromCenter={align === 'center'}
                animateInView={true}
                className={cn("gap-2", align === 'center' ? "mx-auto" : "")}
              />
            </div>
          )}
          {(!hideDescription && description) && (
            <Typography variant="paragraphL" className="opacity-80 max-w-2xl">
              {description}
            </Typography>
          )}
        </div>
      )}

      {/* 3. HISTORY VARIANT (Narrative style with lateral border) */}
      {variant === 'history' && (
        <div className={cn(
          "flex flex-col md:flex-row md:items-end justify-between gap-6",
          align === 'left' ? "border-l-4 border-primary pl-6" : "",
          align === 'right' ? "border-r-4 border-primary pr-6" : "",
          align === 'center' ? "px-6" : ""
        )}>
          <div className="space-y-2">
            <Typography variant="h2">{title}</Typography>
            {subtitle && (
              <Typography variant="h6" color="sub">
                {subtitle}
              </Typography>
            )}
            {description && <Typography variant="paragraphM" color="sub">{description}</Typography>}
          </div>
        </div>
      )}

      {/* 4. KITCHEN VARIANT (Badge + Small Bold Heading) */}
      {variant === 'kitchen' && (
        <div className={cn("space-y-4", alignmentClasses)}>
          {tag && (
            <Badge variant="mineral" className={cn("w-fit", `text-${gradientFrom} border-${gradientFrom}/20 bg-${gradientFrom}/10`)}>
              {tag.replace(/_/g, ' ')}
            </Badge>
          )}
          <div>
            <Typography variant="h3" className="mb-2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h6">
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSection;
