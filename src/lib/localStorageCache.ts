'use client';

import { Product, Order, Customer } from '@/types';

interface CacheData {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  madeToOrderProducts: any[];
  wilayaTariffs: any[];
  lastUpdated: number;
  version: string;
}

class LocalStorageCache {
  private readonly CACHE_KEY = 'obsidian-cache';
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Check if cache exists and is valid
  isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const data: CacheData = JSON.parse(cached);
      
      // Check version
      if (data.version !== this.CACHE_VERSION) {
        console.log('🔄 Cache version mismatch, invalidating cache');
        return false;
      }

      // Check age
      const age = Date.now() - data.lastUpdated;
      if (age > this.CACHE_DURATION) {
        console.log('🔄 Cache expired, invalidating cache');
        return false;
      }

      console.log('✅ Cache is valid, age:', Math.round(age / 1000 / 60), 'minutes');
      return true;
    } catch (error) {
      console.error('❌ Error checking cache validity:', error);
      return false;
    }
  }

  // Get cached data
  getCache(): CacheData | null {
    try {
      if (!this.isCacheValid()) return null;

      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      console.log('📦 Retrieved from cache:', {
        products: data.products.length,
        orders: data.orders.length,
        customers: data.customers.length,
        madeToOrderProducts: data.madeToOrderProducts.length,
        wilayaTariffs: data.wilayaTariffs.length
      });

      return data;
    } catch (error) {
      console.error('❌ Error getting cache:', error);
      return null;
    }
  }

  // Set cache data
  setCache(data: Partial<CacheData>): void {
    try {
      const existingCache = this.getCache() || {
        products: [],
        orders: [],
        customers: [],
        madeToOrderProducts: [],
        wilayaTariffs: [],
        lastUpdated: 0,
        version: this.CACHE_VERSION
      };

      const newCache: CacheData = {
        ...existingCache,
        ...data,
        lastUpdated: Date.now(),
        version: this.CACHE_VERSION
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(newCache));
      console.log('💾 Cached data:', {
        products: newCache.products.length,
        orders: newCache.orders.length,
        customers: newCache.customers.length,
        madeToOrderProducts: newCache.madeToOrderProducts.length,
        wilayaTariffs: newCache.wilayaTariffs.length
      });
    } catch (error) {
      console.error('❌ Error setting cache:', error);
    }
  }

  // Clear cache
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  // Get cache info
  getCacheInfo(): { exists: boolean; age: number; size: number } {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return { exists: false, age: 0, size: 0 };

      const data: CacheData = JSON.parse(cached);
      const age = Date.now() - data.lastUpdated;
      const size = new Blob([cached]).size;

      return {
        exists: true,
        age: Math.round(age / 1000 / 60), // minutes
        size: Math.round(size / 1024) // KB
      };
    } catch (error) {
      console.error('❌ Error getting cache info:', error);
      return { exists: false, age: 0, size: 0 };
    }
  }

  // Download all data from server
  async downloadAllData(): Promise<CacheData> {
    console.log('🚀 Downloading all data from server...');
    
    try {
      const [productsRes, ordersRes, customersRes, madeToOrderRes, wilayaRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/made-to-order'),
        fetch('/api/wilaya')
      ]);

      const [products, orders, customers, madeToOrderProducts, wilayaTariffs] = await Promise.all([
        productsRes.ok ? productsRes.json() : { success: false, data: [] },
        ordersRes.ok ? ordersRes.json() : { success: false, data: [] },
        customersRes.ok ? customersRes.json() : { success: false, data: [] },
        madeToOrderRes.ok ? madeToOrderRes.json() : { success: false, data: [] },
        wilayaRes.ok ? wilayaRes.json() : { success: false, data: [] }
      ]);

      const cacheData: CacheData = {
        products: products.success ? products.data : [],
        orders: orders.success ? orders.data : [],
        customers: customers.success ? customers.data : [],
        madeToOrderProducts: madeToOrderProducts.success ? madeToOrderProducts.data : [],
        wilayaTariffs: wilayaTariffs.success ? wilayaTariffs.data : [],
        lastUpdated: Date.now(),
        version: this.CACHE_VERSION
      };

      this.setCache(cacheData);
      console.log('✅ All data downloaded and cached successfully');
      
      return cacheData;
    } catch (error) {
      console.error('❌ Error downloading data:', error);
      throw error;
    }
  }

  // Get specific data with fallback
  async getProducts(): Promise<Product[]> {
    const cache = this.getCache();
    if (cache && cache.products.length > 0) {
      console.log('📦 Using cached products');
      return cache.products;
    }

    console.log('🌐 Fetching products from server');
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      const products = data.success ? data.data : [];
      
      // Update cache
      this.setCache({ products });
      return products;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return [];
    }
  }

  async getMadeToOrderProducts(): Promise<any[]> {
    const cache = this.getCache();
    if (cache && cache.madeToOrderProducts.length > 0) {
      console.log('📦 Using cached made-to-order products');
      return cache.madeToOrderProducts;
    }

    console.log('🌐 Fetching made-to-order products from server');
    try {
      const response = await fetch('/api/made-to-order');
      const data = await response.json();
      const products = data.success ? data.data : [];
      
      // Update cache
      this.setCache({ madeToOrderProducts: products });
      return products;
    } catch (error) {
      console.error('❌ Error fetching made-to-order products:', error);
      return [];
    }
  }

  async getWilayaTariffs(): Promise<any[]> {
    const cache = this.getCache();
    if (cache && cache.wilayaTariffs.length > 0) {
      console.log('📦 Using cached wilaya tariffs');
      return cache.wilayaTariffs;
    }

    console.log('🌐 Fetching wilaya tariffs from server');
    try {
      const response = await fetch('/api/wilaya');
      const data = await response.json();
      const tariffs = data.success ? data.data : [];
      
      // Update cache
      this.setCache({ wilayaTariffs: tariffs });
      return tariffs;
    } catch (error) {
      console.error('❌ Error fetching wilaya tariffs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const localStorageCache = new LocalStorageCache();
export default localStorageCache;
