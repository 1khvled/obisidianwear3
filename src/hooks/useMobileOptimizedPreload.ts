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

      // Full preload for mobile - same as desktop!
      setState(prev => ({ ...prev, preloadProgress: 20 }));
      
      // Prefetch all routes (except admin)
      const routesToPrefetch = [
        '/made-to-order',
        '/made-to-order-collection', 
        '/cart',
        '/checkout',
        '/contact',
        '/about',
        '/product'
      ];
      
      routesToPrefetch.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });

      setState(prev => ({ ...prev, preloadProgress: 40 }));
      
      // Preload ALL API data - same as desktop
      const apiEndpoints = [
        '/api/made-to-order',
        '/api/products',
        '/api/inventory',
        '/api/wilaya'
      ];
      
      const apiPromises = apiEndpoints.map(async (endpoint) => {
        const response = await fetch(endpoint, {
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
        
        // Cache ALL data - no limits for mobile
        const cacheData = {
          data: data, // Full data, not sliced
          timestamp: Date.now(),
          version: '1.0-full'
        };
        
        sessionStorage.setItem(`${endpoint.replace('/api/', '')}Cache`, JSON.stringify(cacheData));
        return data;
      });

      const allApiData = await Promise.allSettled(apiPromises);
      
      setState(prev => ({ ...prev, preloadProgress: 70 }));
      
      // Preload ALL images - same as desktop
      const allProducts = allApiData
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as any).value)
        .filter(item => item && (item.image || item.images));

      if (allProducts.length > 0) {
        const imagePromises = allProducts.map((product: any) => {
          const images = product.images || [product.image];
          return images.map((imageSrc: string) => {
            if (imageSrc) {
              return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = imageSrc;
                // High priority loading for mobile too
                img.loading = 'eager';
              });
            }
            return Promise.resolve();
          });
        }).flat();

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
