// Optimized database service with aggressive caching and connection optimization
import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create optimized Supabase client with better connection settings
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false, // Don't persist auth sessions for better performance
    autoRefreshToken: false, // Disable auto refresh for better performance
  },
  global: {
    headers: {
      'Cache-Control': 'max-age=60', // Add cache headers
    },
  },
});

// Aggressive caching system
class DatabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 60000; // 1 minute default
  private readonly LONG_TTL = 300000; // 5 minutes for static data

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string) {
    if (pattern) {
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Preload critical data
  async preloadCriticalData() {
    try {
      console.log('Preloading critical data...');
      
      // Preload products
      const products = await this.getProducts();
      this.set('products', products, this.LONG_TTL);
      
      // Preload maintenance status
      const maintenance = await this.getMaintenanceStatus();
      this.set('maintenance', maintenance, this.DEFAULT_TTL);
      
      console.log('Critical data preloaded successfully');
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }

  private async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertDbProductToProduct);
  }

  private async getMaintenanceStatus() {
    const { data, error } = await supabase
      .from('maintenance_status')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}

const dbCache = new DatabaseCache();

// Helper function to convert database product to Product interface
function convertDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price,
    image: dbProduct.image,
    images: dbProduct.images || [],
    stock: dbProduct.stock || {},
    category: dbProduct.category,
    sizes: dbProduct.sizes || [],
    colors: dbProduct.colors || [],
    inStock: dbProduct.in_stock,
    rating: dbProduct.rating || 0,
    reviews: dbProduct.reviews || 0,
    sku: dbProduct.sku,
    weight: dbProduct.weight,
    dimensions: dbProduct.dimensions,
    tags: dbProduct.tags || [],
    featured: dbProduct.featured || false,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at)
  };
}

// Optimized Products operations
export async function getProducts(): Promise<Product[]> {
  try {
    // Check cache first
    const cached = dbCache.get('products');
    if (cached) {
      console.log('Database: Returning cached products');
      return cached;
    }

    console.log('Database: Fetching products from Supabase');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database getProducts error:', error);
      return [];
    }
    
    const products = (data || []).map(convertDbProductToProduct);
    
    // Cache for 5 minutes (products don't change often)
    dbCache.set('products', products, 300000);
    
    return products;
  } catch (error) {
    console.error('Database getProducts error:', error);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    // Check cache first
    const cached = dbCache.get(`product_${id}`);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Database getProduct error:', error);
      return null;
    }
    
    const product = convertDbProductToProduct(data);
    
    // Cache for 5 minutes
    dbCache.set(`product_${id}`, product, 300000);
    
    return product;
  } catch (error) {
    console.error('Database getProduct error:', error);
    return null;
  }
}

export async function addProduct(product: Product): Promise<Product> {
  try {
    const dbProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice,
      image: product.image,
      images: product.images || [],
      stock: product.stock,
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      in_stock: product.inStock,
      rating: product.rating,
      reviews: product.reviews,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      tags: product.tags || [],
      featured: product.featured || false
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      console.error('Database addProduct error:', error);
      throw error;
    }
    
    const newProduct = convertDbProductToProduct(data);
    
    // Invalidate products cache
    dbCache.invalidate('products');
    
    return newProduct;
  } catch (error) {
    console.error('Database addProduct error:', error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.reviews !== undefined) dbUpdates.reviews = updates.reviews;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
    if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database updateProduct error:', error);
      throw error;
    }
    
    const updatedProduct = convertDbProductToProduct(data);
    
    // Invalidate caches
    dbCache.invalidate('products');
    dbCache.invalidate(`product_${id}`);
    
    return updatedProduct;
  } catch (error) {
    console.error('Database updateProduct error:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database deleteProduct error:', error);
      throw error;
    }
    
    // Invalidate caches
    dbCache.invalidate('products');
    dbCache.invalidate(`product_${id}`);
  } catch (error) {
    console.error('Database deleteProduct error:', error);
    throw error;
  }
}

// Optimized Orders operations
export async function getOrders(): Promise<Order[]> {
  try {
    // Check cache first
    const cached = dbCache.get('orders');
    if (cached) {
      console.log('Database: Returning cached orders');
      return cached;
    }

    console.log('Database: Fetching orders from Supabase');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database getOrders error:', error);
      return [];
    }
    
    const orders = (data || []).map((order: any) => ({
      ...order,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at)
    }));
    
    // Cache for 1 minute (orders change more frequently)
    dbCache.set('orders', orders, 60000);
    
    return orders;
  } catch (error) {
    console.error('Database getOrders error:', error);
    return [];
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    // Check cache first
    const cached = dbCache.get(`order_${id}`);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Database getOrder error:', error);
      return null;
    }
    
    const order = {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    // Cache for 1 minute
    dbCache.set(`order_${id}`, order, 60000);
    
    return order;
  } catch (error) {
    console.error('Database getOrder error:', error);
    return null;
  }
}

