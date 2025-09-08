'use client';

interface LoadingSkeletonProps {
  type?: 'product' | 'text' | 'image' | 'button' | 'hero' | 'feature' | 'mobile-product';
  className?: string;
}

export default function LoadingSkeleton({ type = 'text', className = '' }: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] rounded';
  
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

// Advanced Loading Spinner
export function LoadingSpinner({ size = 'md', text = 'Loading...' }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-white`}></div>
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
}

// Data Loading Animation
export function DataLoadingAnimation({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="space-y-2">
          <p className="text-white font-medium">{message}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cache Loading Animation
export function CacheLoadingAnimation({ cacheType = 'products' }: { cacheType?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <div className="text-center space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Cache Active</span>
        </div>
        <p className="text-gray-400 text-xs">Loading {cacheType} from cache...</p>
        <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Network Loading Animation
export function NetworkLoadingAnimation({ operation = 'fetching' }: { operation?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <div className="text-center space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-400 text-sm font-medium">Network</span>
        </div>
        <p className="text-gray-400 text-xs">{operation} data from server...</p>
        <div className="flex space-x-1 justify-center">
          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
}
