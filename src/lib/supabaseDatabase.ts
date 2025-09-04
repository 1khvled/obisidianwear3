// Database service using Supabase (free tier)
// This provides persistent storage with a real database

import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';

// Supabase configuration - MUST use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Products operations
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase getProducts error:', error);
      return [];
    }
    
    return (data || []).map(convertDbProductToProduct);
  } catch (error) {
    console.error('Supabase getProducts error:', error);
    return [];
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
    return true;
  } catch (error) {
    console.error('Supabase deleteProduct error:', error);
    return false;
  }
}

// Orders operations
export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('Supabase getOrders error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Supabase getOrders error:', error);
    return [];
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
    
    return data;
  } catch (error) {
    console.error('Supabase getOrder error:', error);
    return null;
  }
}

export async function addOrder(order: Order): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addOrder error:', error);
      throw error;
    }
    
    console.log('Supabase: Added order:', order.id);
    return data;
  } catch (error) {
    console.error('Supabase addOrder error:', error);
    throw error;
  }
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...order, id })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase updateOrder error:', error);
      return null;
    }
    
    console.log('Supabase: Updated order:', id);
    return data;
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
