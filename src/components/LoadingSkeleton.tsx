'use client';

interface LoadingSkeletonProps {
  type?: 'product' | 'text' | 'image' | 'button' | 'hero' | 'feature' | 'mobile-product';
  className?: string;
}

export default function LoadingSkeleton({ type = 'text', className = '' }: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-700 rounded';
  
  switch (type) {
    case 'product':
      return (
        <div className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700 ${className}`}>
          <div className={`h-48 bg-gray-700 ${baseClasses}`} />
          <div className="p-4 space-y-3">
            <div className={`h-4 bg-gray-700 ${baseClasses} w-3/4`} />
            <div className={`h-3 bg-gray-700 ${baseClasses} w-1/2`} />
            <div className={`h-6 bg-gray-700 ${baseClasses} w-1/3`} />
            <div className={`h-8 bg-gray-700 ${baseClasses} w-full`} />
          </div>
        </div>
      );
      
    case 'image':
      return (
        <div className={`bg-gray-700 ${baseClasses} ${className}`} />
      );
      
    case 'button':
      return (
        <div className={`h-10 bg-gray-700 ${baseClasses} ${className}`} />
      );
      
    case 'hero':
      return (
        <div className={`bg-black min-h-screen flex items-center justify-center ${className}`}>
          <div className="text-center space-y-6">
            <div className={`h-12 bg-gray-700 ${baseClasses} w-80 mx-auto`} />
            <div className={`h-6 bg-gray-700 ${baseClasses} w-96 mx-auto`} />
            <div className={`h-16 bg-gray-700 ${baseClasses} w-48 mx-auto`} />
          </div>
        </div>
      );
      
    case 'feature':
      return (
        <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
          <div className={`w-8 h-8 bg-gray-700 ${baseClasses} mb-3`} />
          <div className={`h-4 bg-gray-700 ${baseClasses} w-3/4 mb-2`} />
          <div className={`h-3 bg-gray-700 ${baseClasses} w-1/2`} />
        </div>
      );
      
    case 'mobile-product':
      return (
        <div className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700 ${className}`}>
          <div className={`h-40 bg-gray-700 ${baseClasses}`} />
          <div className="p-3 space-y-2">
            <div className={`h-4 bg-gray-700 ${baseClasses} w-3/4`} />
            <div className={`h-3 bg-gray-700 ${baseClasses} w-1/2`} />
            <div className={`h-6 bg-gray-700 ${baseClasses} w-1/3`} />
          </div>
        </div>
      );
      
    case 'text':
    default:
      return (
        <div className={`h-4 bg-gray-700 ${baseClasses} ${className}`} />
      );
  }
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} type="product" />
      ))}
    </div>
  );
}

// Mobile Product Grid Skeleton
export function MobileProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} type="mobile-product" />
      ))}
    </div>
  );
}

// Hero Skeleton
export function HeroSkeleton() {
  return <LoadingSkeleton type="hero" />;
}

// Feature Grid Skeleton
export function FeatureGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <LoadingSkeleton key={index} type="feature" />
      ))}
    </div>
  );
}

// Text Lines Skeleton
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton 
          key={index} 
          type="text" 
          className={index === lines - 1 ? 'w-2/3' : 'w-full'} 
        />
      ))}
    </div>
  );
}
