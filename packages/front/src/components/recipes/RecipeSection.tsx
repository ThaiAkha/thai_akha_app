import React from 'react';
import SmartHeaderSection from '../layout/SmartHeaderSection';
import { useRecipeSingleSections } from '../../hooks/useRecipeSingleSections';
import type { RecipeSingleSectionId } from '../../hooks/useRecipeSingleSections';

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
  const { sections } = useRecipeSingleSections();

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
