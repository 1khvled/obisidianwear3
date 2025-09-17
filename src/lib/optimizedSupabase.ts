// Optimized Supabase service with connection pooling and performance improvements
import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';

// Supabase configuration with performance optimizations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create optimized Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'obsidian-wear-optimized',
      'Connection': 'keep-alive',
    },
  },
  // realtime: {
  //   enabled: false, // This property doesn't exist in the current Supabase version
  // },
});

// Enhanced caching with TTL and memory management
class OptimizedCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 50; // Reduced cache size for better memory management

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
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

  get(key: string): any | null {
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

  clear(): void {
    this.cache.clear();
  }

  // Clear specific patterns
  clearPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

const cache = new OptimizedCache();

// Optimized product operations
export async function getProductsOptimized(): Promise<Product[]> {
  const cacheKey = 'products_optimized';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('🚀 Cache hit for products');
    return cached;
  }

  try {
    console.log('🗄️ Fetching products from database...');
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, original_price, image, images, stock, category, sizes, colors, in_stock, rating, reviews, sku, weight, dimensions, tags, featured, size_chart_category, custom_size_chart, use_custom_size_chart, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(100); // Limit results for better performance
    
    const endTime = performance.now();
    console.log(`⏱️ Database query took ${(endTime - startTime).toFixed(2)}ms`);
    
    if (error) {
      console.error('Supabase getProductsOptimized error:', error);
      return [];
    }
    
    const products = (data || []).map(convertDbProductToProduct);
    
    // Cache for 5 minutes
    cache.set(cacheKey, products, 300000);
    
    return products;
  } catch (error) {
    console.error('Supabase getProductsOptimized error:', error);
    return [];
  }
}

// Optimized inventory operations
export async function getInventoryOptimized(): Promise<any[]> {
  const cacheKey = 'inventory_optimized';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('🚀 Cache hit for inventory');
    return cached;
  }

  try {
    console.log('🗄️ Fetching inventory from database...');
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, sizes, colors, in_stock, category, image, price')
      .order('name')
      .limit(50); // Limit for better performance
    
    const endTime = performance.now();
    console.log(`⏱️ Inventory query took ${(endTime - startTime).toFixed(2)}ms`);
    
    if (error) {
      console.error('Supabase getInventoryOptimized error:', error);
      return [];
    }
    
    // Transform data for inventory management
    const inventoryData = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      inStock: product.in_stock,
      stock: product.stock || {},
      sizes: product.sizes || [],
      colors: product.colors || [],
      totalStock: calculateTotalStock(product.stock || {}),
      stockBySize: calculateStockBySize(product.stock || {}, product.sizes || [], product.colors || []),
      image: product.image,
      price: product.price
    }));
    
    // Cache for 2 minutes
    cache.set(cacheKey, inventoryData, 120000);
    
    return inventoryData;
  } catch (error) {
    console.error('Supabase getInventoryOptimized error:', error);
    return [];
  }
}

// Optimized update inventory
export async function updateInventoryOptimized(productId: string, stockData: any): Promise<any> {
  try {
    console.log('🗄️ Updating inventory in database...');
    const startTime = performance.now();
    
    const updateObj: any = {
      updated_at: new Date().toISOString()
    };
    
    if (stockData.stock) {
      updateObj.stock = stockData.stock;
    }
    
    if (stockData.inStock !== undefined) {
      updateObj.in_stock = stockData.inStock;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(updateObj)
      .eq('id', productId)
      .select('id, name, stock, in_stock')
      .single();
    
    const endTime = performance.now();
    console.log(`⏱️ Inventory update took ${(endTime - startTime).toFixed(2)}ms`);
    
    if (error) {
      console.error('Supabase updateInventoryOptimized error:', error);
      throw error;
    }
    
    // Clear related caches
    cache.clearPattern('products');
    cache.clearPattern('inventory');
    
    console.log('✅ Inventory updated successfully');
    return {
      id: data.id,
      name: data.name,
      stock: data.stock,
      inStock: data.in_stock,
      totalStock: calculateTotalStock(data.stock)
    };
  } catch (error) {
    console.error('Supabase updateInventoryOptimized error:', error);
    throw error;
  }
}

// Helper functions
function convertDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: parseFloat(dbProduct.price),
    originalPrice: dbProduct.original_price ? parseFloat(dbProduct.original_price) : undefined,
    image: dbProduct.image,
    images: dbProduct.images || [],
    stock: dbProduct.stock || {},
    category: dbProduct.category,
    sizes: dbProduct.sizes || [],
    colors: dbProduct.colors || [],
    inStock: dbProduct.in_stock,
    rating: parseFloat(dbProduct.rating || 0),
    reviews: dbProduct.reviews || 0,
    sku: dbProduct.sku,
    weight: dbProduct.weight ? parseFloat(dbProduct.weight) : undefined,
    dimensions: dbProduct.dimensions,
    tags: dbProduct.tags || [],
    featured: dbProduct.featured || false,
    sizeChartCategory: dbProduct.size_chart_category || 'T-Shirts',
    customSizeChart: dbProduct.custom_size_chart || undefined,
    useCustomSizeChart: dbProduct.use_custom_size_chart || false,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at)
  };
}

function calculateTotalStock(stock: any): number {
  if (!stock || typeof stock !== 'object') return 0;
  
  let total = 0;
  for (const size in stock) {
    if (typeof stock[size] === 'object') {
      for (const color in stock[size]) {
        total += Number(stock[size][color]) || 0;
      }
    }
  }
  return total;
}

function calculateStockBySize(stock: any, sizes: string[], colors: string[]): any {
  const result: any = {};
  
  sizes.forEach(size => {
    result[size] = {};
    colors.forEach(color => {
      result[size][color] = Number(stock[size]?.[color]) || 0;
    });
  });
  
  return result;
}

// Export optimized functions
export { supabase, cache };
