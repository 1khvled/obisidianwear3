// Optimized Order Service for instant order processing
import { supabase } from './supabaseDatabase';

export interface OptimizedOrder {
  id?: number;
  customer_id: number;
  items: any[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

class OptimizedOrderService {
  private cache = new Map<string, any>();
  private cacheTimeout = 5000; // 5 seconds

  // Fast order creation with optimistic UI
  async createOrder(orderData: Omit<OptimizedOrder, 'id' | 'created_at' | 'updated_at'>): Promise<OptimizedOrder> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        throw new Error('Database not available');
      }

      // Optimistic response for instant UI update
      const optimisticOrder: OptimizedOrder = {
        ...orderData,
        id: Date.now(), // Temporary ID for UI
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Return optimistic response immediately
      setTimeout(async () => {
        try {
          // Actual database operation in background
          const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

          if (error) {
            console.error('Order creation error:', error);
            // Could emit error event for UI to handle
          } else {
            console.log('Order created successfully:', data);
            // Could emit success event for UI to update with real ID
          }
        } catch (err) {
          console.error('Background order creation failed:', err);
        }
      }, 0);

      return optimisticOrder;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }

  // Fast order retrieval with caching
  async getOrders(limit = 50, offset = 0): Promise<OptimizedOrder[]> {
    const cacheKey = `orders_${limit}_${offset}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Cache the result
      this.cache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });

      return data || [];
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  }

  // Fast order status update
  async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      // Clear cache to force refresh
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  }

  // Bulk order operations
  async bulkUpdateOrderStatus(orderIds: number[], status: string): Promise<number> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return 0;
      }

      const { data, error } = await supabase.rpc('bulk_update_order_status', {
        order_ids: orderIds,
        new_status: status
      });

      if (error) throw error;

      // Clear cache
      this.clearCache();
      return data || 0;
    } catch (error) {
      console.error('Bulk update failed:', error);
      return 0;
    }
  }

  // Search orders with pagination
  async searchOrders(
    searchTerm?: string, 
    status?: string, 
    limit = 50, 
    offset = 0
  ): Promise<OptimizedOrder[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return [];
      }

      const { data, error } = await supabase.rpc('search_orders', {
        search_term: searchTerm,
        order_status: status,
        limit_count: limit,
        offset_count: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search orders failed:', error);
      return [];
    }
  }

  // Get order analytics
  async getOrderAnalytics() {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      const { data, error } = await supabase.rpc('get_order_analytics');
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Failed to get order analytics:', error);
      return null;
    }
  }

  // Clear cache
  private clearCache() {
    this.cache.clear();
  }

  // Get cached data
  getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
}

export const optimizedOrderService = new OptimizedOrderService();
