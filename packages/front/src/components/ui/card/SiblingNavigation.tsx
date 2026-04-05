import React from 'react';
import { Typography, Button } from '../index';
import { SiblingCard, SiblingItem } from './SiblingCard';
import { HISTORY_UI } from '@thaiakha/shared/data';

// ─── Props ───────────────────────────────────────────────────────────────────

interface SiblingNavigationProps {
  previous?: SiblingItem | null;
  next?: SiblingItem | null;
  onPrev: (slug: string) => void;
  onNext: (slug: string) => void;
  onBack: () => void;
  /** Override copy — defaults from HISTORY_UI */
  title?: string;
  backLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Full sibling navigation block: section title + prev/next cards + back button.
 * Reusable for History, Recipes, Ingredients.
 */
const SiblingNavigation: React.FC<SiblingNavigationProps> = ({
  previous,
  next,
  onPrev,
  onNext,
  onBack,
  title = HISTORY_UI.siblingNav.title,
  backLabel = HISTORY_UI.siblingNav.backButton,
  prevLabel = HISTORY_UI.siblingNav.prev,
  nextLabel = HISTORY_UI.siblingNav.next,
}) => (
  <div className="flex flex-col [gap:var(--space-fluid-m)]">

    {(previous || next) && (
      <div className="flex flex-col [gap:var(--space-fluid-xs)]">
        <Typography
          variant="microLabel"
          color="muted"
          className="text-center tracking-widest uppercase"
        >
          {title}
        </Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-s)]">
          {previous && (
            <SiblingCard
              section={previous}
              direction="prev"
              prevLabel={prevLabel}
              nextLabel={nextLabel}
              onClick={() => onPrev(previous.slug)}
            />
          )}
          {next && (
            <SiblingCard
              section={next}
              direction="next"
              prevLabel={prevLabel}
              nextLabel={nextLabel}
              onClick={() => onNext(next.slug)}
            />
          )}
        </div>
      </div>
    )}

    <div className="flex justify-center [padding-top:var(--space-fluid-s)] [padding-bottom:var(--space-fluid-xs)]">
      <Button
        variant="primary"
        size="md"
        icon="arrow-left"
        iconPosition="left"
        onClick={onBack}
      >
        {backLabel}
      </Button>
    </div>

  </div>
);

export default SiblingNavigation;
