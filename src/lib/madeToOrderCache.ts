import { MadeToOrderProduct } from '@/types';

interface MadeToOrderCache {
  products: MadeToOrderProduct[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for made-to-order products
const CACHE_KEY = 'mto_products_cache';

export const madeToOrderCache = {
  // Get cached made-to-order products if they exist and haven't expired
  getProducts(): MadeToOrderProduct[] | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: MadeToOrderCache = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache has expired
      if (now > data.expiresAt) {
        this.clearCache();
        return null;
      }
      
      return data.products;
    } catch (error) {
      console.error('Error reading made-to-order cache:', error);
      this.clearCache();
      return null;
    }
  },

  // Set cached made-to-order products with 15-minute expiration
  setProducts(products: MadeToOrderProduct[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const cacheData: MadeToOrderCache = {
        products,
        timestamp: now,
        expiresAt: now + CACHE_DURATION
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting made-to-order cache:', error);
    }
  },

  // Clear the cache
  clearCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing made-to-order cache:', error);
    }
  },

  // Check if cache exists and is valid
  hasValidCache(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;
      
      const data: MadeToOrderCache = JSON.parse(cached);
      return Date.now() <= data.expiresAt;
    } catch (error) {
      return false;
    }
  },

  // Get time until cache expires (in seconds)
  getTimeUntilExpiry(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return 0;
      
      const data: MadeToOrderCache = JSON.parse(cached);
      const remaining = Math.max(0, data.expiresAt - Date.now());
      return Math.round(remaining / 1000);
    } catch (error) {
      return 0;
    }
  }
};