export async function addOrder(order: Order): Promise<Order> {
  try {
    const dbOrder = {
      id: order.id,
      product_id: order.productId,
      product_name: order.productName,
      product_image: order.productImage,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      wilaya_id: order.wilayaId,
      wilaya_name: order.wilayaName,
      shipping_type: order.shippingType,
      shipping_cost: order.shippingCost,
      quantity: order.quantity,
      selected_size: order.selectedSize,
      selected_color: order.selectedColor,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      tracking_number: order.trackingNumber,
      notes: order.notes,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      estimated_delivery: order.estimatedDelivery,
      order_date: order.orderDate,
      created_at: order.createdAt,
      updated_at: order.updatedAt
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([dbOrder])
      .select()
      .single();
    
    if (error) {
      console.error('Database addOrder error:', error);
      throw error;
    }
    
    const newOrder = {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    // Invalidate orders cache
    dbCache.invalidate('orders');
    
    return newOrder;
  } catch (error) {
    console.error('Database addOrder error:', error);
    throw error;
  }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  try {
    const dbUpdates: any = {};
    
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.customerEmail !== undefined) dbUpdates.customer_email = updates.customerEmail;
    if (updates.customerPhone !== undefined) dbUpdates.customer_phone = updates.customerPhone;
    if (updates.customerAddress !== undefined) dbUpdates.customer_address = updates.customerAddress;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database updateOrder error:', error);
      throw error;
    }
    
    const updatedOrder = {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    // Invalidate caches
    dbCache.invalidate('orders');
    dbCache.invalidate(`order_${id}`);
    
    return updatedOrder;
  } catch (error) {
    console.error('Database updateOrder error:', error);
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    // First, get the order to return stock
    const order = await getOrder(id);
    if (order) {
      // Return stock for the order
      await returnStockFromOrder(order);
    }
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database deleteOrder error:', error);
      throw error;
    }
    
    // Invalidate caches
    dbCache.invalidate('orders');
    dbCache.invalidate(`order_${id}`);
    dbCache.invalidate('products'); // Invalidate products cache since stock changed
  } catch (error) {
    console.error('Database deleteOrder error:', error);
    throw error;
  }
}

// Optimized Maintenance operations
export async function getMaintenanceStatus() {
  try {
    // Check cache first
    const cached = dbCache.get('maintenance');
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('maintenance_status')
      .select('*')
      .single();

    if (error) {
      console.error('Database getMaintenanceStatus error:', error);
      return null;
    }

    // Cache for 30 seconds
    dbCache.set('maintenance', data, 30000);
    
    return data;
  } catch (error) {
    console.error('Database getMaintenanceStatus error:', error);
    return null;
  }
}

export async function setMaintenanceStatus(isMaintenance: boolean, dropDate?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('maintenance_status')
      .upsert({
        id: 'maintenance',
        is_maintenance: isMaintenance,
        drop_date: dropDate || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Database setMaintenanceStatus error:', error);
      return false;
    }

    // Invalidate maintenance cache
    dbCache.invalidate('maintenance');
    
    return true;
  } catch (error) {
    console.error('Database setMaintenanceStatus error:', error);
    return false;
  }
}

// Stock return function for cancelled/deleted orders
export async function returnStockFromOrder(order: Order): Promise<boolean> {
  try {
    console.log('Database: Returning stock for order:', order.id);
    
    // Get the product
    const product = await getProduct(order.productId);
    if (!product) {
      console.error('Database: Product not found for order:', order.productId);
      return false;
    }
    
    // Get current stock
    const currentStock = product.stock?.[order.selectedSize]?.[order.selectedColor] || 0;
    
    // Return the stock
    const newStock = {
      ...product.stock,
      [order.selectedSize]: {
        ...product.stock?.[order.selectedSize],
        [order.selectedColor]: currentStock + order.quantity
      }
    };
    
    // Update the product stock
    const updatedProduct = await updateProduct(order.productId, {
      stock: newStock,
      inStock: calculateTotalStock(newStock) > 0
    });
    
    if (updatedProduct) {
      console.log('Database: Successfully returned stock for order:', order.id, {
        productId: order.productId,
        size: order.selectedSize,
        color: order.selectedColor,
        quantity: order.quantity,
        newTotalStock: calculateTotalStock(newStock)
      });
      
      // Invalidate product cache
      dbCache.invalidate('products');
      dbCache.invalidate(`product_${order.productId}`);
      
      return true;
    } else {
      console.error('Database: Failed to return product stock for order:', order.id);
      return false;
    }
  } catch (error) {
    console.error('Database: Error returning stock for order:', error);
    return false;
  }
}

// Helper function to calculate total stock
function calculateTotalStock(stock: any): number {
  if (!stock || typeof stock !== 'object') return 0;
  
  let total = 0;
  Object.values(stock).forEach((colorStock: any) => {
    if (colorStock && typeof colorStock === 'object') {
      Object.values(colorStock).forEach((qty: any) => {
        if (typeof qty === 'number') {
          total += qty;
        }
      });
    }
  });
  
  return total;
}

// Initialize cache on module load
if (typeof window !== 'undefined') {
  // Only preload on client side
  dbCache.preloadCriticalData();
}

export { supabase, dbCache };
