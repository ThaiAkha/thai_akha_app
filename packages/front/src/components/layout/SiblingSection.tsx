import React from 'react';
import SmartHeaderSection from './SmartHeaderSection';

// ─── Props ───────────────────────────────────────────────────────────────────

interface SiblingSectionProps {
  /** sectionId for SmartHeaderSection (reads title/subtitle from page_sections DB) */
  sectionId?: string;
  /** 2 card elements (SiblingCardPost or SiblingCardPage) */
  children: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SiblingSection: React.FC<SiblingSectionProps> = ({
  sectionId,
  children,
}) => (
  <div className="flex flex-col [gap:var(--space-fluid-m)]">
    {sectionId && (
      <SmartHeaderSection
        sectionId={sectionId}
        variant="section"
        align="center"
      />
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-s)]">
      {children}
    </div>
  </div>
);

export default SiblingSection;
