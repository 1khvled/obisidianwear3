'use client';

import { useEffect, useState, useCallback } from 'react';

interface MobilePreloadState {
  isPreloading: boolean;
  isPreloaded: boolean;
  preloadProgress: number;
  isMobile: boolean;
  connectionType: 'slow' | 'fast' | 'unknown';
}

export function useMobileOptimizedPreload() {
  const [state, setState] = useState<MobilePreloadState>({
    isPreloading: false,
    isPreloaded: false,
    preloadProgress: 0,
    isMobile: false,
    connectionType: 'unknown'
  });

  // Detect mobile device
  const detectMobile = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
    return isMobile;
  }, []);

  // Detect connection type
  const detectConnection = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      } else if (effectiveType === '3g' || effectiveType === '4g') {
        return 'fast';
      }
    }
    return 'unknown';
  }, []);

  // Optimized preload for mobile
  const startMobilePreload = useCallback(async () => {
    const isMobile = detectMobile();
    const connectionType = detectConnection();
    
    setState(prev => ({ 
      ...prev, 
      isMobile, 
      connectionType,
      isPreloading: true,
      preloadProgress: 0
    }));

    try {
      // For slow connections, only preload essential data
      if (connectionType === 'slow') {
        setState(prev => ({ ...prev, preloadProgress: 50 }));
        
        // Only prefetch routes, no data preloading
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = '/made-to-order';
        document.head.appendChild(link);
        
        setState(prev => ({ 
          ...prev, 
          isPreloading: false, 
          isPreloaded: true, 
          preloadProgress: 100 
        }));
        return;
      }

      // For fast connections, do full preload
      setState(prev => ({ ...prev, preloadProgress: 20 }));
      
      // Prefetch routes
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/made-to-order';
      document.head.appendChild(link);

      setState(prev => ({ ...prev, preloadProgress: 40 }));
      
      // Preload API data with mobile-optimized request
      const response = await fetch('/api/made-to-order', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      setState(prev => ({ ...prev, preloadProgress: 70 }));
      
      // Cache data with mobile-optimized storage
      const cacheData = {
        data: data.slice(0, 10), // Only cache first 10 items for mobile
        timestamp: Date.now(),
        version: '1.0-mobile'
      };
      
      sessionStorage.setItem('madeToOrderCacheMobile', JSON.stringify(cacheData));

      setState(prev => ({ ...prev, preloadProgress: 90 }));
      
      // For mobile, only preload first 3 images
      if (data.length > 0) {
        const imagePromises = data.slice(0, 3).map((product: any) => {
          const imageSrc = product.image || product.images?.[0];
          if (imageSrc) {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = imageSrc;
              // Set loading priority for mobile
              img.loading = 'lazy';
            });
          }
          return Promise.resolve();
        });

        await Promise.allSettled(imagePromises);
      }

      setState(prev => ({ 
        ...prev, 
        isPreloading: false, 
        isPreloaded: true, 
        preloadProgress: 100 
      }));

    } catch (error) {
      console.error('Mobile preload failed:', error);
      setState(prev => ({ 
        ...prev, 
        isPreloading: false, 
        error: error instanceof Error ? error.message : 'Preload failed'
      }));
    }
  }, [detectMobile, detectConnection]);

  // Schedule preload with mobile-optimized delay
  const scheduleMobilePreload = useCallback((delay: number = 5000) => {
    const isMobile = detectMobile();
    const connectionType = detectConnection();
    
    // Adjust delay based on device and connection
    let adjustedDelay = delay;
    if (isMobile && connectionType === 'slow') {
      adjustedDelay = delay * 2; // Longer delay for slow mobile connections
    } else if (isMobile && connectionType === 'fast') {
      adjustedDelay = delay * 0.5; // Shorter delay for fast mobile connections
    }

    setTimeout(() => {
      startMobilePreload();
    }, adjustedDelay);
  }, [startMobilePreload, detectMobile, detectConnection]);

  return {
    ...state,
    startMobilePreload,
    scheduleMobilePreload
  };
}
