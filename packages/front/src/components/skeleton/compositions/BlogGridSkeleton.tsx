import React from 'react';
import { SkeletonBase } from '../atoms';

export const BlogGridSkeleton: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Featured Card Skeleton */}
      <SkeletonBase className="w-full aspect-[16/7] rounded-[2.5rem]" />
      
      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[2rem] border border-border bg-surface overflow-hidden">
            <SkeletonBase className="aspect-video w-full rounded-none" variant="rectangular" />
            <div className="p-5 md:p-6 space-y-3">
              <SkeletonBase className="h-5 w-3/4 rounded-full" />
              <SkeletonBase className="h-4 w-full rounded-full" />
              <SkeletonBase className="h-4 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogGridSkeleton;
