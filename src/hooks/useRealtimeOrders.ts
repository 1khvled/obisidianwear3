// Real-time orders hook for instant updates
import { useState, useEffect, useCallback } from 'react';
import { optimizedOrderService, OptimizedOrder } from '../lib/optimizedOrderService';

export interface UseRealtimeOrdersReturn {
  orders: OptimizedOrder[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: number, status: string) => Promise<boolean>;
  bulkUpdateStatus: (orderIds: number[], status: string) => Promise<number>;
  searchOrders: (searchTerm?: string, status?: string) => Promise<void>;
  analytics: any;
}

export function useRealtimeOrders(limit = 50, offset = 0): UseRealtimeOrdersReturn {
  const [orders, setOrders] = useState<OptimizedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersData, analyticsData] = await Promise.all([
        optimizedOrderService.getOrders(limit, offset),
        optimizedOrderService.getOrderAnalytics()
      ]);
      
      setOrders(ordersData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: number, status: string): Promise<boolean> => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: status as any, updated_at: new Date().toISOString() }
          : order
      ));

      const success = await optimizedOrderService.updateOrderStatus(orderId, status);
      
      if (!success) {
        // Revert on failure
        await loadOrders();
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to update order status:', err);
      await loadOrders(); // Revert on error
      return false;
    }
  }, [loadOrders]);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (orderIds: number[], status: string): Promise<number> => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        orderIds.includes(order.id || 0)
          ? { ...order, status: status as any, updated_at: new Date().toISOString() }
          : order
      ));

      const updatedCount = await optimizedOrderService.bulkUpdateOrderStatus(orderIds, status);
      
      if (updatedCount === 0) {
        // Revert on failure
        await loadOrders();
        return 0;
      }

      return updatedCount;
    } catch (err) {
      console.error('Bulk update failed:', err);
      await loadOrders(); // Revert on error
      return 0;
    }
  }, [loadOrders]);

  // Search orders
  const searchOrders = useCallback(async (searchTerm?: string, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await optimizedOrderService.searchOrders(searchTerm, status, limit, offset);
      setOrders(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadOrders, loading]);

  return {
    orders,
    loading,
    error,
    refreshOrders,
    updateOrderStatus,
    bulkUpdateStatus,
    searchOrders,
    analytics
  };
}
