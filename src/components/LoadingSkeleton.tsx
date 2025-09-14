'use client';

import React from 'react';

// Product card skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-black border border-white/20 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-800"></div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="h-5 bg-gray-800 rounded mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-800 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-800 rounded mb-4"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-800 rounded w-16"></div>
          <div className="h-8 bg-gray-800 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

// Product grid skeleton
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Page skeleton
export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-800 rounded animate-pulse"></div>
              <div className="hidden md:block">
                <div className="h-6 bg-gray-800 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-800 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="pt-20 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search skeleton */}
          <div className="flex justify-center mb-8">
            <div className="w-80 h-12 bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Category filters skeleton */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 bg-gray-800 rounded-full w-24 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Products skeleton */}
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
};

// Made-to-order page skeleton
export const MadeToOrderSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-800 rounded animate-pulse"></div>
              <div className="hidden md:block">
                <div className="h-6 bg-gray-800 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-800 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Return home button skeleton */}
      <div className="pt-20 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-12 bg-gray-800 rounded-lg w-40 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search skeleton */}
          <div className="flex justify-center mb-8">
            <div className="w-80 h-12 bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Products skeleton */}
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
};