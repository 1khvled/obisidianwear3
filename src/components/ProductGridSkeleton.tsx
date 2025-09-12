'use client';

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
          <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-16 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-8 bg-gray-700 rounded-lg w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded-lg w-full animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded-lg w-2/3 animate-pulse"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-12 bg-gray-700 rounded-full w-48 animate-pulse"></div>
              <div className="h-12 bg-gray-700 rounded-full w-40 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Skeleton */}
          <div className="relative">
            <div className="w-full h-96 lg:h-[500px] bg-gray-700 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-700"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        <div className="h-10 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
