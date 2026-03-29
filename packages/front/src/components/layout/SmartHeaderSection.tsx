import React, { useEffect, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import HeaderSection, { HeaderSectionVariant, HeaderSectionAlign } from './HeaderSection';
import { cn } from '@thaiakha/shared/lib/utils';

export interface SmartHeaderSectionProps {
  sectionId: string;
  variant?: HeaderSectionVariant;
  align?: HeaderSectionAlign;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackDescription?: string;
  fallbackHighlight?: string;
  fallbackTag?: string;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideDivider?: boolean;
  hideDescription?: boolean;
}

interface PageSectionData {
  section_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  highlight?: string;
  tag_badge?: string;
}

/**
 * SmartHeaderSection
 * Fetches header content dynamically from the page_sections table in Supabase.
 * Renders an elegant skeleton loader while fetching.
 * Seamlessly passes fetched data to the core HeaderSection layout component. 
 */
export const SmartHeaderSection: React.FC<SmartHeaderSectionProps> = ({
  sectionId,
  variant = 'section',
  align = 'center',
  className,
  gradientFrom = 'primary',
  gradientTo = 'action',
  fallbackTitle,
  fallbackSubtitle,
  fallbackDescription,
  fallbackHighlight,
  fallbackTag,
  hideTitle,
  hideSubtitle,
  hideDivider,
  hideDescription,
}) => {
  const [data, setData] = useState<PageSectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionContent = async () => {
      try {
        setLoading(true);
        const { data: sectionData, error } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_id', sectionId)
          .single();

        if (error) throw error;
        if (sectionData) setData(sectionData);
      } catch (err) {
        console.error(`SmartHeaderSection fetch error [${sectionId}]:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionContent();
  }, [sectionId]);

  const alignmentClasses = {
    left: 'items-start text-left flex-col',
    center: 'items-center text-center flex-col',
    right: 'items-end text-right flex-col',
  }[align];

  // SKELETON LOADER - Progettato per occupare lo stesso spazio dell'HeaderSection
  if (loading) {
    return (
      <div className={cn("w-full mx-auto flex gap-3 animate-pulse opacity-70 py-4", alignmentClasses, className)}>
        {!hideSubtitle && (
          <div className="h-6 w-24 bg-surface-2 rounded-full mb-1"></div>
        )}

        {!hideTitle && (
          <div className={cn(
            "bg-surface-2 rounded-lg w-3/4 max-w-lg mb-2",
            variant === 'hero' ? "h-12 md:h-16" : "h-10 md:h-12"
          )}></div>
        )}

        {!hideDivider && (
          <div className="mt-1 mb-2 md:mt-3 md:mb-5 h-1 w-16 bg-surface-2 rounded-full"></div>
        )}

        {!hideDescription && (
          <div className="space-y-2 w-full max-w-2xl flex flex-col items-center">
            <div className="h-4 bg-surface-2 rounded w-full"></div>
            <div className="h-4 bg-surface-2 rounded w-5/6"></div>
          </div>
        )}
      </div>
    );
  }

  // FALLBACK - Nel caso in cui il record in DB non esista
  if (!data) {
    return (
      <HeaderSection
        title={fallbackTitle || sectionId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        subtitle={fallbackSubtitle}
        description={fallbackDescription}
        highlight={fallbackHighlight}
        tag={fallbackTag}
        variant={variant}
        align={align}
        className={className}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        hideTitle={hideTitle}
        hideSubtitle={hideSubtitle}
        hideDivider={hideDivider}
        hideDescription={hideDescription}
      />
    );
  }

  // RENDER REALE - Passa i dati testuali dal DB al componente visivo
  return (
    <HeaderSection
      title={data.title}
      subtitle={data.subtitle}
      description={data.description}
      highlight={data.highlight}
      tag={data.tag_badge}
      variant={variant}
      align={align}
      className={className}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      hideTitle={hideTitle}
      hideSubtitle={hideSubtitle}
      hideDivider={hideDivider}
      hideDescription={hideDescription}
    />
  );
};

export default SmartHeaderSection;
