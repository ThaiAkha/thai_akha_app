import React from 'react';
import { SkeletonBase } from '../atoms';

/**
 * HomeGridSkeleton
 *
 * Skeleton per la griglia Explore della Home Page.
 * Riproduce il layout della vera griglia: 3 card top (md:col-span-2) + 2 card bottom (md:col-span-3).
 * Usato durante il fetch di useFrontHomeCards.
 */
export const HomeGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-6 [gap:var(--space-fluid-m)]">
    {/* Row 1 — 3 card verticali */}
    {[0, 1, 2].map((i) => (
      <div key={i} className="col-span-1 md:col-span-2">
        <SkeletonBase className="aspect-[3/4] w-full" />
      </div>
    ))}
    {/* Row 2 — 2 card orizzontali */}
    {[3, 4].map((i) => (
      <div key={i} className="col-span-2 md:col-span-3">
        <SkeletonBase className="aspect-video w-full" />
      </div>
    ))}
  </div>
);

export default HomeGridSkeleton;
