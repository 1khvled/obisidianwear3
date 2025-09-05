// Database service using Supabase (free tier)
// This provides persistent storage with a real database

import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';

// Supabase configuration - MUST use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw error if we're not in build mode
if (!supabaseUrl || !supabaseKey) {
  // Only throw error during runtime, not during build
  if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}. Please set these in your Vercel environment variables or .env.local file.`);
  }
}

// Create supabase client with fallback for build time
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Export the supabase client for direct use
export { supabase };

// Helper function to convert database product to Product interface
function convertDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name || '',
    description: dbProduct.description || '',
    price: Number(dbProduct.price) || 0,
    originalPrice: Number(dbProduct.original_price) || 0,
    image: dbProduct.image || '',
    images: dbProduct.images || [],
    stock: dbProduct.stock || {},
    category: dbProduct.category || '',
    sizes: dbProduct.sizes || [],
    colors: dbProduct.colors || [],
    inStock: dbProduct.in_stock || false,
    status: dbProduct.status || 'available',
    rating: Number(dbProduct.rating) || 0,
    reviews: Number(dbProduct.reviews) || 0,
    sku: dbProduct.sku || '',
    weight: Number(dbProduct.weight) || 0,
    dimensions: dbProduct.dimensions || null,
    tags: dbProduct.tags || [],
    featured: dbProduct.featured || false,
    createdAt: dbProduct.created_at ? new Date(dbProduct.created_at) : new Date(),
    updatedAt: dbProduct.updated_at ? new Date(dbProduct.updated_at) : new Date()
  };
}

// Cache for products to reduce database calls
let productsCache: Product[] | null = null;
let productsCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Products operations
export async function getProducts(): Promise<Product[]> {
  try {
    // Return cached data if still fresh
    if (productsCache && Date.now() - productsCacheTime < CACHE_DURATION) {
      console.log('Supabase: Returning cached products');
      return productsCache;
    }

    if (!supabase) {
      console.error('Supabase client not initialized');
      return productsCache || [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase getProducts error:', error);
      return productsCache || [];
    }
    
    const products = (data || []).map(convertDbProductToProduct);
    
    // Update cache
    productsCache = products;
    productsCacheTime = Date.now();
    
    return products;
  } catch (error) {
    console.error('Supabase getProducts error:', error);
    return productsCache || [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase getProduct error:', error);
      return null;
    }
    
    return convertDbProductToProduct(data);
  } catch (error) {
    console.error('Supabase getProduct error:', error);
    return null;
  }
}

export async function addProduct(product: Product): Promise<Product> {
  try {
    // Convert camelCase to snake_case for database
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
      // created_at and updated_at are automatically set by the database
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addProduct error:', error);
      throw error;
    }
    
    console.log('Supabase: Added product:', product.id);
    
    // Invalidate cache
    productsCache = null;
    
    // Convert back to camelCase
    return convertDbProductToProduct(data);
  } catch (error) {
    console.error('Supabase addProduct error:', error);
    throw error;
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  try {
    // Convert camelCase to snake_case for database
    const dbProduct: any = {};
    
    if (product.name !== undefined) dbProduct.name = product.name;
    if (product.description !== undefined) dbProduct.description = product.description;
    if (product.price !== undefined) dbProduct.price = product.price;
    if (product.originalPrice !== undefined) dbProduct.original_price = product.originalPrice;
    if (product.image !== undefined) dbProduct.image = product.image;
    if (product.images !== undefined) dbProduct.images = product.images;
    if (product.stock !== undefined) dbProduct.stock = product.stock;
    if (product.category !== undefined) dbProduct.category = product.category;
    if (product.sizes !== undefined) dbProduct.sizes = product.sizes;
    if (product.colors !== undefined) dbProduct.colors = product.colors;
    if (product.inStock !== undefined) dbProduct.in_stock = product.inStock;
    if (product.rating !== undefined) dbProduct.rating = product.rating;
    if (product.reviews !== undefined) dbProduct.reviews = product.reviews;
    if (product.sku !== undefined) dbProduct.sku = product.sku;
    if (product.weight !== undefined) dbProduct.weight = product.weight;
    if (product.dimensions !== undefined) dbProduct.dimensions = product.dimensions;
    if (product.tags !== undefined) dbProduct.tags = product.tags;
    if (product.featured !== undefined) dbProduct.featured = product.featured;
    
    const { data, error } = await supabase
      .from('products')
      .update(dbProduct)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase updateProduct error:', error);
      return null;
    }
    
    console.log('Supabase: Updated product:', id);
    
    // Invalidate cache
    productsCache = null;
    
    return convertDbProductToProduct(data);
  } catch (error) {
    console.error('Supabase updateProduct error:', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase deleteProduct error:', error);
      return false;
    }
    
    console.log('Supabase: Deleted product:', id);
    
    // Invalidate cache
    productsCache = null;
    
    return true;
  } catch (error) {
    console.error('Supabase deleteProduct error:', error);
    return false;
  }
}

// Helper function to convert database order to Order interface
function convertDbOrderToOrder(dbOrder: any): Order {
  // Handle both old and new schema
  const isOldSchema = dbOrder.items && Array.isArray(dbOrder.items);
  
  if (isOldSchema) {
    // Old schema with items array
    const firstItem = dbOrder.items && dbOrder.items.length > 0 ? dbOrder.items[0] : {};
    
    return {
      id: dbOrder.id,
      productId: firstItem.productId || '',
      productName: firstItem.productName || '',
      productImage: firstItem.productImage || '',
      customerName: firstItem.customerName || '',
      customerPhone: firstItem.customerPhone || '',
      customerEmail: firstItem.customerEmail || '',
      customerAddress: firstItem.customerAddress || '',
      wilayaId: firstItem.wilayaId || 0,
      wilayaName: firstItem.wilayaName || '',
      shippingType: dbOrder.shipping_type || 'homeDelivery',
      shippingCost: Number(dbOrder.shipping_cost) || 0,
      quantity: firstItem.quantity || 1,
      selectedSize: firstItem.selectedSize || '',
      selectedColor: firstItem.selectedColor || '',
      subtotal: Number(dbOrder.total) - Number(dbOrder.shipping_cost) || 0,
      total: Number(dbOrder.total) || 0,
      orderDate: new Date(dbOrder.order_date),
      status: dbOrder.status || 'pending',
      trackingNumber: dbOrder.tracking_number || '',
      notes: firstItem.notes || '',
      paymentMethod: dbOrder.payment_method || 'cod',
      paymentStatus: dbOrder.payment_status || 'pending',
      estimatedDelivery: firstItem.estimatedDelivery || '',
      createdAt: new Date(dbOrder.created_at),
      updatedAt: new Date(dbOrder.updated_at)
    };
  } else {
    // New schema with direct fields
    return {
      id: dbOrder.id,
      productId: dbOrder.product_id || '',
      productName: dbOrder.product_name || '',
      productImage: dbOrder.product_image || '',
      customerName: dbOrder.customer_name || '',
      customerPhone: dbOrder.customer_phone || '',
      customerEmail: dbOrder.customer_email || '',
      customerAddress: dbOrder.customer_address || '',
      wilayaId: dbOrder.wilaya_id || 0,
      wilayaName: dbOrder.wilaya_name || '',
      shippingType: dbOrder.shipping_type || 'homeDelivery',
      shippingCost: Number(dbOrder.shipping_cost) || 0,
      quantity: dbOrder.quantity || 1,
      selectedSize: dbOrder.selected_size || '',
      selectedColor: dbOrder.selected_color || '',
      subtotal: Number(dbOrder.subtotal) || 0,
      total: Number(dbOrder.total) || 0,
      orderDate: new Date(dbOrder.order_date),
      status: dbOrder.status || 'pending',
      trackingNumber: dbOrder.tracking_number || '',
      notes: dbOrder.notes || '',
      paymentMethod: dbOrder.payment_method || 'cod',
      paymentStatus: dbOrder.payment_status || 'pending',
      estimatedDelivery: dbOrder.estimated_delivery || '',
      createdAt: new Date(dbOrder.created_at),
      updatedAt: new Date(dbOrder.updated_at)
    };
  }
}

// Cache for orders to reduce database calls
let ordersCache: Order[] | null = null;
let ordersCacheTime = 0;

// Orders operations
export async function getOrders(): Promise<Order[]> {
  try {
    // Return cached data if still fresh
    if (ordersCache && Date.now() - ordersCacheTime < CACHE_DURATION) {
      console.log('Supabase: Returning cached orders');
      return ordersCache;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('Supabase getOrders error:', error);
      return ordersCache || [];
    }
    
    const orders = (data || []).map(convertDbOrderToOrder);
    
    // Update cache
    ordersCache = orders;
    ordersCacheTime = Date.now();
    
    return orders;
  } catch (error) {
    console.error('Supabase getOrders error:', error);
    return ordersCache || [];
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase getOrder error:', error);
      return null;
    }
    
    return convertDbOrderToOrder(data);
  } catch (error) {
    console.error('Supabase getOrder error:', error);
    return null;
  }
}

export async function addOrder(order: Order): Promise<Order> {
  try {
    // Convert Order interface to database format (matching the orders table schema)
    const dbOrder = {
      id: order.id,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      wilaya_id: order.wilayaId,
      wilaya_name: order.wilayaName,
      product_id: order.productId,
      product_name: order.productName,
      product_image: order.productImage,
      selected_size: order.selectedSize,
      selected_color: order.selectedColor,
      quantity: order.quantity,
      subtotal: order.subtotal,
      shipping_cost: order.shippingCost,
      total: order.total,
      shipping_type: order.shippingType,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,
      order_date: order.orderDate.toISOString(),
      notes: order.notes,
      tracking_number: order.trackingNumber,
      estimated_delivery: order.estimatedDelivery,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString()
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([dbOrder])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addOrder error:', error);
      throw error;
    }
    
    console.log('Supabase: Added order:', order.id);
    return convertDbOrderToOrder(data);
  } catch (error) {
    console.error('Supabase addOrder error:', error);
    throw error;
  }
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
  try {
    // Convert partial Order to database format
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (order.status !== undefined) updateData.status = order.status;
    if (order.paymentStatus !== undefined) updateData.payment_status = order.paymentStatus;
    if (order.trackingNumber !== undefined) updateData.tracking_number = order.trackingNumber;
    if (order.shippingType !== undefined) updateData.shipping_type = order.shippingType;
    if (order.shippingCost !== undefined) updateData.shipping_cost = order.shippingCost;
    if (order.total !== undefined) updateData.total = order.total;
    if (order.paymentMethod !== undefined) updateData.payment_method = order.paymentMethod;
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase updateOrder error:', error);
      return null;
    }
    
    console.log('Supabase: Updated order:', id);
    return convertDbOrderToOrder(data);
  } catch (error) {
    console.error('Supabase updateOrder error:', error);
    return null;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase deleteOrder error:', error);
      return false;
    }
    
    console.log('Supabase: Deleted order:', id);
    return true;
  } catch (error) {
    console.error('Supabase deleteOrder error:', error);
    return false;
  }
}

// Customers operations
export async function getCustomers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase getCustomers error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Supabase getCustomers error:', error);
    return [];
  }
}

export async function addCustomer(customer: any): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addCustomer error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Supabase addCustomer error:', error);
    throw error;
  }
}

// Maintenance operations
export async function getMaintenanceStatus(): Promise<any> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return { is_maintenance: false, drop_date: null };
    }

    const { data, error } = await supabase
      .from('maintenance_status')
      .select('*')
      .eq('id', 'maintenance')
      .single();
    
    if (error) {
      console.error('Supabase getMaintenanceStatus error:', error);
      return { is_maintenance: false, drop_date: null };
    }
    
    return data || { is_maintenance: false, drop_date: null };
  } catch (error) {
    console.error('Supabase getMaintenanceStatus error:', error);
    return { is_maintenance: false, drop_date: null };
  }
}

export async function updateMaintenanceStatus(isMaintenance: boolean, dropDate?: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return false;
    }

    const updateData: any = {
      is_maintenance: isMaintenance,
      updated_at: new Date().toISOString()
    };
    
    if (dropDate) {
      updateData.drop_date = dropDate;
    }
    
    const { error } = await supabase
      .from('maintenance_status')
      .update(updateData)
      .eq('id', 'maintenance');
    
    if (error) {
      console.error('Supabase updateMaintenanceStatus error:', error);
      return false;
    }
    
    console.log('Supabase: Updated maintenance status');
    return true;
  } catch (error) {
    console.error('Supabase updateMaintenanceStatus error:', error);
    return false;
  }
}

// Wilaya operations
export async function getWilayaTariffs(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('wilaya_tariffs')
      .select('*')
      .order('wilaya_code', { ascending: true });
    
    if (error) {
      console.error('Supabase getWilayaTariffs error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Supabase getWilayaTariffs error:', error);
    return [];
  }
}

export async function updateWilayaTariffs(tariffs: any[]): Promise<void> {
  try {
    // Delete all existing tariffs
    await supabase
      .from('wilaya_tariffs')
      .delete()
      .neq('id', 0); // Delete all records
    
    // Insert new tariffs
    if (tariffs.length > 0) {
      const { error } = await supabase
        .from('wilaya_tariffs')
        .insert(tariffs);
      
      if (error) {
        console.error('Supabase updateWilayaTariffs error:', error);
        throw error;
      }
    }
    
    console.log('Supabase: Updated wilaya tariffs');
  } catch (error) {
    console.error('Supabase updateWilayaTariffs error:', error);
    throw error;
  }
}

// Inventory operations
export async function getInventory(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, sizes, colors, in_stock, category')
      .order('name');
    
    if (error) {
      console.error('Supabase getInventory error:', error);
      return [];
    }
    
    // Transform data for inventory management
    return (data || []).map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      inStock: product.in_stock,
      stock: product.stock || {},
      sizes: product.sizes || [],
      colors: product.colors || [],
      totalStock: calculateTotalStock(product.stock || {}),
      stockBySize: calculateStockBySize(product.stock || {}, product.sizes || [], product.colors || [])
    }));
  } catch (error) {
    console.error('Supabase getInventory error:', error);
    return [];
  }
}

export async function updateInventory(productId: string, stockData: any): Promise<any> {
  try {
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
      .select()
      .single();
    
    if (error) {
      console.error('Supabase updateInventory error:', error);
      throw error;
    }
    
    console.log('Supabase: Updated inventory for product:', productId);
    return {
      id: data.id,
      name: data.name,
      stock: data.stock,
      inStock: data.in_stock,
      totalStock: calculateTotalStock(data.stock)
    };
  } catch (error) {
    console.error('Supabase updateInventory error:', error);
    throw error;
  }
}

// Helper functions for inventory calculations
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

// Stock deduction function for orders
export async function deductStockFromOrder(order: Order): Promise<boolean> {
  try {
    console.log('Supabase: Deducting stock for order:', order.id);
    
    // Get the product
    const product = await getProduct(order.productId);
    if (!product) {
      console.error('Supabase: Product not found for order:', order.productId);
      return false;
    }
    
    // Check if we have enough stock
    const currentStock = product.stock?.[order.selectedSize]?.[order.selectedColor] || 0;
    if (currentStock < order.quantity) {
      console.error('Supabase: Insufficient stock for order:', {
        productId: order.productId,
        size: order.selectedSize,
        color: order.selectedColor,
        requested: order.quantity,
        available: currentStock
      });
      return false;
    }
    
    // Deduct the stock
    const newStock = {
      ...product.stock,
      [order.selectedSize]: {
        ...product.stock?.[order.selectedSize],
        [order.selectedColor]: currentStock - order.quantity
      }
    };
    
    // Update the product stock
    const updatedProduct = await updateProduct(order.productId, {
      stock: newStock,
      inStock: calculateTotalStock(newStock) > 0
    });
    
    if (updatedProduct) {
      console.log('Supabase: Successfully deducted stock for order:', order.id);
      return true;
    } else {
      console.error('Supabase: Failed to update product stock for order:', order.id);
      return false;
    }
  } catch (error) {
    console.error('Supabase: Error deducting stock for order:', error);
    return false;
  }
}

// Stock return function for cancelled/deleted orders
export async function returnStockFromOrder(order: Order): Promise<boolean> {
  try {
    console.log('Supabase: Returning stock for order:', order.id);
    
    // Get the product
    const product = await getProduct(order.productId);
    if (!product) {
      console.error('Supabase: Product not found for order:', order.productId);
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
      console.log('Supabase: Successfully returned stock for order:', order.id, {
        productId: order.productId,
        size: order.selectedSize,
        color: order.selectedColor,
        quantity: order.quantity,
        newTotalStock: calculateTotalStock(newStock)
      });
      return true;
    } else {
      console.error('Supabase: Failed to return product stock for order:', order.id);
      return false;
    }
  } catch (error) {
    console.error('Supabase: Error returning stock for order:', error);
    return false;
  }
}
