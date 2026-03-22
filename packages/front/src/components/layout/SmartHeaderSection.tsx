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
 * 
 * Fetches header content dynamically from the `page_sections` table in Supabase.
 * Renders an elegant skeleton loader while fetching.
 * Seamlessly passes fetched data to the core `HeaderSection` layout component.
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

        if (error) {
          console.error(`Error fetching section ${sectionId}:`, error);
          return;
        }

        if (sectionData) {
          setData(sectionData as PageSectionData);
        }
      } catch (err) {
        console.error(`Unexpected error fetching section ${sectionId}:`, err);
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

  if (loading) {
    return (
      <div className={cn("w-full flex gap-4 animate-pulse opacity-70", alignmentClasses, className)}>
        {variant === 'kitchen' && (
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
        )}
        <div className={cn(
          "h-12 md:h-14 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4 max-w-lg", 
          variant === 'hero' ? "h-14 md:h-16" : ""
        )}></div>
        
        {variant !== 'kitchen' && (
          <div className="h-6 w-1/2 max-w-sm bg-gray-200 dark:bg-gray-700 rounded-md mt-2"></div>
        )}
        
        {variant === 'section' && (
          <div className="space-y-2 mt-4 w-full flex flex-col" style={{ alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
            <div className="h-4 w-2/3 max-w-2xl bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-1/2 max-w-xl bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to plain title if no data found in DB.
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
