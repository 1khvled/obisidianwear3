// Advanced caching system for better performance

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items in cache

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }
}

// Create singleton instance
export const cache = new CacheManager();

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  MADE_TO_ORDER_PRODUCTS: 'made_to_order_products',
  ORDERS: 'orders',
  WILAYA_TARIFFS: 'wilaya_tariffs',
  CUSTOMERS: 'customers'
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS: 2 * 60 * 1000, // 2 minutes
  MADE_TO_ORDER_PRODUCTS: 5 * 60 * 1000, // 5 minutes
  ORDERS: 1 * 60 * 1000, // 1 minute
  WILAYA_TARIFFS: 30 * 60 * 1000, // 30 minutes
  CUSTOMERS: 5 * 60 * 1000 // 5 minutes
} as const;

// Utility functions
export const getCachedData = <T>(key: string): T | null => {
  return cache.get<T>(key);
};

export const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
  cache.set(key, data, ttl);
};

export const invalidateCache = (key: string): void => {
  cache.delete(key);
};

export const clearAllCache = (): void => {
  cache.clear();
};

// React hook for cache management
export const useCache = () => {
  return {
    get: getCachedData,
    set: setCachedData,
    invalidate: invalidateCache,
    clear: clearAllCache,
    stats: cache.getStats()
  };
};
