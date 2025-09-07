// Database service using Supabase (free tier)
// This provides persistent storage with a real database

import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';

// Customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  wilaya: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supabase configuration - MUST use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Export the supabase client for direct use
export { supabase };

// Helper function to convert database product to Product interface
function convertDbProductToProduct(dbProduct: any): Product {
  // Debug logging
  console.log('🔍 DEBUG: Raw price from DB:', dbProduct.price, 'Type:', typeof dbProduct.price);
  console.log('🔍 DEBUG: Parsed price:', parseFloat(dbProduct.price), 'Type:', typeof parseFloat(dbProduct.price));
  
  const convertedProduct = {
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
  
  console.log('🔍 DEBUG: Final converted product price:', convertedProduct.price, 'Type:', typeof convertedProduct.price);
  return convertedProduct;
}

// Cache for products to reduce database calls
let productsCache: Product[] | null = null;
let productsCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Clear cache function
export function clearProductsCache(): void {
  productsCache = null;
  productsCacheTime = 0;
  console.log('Supabase: Products cache cleared');
}

// Force clear cache immediately to fix price formatting issue
clearProductsCache();

// Add timestamp to force cache invalidation
const CACHE_BUSTER = Date.now();
console.log('🚀 Cache buster timestamp:', CACHE_BUSTER);

// Products operations
export async function getProducts(): Promise<Product[]> {
  try {
    // Return cached data if still fresh
    if (productsCache && Date.now() - productsCacheTime < CACHE_DURATION) {
      console.log('Supabase: Returning cached products');
      return productsCache;
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
      featured: product.featured || false,
      size_chart_category: product.sizeChartCategory || 'T-Shirts',
      custom_size_chart: product.customSizeChart || null,
      use_custom_size_chart: product.useCustomSizeChart || false
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
    
    // Initialize inventory for the new product
    try {
      const { initializeProductInventory } = await import('./inventoryService');
      await initializeProductInventory(product.id);
      console.log('Supabase: Initialized inventory for product:', product.id);
    } catch (inventoryError) {
      console.error('Supabase: Failed to initialize inventory for product:', product.id, inventoryError);
      // Don't throw error here, product creation should still succeed
    }
    
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
    if (product.sizeChartCategory !== undefined) dbProduct.size_chart_category = product.sizeChartCategory;
    if (product.customSizeChart !== undefined) dbProduct.custom_size_chart = product.customSizeChart;
    if (product.useCustomSizeChart !== undefined) dbProduct.use_custom_size_chart = product.useCustomSizeChart;
    
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
  // Extract customer info from items or use defaults
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
    customerCity: firstItem.customerCity || '',
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
    trackingNumber: dbOrder.tracking_number,
    notes: firstItem.notes,
    paymentMethod: dbOrder.payment_method || 'cod',
    paymentStatus: dbOrder.payment_status || 'pending',
    estimatedDelivery: firstItem.estimatedDelivery,
    createdAt: new Date(dbOrder.created_at),
    updatedAt: new Date(dbOrder.updated_at)
  };
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
    // Convert Order interface to database format
    const dbOrder = {
      id: order.id,
      customer_id: `CUST-${Date.now()}`, // Generate customer ID
      items: [{
        productId: order.productId,
        productName: order.productName,
        productImage: order.productImage,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        customerAddress: order.customerAddress,
        customerCity: order.customerCity,
        wilayaId: order.wilayaId,
        wilayaName: order.wilayaName,
        quantity: order.quantity,
        selectedSize: order.selectedSize,
        selectedColor: order.selectedColor,
        notes: order.notes,
        estimatedDelivery: order.estimatedDelivery
      }],
      total: order.total,
      shipping_cost: order.shippingCost,
      shipping_type: order.shippingType,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,
      tracking_number: order.trackingNumber,
      order_date: order.orderDate.toISOString(),
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
    // First, get the order details to restore inventory
    const order = await getOrder(id);
    if (!order) {
      console.error('Supabase deleteOrder: Order not found:', id);
      return false;
    }

    // Restore inventory quantity
    if (order.productId && order.selectedSize && order.selectedColor && order.quantity) {
      try {
        const { addInventory } = await import('./inventoryService');
        const inventoryRestored = await addInventory(
          order.productId,
          order.selectedSize,
          order.selectedColor,
          order.quantity,
          `Order ${id} deleted - inventory restored`,
          'admin'
        );
        
        if (inventoryRestored) {
          console.log('Supabase deleteOrder: Inventory restored for order:', id);
        } else {
          console.warn('Supabase deleteOrder: Failed to restore inventory for order:', id);
        }
      } catch (inventoryError) {
        console.error('Supabase deleteOrder: Inventory restoration error:', inventoryError);
        // Continue with order deletion even if inventory restoration fails
      }
    }

    // Delete the order
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


// Wilaya operations
export async function getWilayaTariffs(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('wilaya_tariffs')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Supabase getWilayaTariffs error:', error);
      return [];
    }
    
    // Transform the data to match the expected format
    const transformedData = (data || []).map(tariff => ({
      id: tariff.id.toString(),
      wilaya_id: tariff.wilaya_id,
      name: tariff.name,
      domicile_ecommerce: tariff.domicile_ecommerce,
      stop_desk_ecommerce: tariff.stop_desk_ecommerce,
      order: tariff.order,
      // Legacy compatibility for backward compatibility
      home_delivery: tariff.domicile_ecommerce,
      stop_desk: tariff.stop_desk_ecommerce,
      homeDelivery: tariff.domicile_ecommerce,
      stopDesk: tariff.stop_desk_ecommerce,
      domicileEcommerce: tariff.domicile_ecommerce,
      stopDeskEcommerce: tariff.stop_desk_ecommerce
    }));
    
    return transformedData;
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
      // Transform the data to match database structure
      const transformedTariffs = tariffs.map(tariff => ({
        wilaya_id: tariff.wilaya_id || tariff.id,
        name: tariff.name,
        domicile_ecommerce: tariff.domicile_ecommerce || tariff.domicileEcommerce || tariff.home_delivery || tariff.homeDelivery || 0,
        stop_desk_ecommerce: tariff.stop_desk_ecommerce || tariff.stopDeskEcommerce || tariff.stop_desk || tariff.stopDesk || 0,
        order: tariff.order || 1
      }));
      
      const { error } = await supabase
        .from('wilaya_tariffs')
        .insert(transformedTariffs);
      
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
    
    // Deduct the stock from product
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
    
    if (!updatedProduct) {
      console.error('Supabase: Failed to update product stock for order:', order.id);
      return false;
    }

    // Also deduct from inventory system
    try {
      const { addInventory } = await import('./inventoryService');
      const inventoryDeducted = await addInventory(
        order.productId,
        order.selectedSize,
        order.selectedColor,
        -order.quantity, // Negative quantity to deduct
        `Order ${order.id} created - stock deducted`,
        'system'
      );
      
      if (inventoryDeducted) {
        console.log('Supabase: Successfully deducted inventory for order:', order.id);
      } else {
        console.warn('Supabase: Failed to deduct inventory for order:', order.id);
      }
    } catch (inventoryError) {
      console.error('Supabase: Inventory deduction error:', inventoryError);
      // Continue even if inventory update fails
    }
    
    console.log('Supabase: Successfully deducted stock for order:', order.id);
    return true;
  } catch (error) {
    console.error('Supabase: Error deducting stock for order:', error);
    return false;
  }
}

// Maintenance settings operations
export async function getMaintenanceSettings(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('maintenance_settings')
      .select('*')
      .eq('id', 'maintenance')
      .single();
    
    if (error) {
      console.error('Supabase getMaintenanceSettings error:', error);
      // If table doesn't exist, return default settings
      if (error.code === 'PGRST205') {
        console.log('Maintenance settings table not found, using default settings');
      }
      // Return default settings if no data exists
      return {
        id: 'maintenance',
        is_maintenance_mode: false,
        drop_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        maintenance_message: 'We are currently performing maintenance. Please check back later.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return data || {
      id: 'maintenance',
      is_maintenance_mode: false,
      drop_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maintenance_message: 'We are currently performing maintenance. Please check back later.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Supabase getMaintenanceSettings error:', error);
    return {
      id: 'maintenance',
      is_maintenance_mode: false,
      drop_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maintenance_message: 'We are currently performing maintenance. Please check back later.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export async function updateMaintenanceSettings(settings: {
  is_maintenance_mode?: boolean;
  drop_date?: string;
  maintenance_message?: string;
}): Promise<any> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (settings.is_maintenance_mode !== undefined) {
      updateData.is_maintenance_mode = settings.is_maintenance_mode;
    }
    
    if (settings.drop_date !== undefined) {
      updateData.drop_date = settings.drop_date;
    }
    
    if (settings.maintenance_message !== undefined) {
      updateData.maintenance_message = settings.maintenance_message;
    }
    
    console.log('Updating maintenance settings with:', updateData);
    
    // Try update first
    const { data: updateResult, error: updateError } = await supabase
      .from('maintenance_settings')
      .update(updateData)
      .eq('id', 'maintenance')
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      
      // If update fails, try insert
      const { data: insertResult, error: insertError } = await supabase
        .from('maintenance_settings')
        .insert([{
          id: 'maintenance',
          is_maintenance_mode: settings.is_maintenance_mode ?? false,
          drop_date: settings.drop_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maintenance_message: settings.maintenance_message ?? 'We are currently performing maintenance. Please check back later.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      
      console.log('Supabase: Created maintenance settings');
      return insertResult;
    }
    
    console.log('Supabase: Updated maintenance settings');
    return updateResult;
  } catch (error) {
    console.error('Supabase updateMaintenanceSettings error:', error);
    throw error;
  }
}

// Customers methods
export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase getCustomers error:', error);
      throw error;
    }
    
    console.log('Supabase: Fetched', data?.length || 0, 'customers');
    return data || [];
  } catch (error) {
    console.error('Supabase getCustomers error:', error);
    throw error;
  }
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> {
  try {
    const now = new Date().toISOString();
    const customer = {
      ...customerData,
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addCustomer error:', error);
      throw error;
    }
    
    console.log('Supabase: Created customer:', data.id);
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      wilaya: data.wilaya,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Supabase addCustomer error:', error);
    throw error;
  }
}
