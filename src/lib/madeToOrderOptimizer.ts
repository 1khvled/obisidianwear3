// Fast cache specifically for made-to-order page
interface MadeToOrderCache {
  products: any[];
  timestamp: number;
}

const CACHE_KEY = 'mto_fast_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const madeToOrderOptimizer = {
  // Get cached products if fresh
  getCachedProducts(): any[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: MadeToOrderCache = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data.products;
    } catch {
      return null;
    }
  },

  // Cache products
  cacheProducts(products: any[]): void {
    try {
      const data: MadeToOrderCache = {
        products,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota exceeded, clear old cache
      localStorage.removeItem(CACHE_KEY);
    }
  },

  // Fetch products with caching
  async fetchProducts(): Promise<any[]> {
    // Try cache first
    const cached = this.getCachedProducts();
    if (cached) {
      console.log('✅ Using cached made-to-order products');
      return cached;
    }

    // Fetch fresh data
    console.log('🔄 Fetching fresh made-to-order products');
    const response = await fetch('/api/made-to-order');
    const products = await response.json();
    
    // Cache the result
    this.cacheProducts(products);
    
    return products;
  }
};

