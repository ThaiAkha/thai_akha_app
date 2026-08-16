import React from 'react';
import { Card, Typography } from '../ui';

interface ClassInclusionsProps {
  items: string[];
}

/**
 * Two-column "what's included" split used identically by Morning & Evening:
 * left card right-aligned (dot on the right), right card left-aligned.
 * Renders nothing when there are no items.
 */
const ClassInclusions: React.FC<ClassInclusionsProps> = ({ items }) => {
  if (items.length === 0) return null;

  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-xl)]">
      {/* Left card — dot right, text right-aligned */}
      <Card variant="glass" padding="none" rounded="2xl" className="flex flex-col">
        <div className="flex flex-col" style={{ padding: 'var(--space-fluid-m)', gap: 'var(--space-fluid-s)' }}>
          {leftItems.map((item) => (
            <div key={item} className="flex items-center justify-end [gap:var(--space-fluid-xs)]">
              <Typography variant="paragraphM" color="muted" className="text-right">{item}</Typography>
              <div className="w-2 h-2 rounded-full bg-action shrink-0" />
            </div>
          ))}
        </div>
      </Card>
      {/* Right card — dot left, text left-aligned */}
      <Card variant="glass" padding="none" rounded="2xl" className="flex flex-col">
        <div className="flex flex-col" style={{ padding: 'var(--space-fluid-m)', gap: 'var(--space-fluid-s)' }}>
          {rightItems.map((item) => (
            <div key={item} className="flex items-center [gap:var(--space-fluid-xs)]">
              <div className="w-2 h-2 rounded-full bg-action shrink-0" />
              <Typography variant="paragraphM" color="muted">{item}</Typography>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ClassInclusions;
