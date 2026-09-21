import React from 'react';

export const AIAdvisorSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="w-24 h-3 bg-border rounded-md skeleton-shimmer" />
          <div className="w-48 h-6 bg-border rounded-lg skeleton-shimmer" />
        </div>
        <div className="w-20 h-10 bg-border rounded-xl skeleton-shimmer" />
      </div>
      <div className="w-full h-12 bg-primary-soft/30 rounded-xl skeleton-shimmer" />
    </div>

    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="w-36 h-4 bg-border rounded skeleton-shimmer" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="w-24 h-3 bg-border rounded skeleton-shimmer" />
              <div className="w-8 h-3 bg-border rounded skeleton-shimmer" />
            </div>
            <div className="w-full h-2.5 bg-border rounded-full skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ResearchGapSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="w-40 h-4 bg-border rounded skeleton-shimmer" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 bg-bg border border-border rounded-xl space-y-2">
          <div className="w-32 h-3 bg-border rounded skeleton-shimmer" />
          <div className="w-full h-4 bg-border rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  </div>
);

export const JourneySkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-2xl p-4 space-y-3 skeleton-shimmer">
          <div className="w-16 h-3 bg-border rounded" />
          <div className="w-14 h-6 bg-border rounded-lg" />
        </div>
      ))}
    </div>

    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="w-48 h-3 bg-border rounded skeleton-shimmer" />
      <div className="w-full h-2.5 bg-border rounded-full skeleton-shimmer" />
    </div>

    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-3">
      <div className="w-40 h-4 bg-border rounded skeleton-shimmer" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-20 bg-border rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>

    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="w-52 h-4 bg-border rounded skeleton-shimmer" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full h-14 bg-bg border border-border rounded-xl skeleton-shimmer" />
      ))}
    </div>
  </div>
);

export const ReadinessSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-48 h-6 bg-border rounded-lg skeleton-shimmer" />
        <div className="w-20 h-20 bg-primary-soft/40 rounded-full skeleton-shimmer" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-full h-12 bg-bg rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  </div>
);
