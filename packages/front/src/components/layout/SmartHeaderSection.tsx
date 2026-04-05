import React, { useEffect, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import HeaderSection, { HeaderSectionVariant, HeaderSectionAlign } from './HeaderSection';
import { SkeletonHeader } from '../skeleton';

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
  hideTag?: boolean;
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
  hideTag = false,
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

  if (loading) {
    return (
      <SkeletonHeader
        variant={variant === 'history' || variant === 'kitchen' ? 'sub' : variant}
        align={align}
        hideTitle={hideTitle}
        hideSubtitle={hideSubtitle}
        hideDivider={hideDivider}
        hideDescription={hideDescription}
        className={className}
      />
    );
  }

  // Se non c'è dato nel DB, usiamo i fallback
  const title = data?.title || fallbackTitle || sectionId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subtitle = data?.subtitle || fallbackSubtitle;
  const description = data?.description || fallbackDescription;
  const highlight = data?.highlight || fallbackHighlight;
  const tag = data?.tag_badge || fallbackTag;

  return (
    <HeaderSection
      title={title}
      subtitle={subtitle}
      description={description}
      highlight={highlight}
      tag={tag}
      variant={variant}
      align={align}
      className={className}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      hideTitle={hideTitle}
      hideSubtitle={hideSubtitle}
      hideDivider={hideDivider}
      hideDescription={hideDescription}
      hideTag={hideTag}
    />
  );
};

export default SmartHeaderSection;
