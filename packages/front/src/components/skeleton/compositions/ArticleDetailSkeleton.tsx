import React from 'react';
import { SkeletonBase } from '../atoms';

export const ArticleDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Hero Image Skeleton */}
      <SkeletonBase className="w-full aspect-[16/9] rounded-[2.5rem]" />
      
      {/* Interaction Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto w-full">
         <SkeletonBase className="h-14 w-full md:w-64 rounded-full" />
         <SkeletonBase className="h-14 w-full md:w-32 rounded-full" />
      </div>

      {/* Quote/Metadata Skeleton */}
      <div className="max-w-2xl mx-auto space-y-4">
        <SkeletonBase className="h-20 w-full rounded-2xl" />
      </div>

      {/* Content Blocks Skeleton */}
      <div className="max-w-3xl mx-auto space-y-8 pt-4">
        {[800, 600, 700].map((h, i) => (
          <div key={i} className="space-y-4">
            <SkeletonBase className="h-6 w-3/4 rounded-full" />
            <SkeletonBase className="h-4 w-full rounded-full" />
            <SkeletonBase className="h-4 w-full rounded-full" />
            <SkeletonBase className="h-4 w-5/6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleDetailSkeleton;
