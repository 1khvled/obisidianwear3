// Database service using Supabase (free tier)
// This provides persistent storage with a real database

import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '@/types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrmxcjklkthpyanfslsw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0';

const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    return data || [];
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
    
    return data;
  } catch (error) {
    console.error('Supabase getProduct error:', error);
    return null;
  }
}

export async function addProduct(product: Product): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase addProduct error:', error);
      throw error;
    }
    
    console.log('Supabase: Added product:', product.id);
    return data;
  } catch (error) {
    console.error('Supabase addProduct error:', error);
    throw error;
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, id })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase updateProduct error:', error);
      return null;
    }
    
    console.log('Supabase: Updated product:', id);
    return data;
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
