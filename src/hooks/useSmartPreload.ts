'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PreloadState {
  isPreloading: boolean;
  isPreloaded: boolean;
  preloadProgress: number;
  error: string | null;
}

interface PreloadOptions {
  delay?: number; // Delay before starting preload (ms)
  priority?: 'high' | 'low';
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function useSmartPreload(options: PreloadOptions = {}) {
  const {
    delay = 2000, // 2 seconds delay after home page loads
    priority = 'low',
    onComplete,
    onError
  } = options;

  const router = useRouter();
  const [state, setState] = useState<PreloadState>({
    isPreloading: false,
    isPreloaded: false,
    preloadProgress: 0,
    error: null
  });

  const preloadTimeoutRef = useRef<NodeJS.Timeout>();
  const isPreloadingRef = useRef(false);

  const startPreload = useCallback(async () => {
    if (isPreloadingRef.current || state.isPreloaded) return;

    isPreloadingRef.current = true;
    setState(prev => ({ ...prev, isPreloading: true, error: null }));

    try {
      // Step 1: Preload the made-to-order page route
      setState(prev => ({ ...prev, preloadProgress: 20 }));
      
      // Use Next.js router to prefetch the route
      router.prefetch('/made-to-order');
      router.prefetch('/made-to-order-collection');
      
      // Step 2: Preload made-to-order API data
      setState(prev => ({ ...prev, preloadProgress: 40 }));
      
      const apiResponse = await fetch('/api/made-to-order', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300', // Cache for 5 minutes
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const madeToOrderData = await apiResponse.json();
      
      // Step 3: Cache the data in sessionStorage
      setState(prev => ({ ...prev, preloadProgress: 70 }));
      
      sessionStorage.setItem('madeToOrderCache', JSON.stringify({
        data: madeToOrderData,
        timestamp: Date.now(),
        version: '1.0'
      }));

      // Step 4: Preload images (low priority)
      setState(prev => ({ ...prev, preloadProgress: 90 }));
      
      if (priority === 'high' && madeToOrderData.length > 0) {
        // Preload first few product images
        const imagePromises = madeToOrderData.slice(0, 3).map((product: any) => {
          const imageSrc = product.image || product.images?.[0];
          if (imageSrc) {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve; // Don't fail on image errors
              img.src = imageSrc;
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

      onComplete?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preload failed';
      setState(prev => ({ 
        ...prev, 
        isPreloading: false, 
        error: errorMessage 
      }));
      onError?.(errorMessage);
    } finally {
      isPreloadingRef.current = false;
    }
  }, [router, priority, onComplete, onError, state.isPreloaded]);

  const schedulePreload = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(() => {
      startPreload();
    }, delay);
  }, [startPreload, delay]);

  const cancelPreload = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    setState(prev => ({ ...prev, isPreloading: false }));
    isPreloadingRef.current = false;
  }, []);

  const clearCache = useCallback(() => {
    sessionStorage.removeItem('madeToOrderCache');
    setState(prev => ({ ...prev, isPreloaded: false, preloadProgress: 0 }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startPreload,
    schedulePreload,
    cancelPreload,
    clearCache
  };
}

// Hook for getting cached made-to-order data
export function useCachedMadeToOrder() {
  const [cachedData, setCachedData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCachedData = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem('madeToOrderCache');
      if (cached) {
        const { data, timestamp, version } = JSON.parse(cached);
        
        // Check if cache is still valid (5 minutes)
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000;
        
        if (!isExpired && version === '1.0') {
          setCachedData(data);
          return data;
        }
      }
      
      // If no valid cache, fetch fresh data
      setIsLoading(true);
      const response = await fetch('/api/made-to-order');
      const data = await response.json();
      
      // Update cache
      sessionStorage.setItem('madeToOrderCache', JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      }));
      
      setCachedData(data);
      return data;
    } catch (error) {
      console.error('Error loading made-to-order data:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cachedData,
    isLoading,
    loadCachedData
  };
}
