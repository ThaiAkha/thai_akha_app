import React from 'react';
import SmartHeaderSection from '../layout/SmartHeaderSection';
import { usePageSections, RECIPE_SINGLE_SECTION_IDS } from '../../hooks/usePageSections';
import type { RecipeSingleSectionId } from '../../hooks/usePageSections';

interface RecipeSectionProps {
  sectionId: RecipeSingleSectionId;
  children: React.ReactNode;
  hideDivider?: boolean;
  hideSubtitle?: boolean;
  className?: string;
}

const RecipeSection: React.FC<RecipeSectionProps> = ({
  sectionId,
  children,
  hideDivider = false,
  hideSubtitle = true,
  className,
}) => {
  const { sections } = usePageSections(RECIPE_SINGLE_SECTION_IDS);

  return (
    <section className={className ? className : undefined}>
      <SmartHeaderSection
        sectionId={sectionId}
        prefetchedData={sections[sectionId]}
        variant="kitchen"
        align="center"
        dividerTheme="kitchen"
        hideDivider={hideDivider}
        hideSubtitle={hideSubtitle}
        hideTag
        className="[margin-bottom:var(--space-fluid-m)]"
      />
      {children}
    </section>
  );
};

export default RecipeSection;
