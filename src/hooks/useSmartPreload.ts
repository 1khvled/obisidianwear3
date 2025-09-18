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

// Smart caching - cache prices, keep stock real-time
const removeSensitiveData = (data: any, endpoint: string) => {
  if (endpoint.includes('products') || endpoint.includes('made-to-order')) {
    // Cache everything EXCEPT stock (prices are stable, stock changes frequently)
    return data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      category: product.category,
      price: product.price, // CACHE PRICES - they don't change often
      // NO STOCK - always fetch real-time for accuracy
    }));
  }
  
  if (endpoint.includes('wilaya')) {
    // Wilaya data is safe to cache
    return data;
  }
  
  // Default: return data as-is for safe endpoints
  return data;
};

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
      // Step 1: Preload ALL routes (except admin)
      setState(prev => ({ ...prev, preloadProgress: 10 }));
      
      const routesToPrefetch = [
        '/made-to-order',
        '/made-to-order-collection',
        '/cart',
        '/checkout', 
        '/contact',
        '/about',
        '/product'
        // Admin routes are EXCLUDED - users can't access them
      ];
      
      routesToPrefetch.forEach(route => {
        router.prefetch(route);
      });
      
      // Step 2: Preload ALL API data (except admin APIs)
      setState(prev => ({ ...prev, preloadProgress: 30 }));
      
      const apiEndpoints = [
        '/api/made-to-order',
        '/api/products',
        '/api/wilaya'
        // NO INVENTORY - always fetch real-time stock
        // NO ORDERS/CUSTOMERS - sensitive data
        // Admin APIs are EXCLUDED - users can't access them
      ];
      
      const apiPromises = apiEndpoints.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Cache-Control': 'max-age=300', // Cache for 5 minutes
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove sensitive data before caching
        const safeData = removeSensitiveData(data, endpoint);
        
        // Cache safe data only
        sessionStorage.setItem(`${endpoint.replace('/api/', '')}Cache`, JSON.stringify({
          data: safeData,
          timestamp: Date.now(),
          version: '1.0-safe'
        }));
        
        return data;
      });

      const allApiData = await Promise.allSettled(apiPromises);
      
      // Step 3: Preload ALL images from all products
      setState(prev => ({ ...prev, preloadProgress: 70 }));
      
      const allProducts = allApiData
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as any).value)
        .filter(item => item && (item.image || item.images));

      if (allProducts.length > 0) {
        // Preload ALL images - no limits
        const imagePromises = allProducts.map((product: any) => {
          const images = product.images || [product.image];
          return images.map((imageSrc: string) => {
            if (imageSrc) {
              return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Don't fail on image errors
                img.src = imageSrc;
                img.loading = 'eager'; // High priority loading
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
