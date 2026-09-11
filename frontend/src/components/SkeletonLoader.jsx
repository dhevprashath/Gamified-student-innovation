import React from 'react';

export const AIAdvisorSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-white border border-[#E5E3DD] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="w-24 h-3 bg-[#E5E3DD] rounded-md skeleton-shimmer" />
          <div className="w-48 h-6 bg-[#E5E3DD] rounded-lg skeleton-shimmer" />
        </div>
        <div className="w-20 h-10 bg-[#E5E3DD] rounded-xl skeleton-shimmer" />
      </div>
      <div className="w-full h-12 bg-[#E5EEE9]/60 rounded-xl skeleton-shimmer" />
    </div>

    <div className="bg-white border border-[#E5E3DD] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="w-36 h-4 bg-[#E5E3DD] rounded skeleton-shimmer" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="w-24 h-3 bg-[#E5E3DD] rounded skeleton-shimmer" />
              <div className="w-8 h-3 bg-[#E5E3DD] rounded skeleton-shimmer" />
            </div>
            <div className="w-full h-2.5 bg-[#E5E3DD] rounded-full skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ResearchGapSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-white border border-[#E5E3DD] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="w-40 h-4 bg-[#E5E3DD] rounded skeleton-shimmer" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 bg-[#F7F6F2] border border-[#E5E3DD] rounded-xl space-y-2">
          <div className="w-32 h-3 bg-[#E5E3DD] rounded skeleton-shimmer" />
          <div className="w-full h-4 bg-[#E5E3DD] rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  </div>
);

export const ReadinessSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-white border border-[#E5E3DD] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-48 h-6 bg-[#E5E3DD] rounded-lg skeleton-shimmer" />
        <div className="w-20 h-20 bg-[#E5EEE9] rounded-full skeleton-shimmer" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-full h-12 bg-[#F7F6F2] rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  </div>
);
