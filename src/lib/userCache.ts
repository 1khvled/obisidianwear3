interface CacheData {
  products: any[];
  timestamp: number;
  expiresAt: number;
}

interface AllUserDataCache {
  products: any[];
  madeToOrderProducts: any[];
  wilayaTariffs: any[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
const CACHE_KEY = 'user_products_cache';
const ALL_USER_DATA_CACHE_KEY = 'user_all_data_cache';

export const userCache = {
  // Get cached data if it exists and hasn't expired
  getProducts(): any[] | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache has expired
      if (now > data.expiresAt) {
        console.log('🕐 User cache expired, clearing...');
        this.clearCache();
        return null;
      }
      
      console.log('✅ Using cached user data (expires in', Math.round((data.expiresAt - now) / 1000), 'seconds)');
      console.log('📊 Cache contains', data.products.length, 'products');
      return data.products;
    } catch (error) {
      console.error('❌ Error reading user cache:', error);
      this.clearCache();
      return null;
    }
  },

  // Set cached data with 1-minute expiration
  setProducts(products: any[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const cacheData: CacheData = {
        products,
        timestamp: now,
        expiresAt: now + CACHE_DURATION
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 User data cached for 1 minute (', products.length, 'products)');
    } catch (error) {
      console.error('❌ Error setting user cache:', error);
    }
  },

  // Clear the cache
  clearCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('🗑️ User cache cleared');
    } catch (error) {
      console.error('❌ Error clearing user cache:', error);
    }
  },

  // Check if cache exists and is valid
  hasValidCache(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;
      
      const data: CacheData = JSON.parse(cached);
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
      
      const data: CacheData = JSON.parse(cached);
      const remaining = Math.max(0, data.expiresAt - Date.now());
      return Math.round(remaining / 1000);
    } catch (error) {
      return 0;
    }
  },

  // New methods for all user data caching
  getAllUserData(): AllUserDataCache | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(ALL_USER_DATA_CACHE_KEY);
      if (!cached) return null;
      
      const data: AllUserDataCache = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache has expired
      if (now > data.expiresAt) {
        console.log('🕐 All user data cache expired, clearing...');
        this.clearAllUserDataCache();
        return null;
      }
      
      console.log('✅ Using cached all user data (expires in', Math.round((data.expiresAt - now) / 1000), 'seconds)');
      console.log('📊 Cache contains', data.products.length, 'products,', data.madeToOrderProducts.length, 'made-to-order products,', data.wilayaTariffs.length, 'wilayas');
      return data;
    } catch (error) {
      console.error('❌ Error reading all user data cache:', error);
      this.clearAllUserDataCache();
      return null;
    }
  },

  setAllUserData(data: { products: any[]; madeToOrderProducts: any[]; wilayaTariffs: any[] }): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const cacheData: AllUserDataCache = {
        products: data.products,
        madeToOrderProducts: data.madeToOrderProducts,
        wilayaTariffs: data.wilayaTariffs,
        timestamp: now,
        expiresAt: now + CACHE_DURATION
      };
      
      const jsonString = JSON.stringify(cacheData);
      const dataSize = new Blob([jsonString]).size;
      const dataSizeKB = Math.round(dataSize / 1024);
      
      console.log(`📊 Cache data size: ${dataSizeKB}KB (${data.products.length} products, ${data.madeToOrderProducts.length} made-to-order products, ${data.wilayaTariffs.length} wilayas)`);
      
      // Check if data is too large (>4MB)
      if (dataSize > 4 * 1024 * 1024) {
        console.warn('⚠️ Data too large for localStorage, using individual caches instead');
        this.setProducts(data.products);
        return;
      }
      
      localStorage.setItem(ALL_USER_DATA_CACHE_KEY, jsonString);
      console.log('💾 All user data cached for 1 minute');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage quota exceeded, falling back to individual caches');
        // Fallback to individual caches
        this.setProducts(data.products);
      } else {
        console.error('❌ Error setting all user data cache:', error);
      }
    }
  },

  clearAllUserDataCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(ALL_USER_DATA_CACHE_KEY);
      console.log('🗑️ All user data cache cleared');
    } catch (error) {
      console.error('❌ Error clearing all user data cache:', error);
    }
  }
};
