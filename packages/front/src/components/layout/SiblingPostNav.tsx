import React from 'react';
import { SiblingCardPost, SiblingPost } from '../ui/card/SiblingCardPost';
import { SiblingSection } from './SiblingSection';
import AkhaThemedLine from '../divider/AkhaThemedLine';
import type { AkhaTheme } from '../divider/AkhaPixelPattern';

interface SiblingPostNavProps {
  /** Item già mappati a SiblingPost dalla pagina (title/subtitle/imageUrl/href/slug). */
  previous?: SiblingPost | null;
  next?: SiblingPost | null;
  /** sectionId per l'header del blocco (page_sections DB). */
  sectionId: string;
  dividerTheme?: AkhaTheme;
  /** Apertura del sibling (slug già canonico). */
  onOpen: (slug: string) => void;
}

/**
 * SiblingPostNav — blocco di chiusura prev/next condiviso dalle pagine single
 * (History / News / Ingredient / Recipe): divider tematizzato + 2 card,
 * al tier --container-section come FaqBottomPage. La pagina mappa i propri
 * dati a SiblingPost e passa l'handler; qui vive solo il layout.
 */
export const SiblingPostNav: React.FC<SiblingPostNavProps> = ({
  previous,
  next,
  sectionId,
  dividerTheme = 'akha',
  onOpen,
}) => {
  if (!previous && !next) return null;

  return (
    <>
      <div className="w-full max-w-[var(--container-section)] mx-auto">
        <AkhaThemedLine theme={dividerTheme} className="[padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-xs)]" />
      </div>
      <div className="w-full max-w-[var(--container-section)] mx-auto [padding-bottom:var(--space-fluid-xl)]">
        <SiblingSection sectionId={sectionId}>
          {previous && (
            <SiblingCardPost item={previous} direction="prev" onClick={() => onOpen(previous.slug)} />
          )}
          {next && (
            <SiblingCardPost item={next} direction="next" onClick={() => onOpen(next.slug)} />
          )}
        </SiblingSection>
      </div>
    </>
  );
};

export default SiblingPostNav;
