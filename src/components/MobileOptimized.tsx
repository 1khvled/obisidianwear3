'use client';

import { useEffect, useState } from 'react';

interface MobileOptimizedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function MobileOptimized({ children, fallback }: MobileOptimizedProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsLoaded(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isLoaded) {
    return fallback || <div className="animate-pulse bg-gray-800 rounded-lg h-64" />;
  }

  return <>{children}</>;
}

// Mobile-specific touch optimizations
export function useMobileOptimizations() {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Handle swipe
      return { isLeftSwipe, isRightSwipe };
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
