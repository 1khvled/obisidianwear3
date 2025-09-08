'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { backendService } from '@/services/backendService';
import { userCache } from '@/lib/userCache';

interface UserProductContextType {
  products: Product[];
  loading: boolean;
  lastUpdated: Date | null;
  timeUntilRefresh: number;
  refreshProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

const UserProductContext = createContext<UserProductContextType | undefined>(undefined);

export const UserProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);

  // Load products with 1-minute cache system
  const loadProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('🛒 UserProductContext: Loading products...');
      
      // ALWAYS fetch from database first, then check cache
      console.log('🌐 ALWAYS fetching fresh data from database first...');
      const freshProducts = await backendService.getProducts();
      console.log('✅ Downloaded fresh products from database:', freshProducts.length);
      
      // Check if we have valid cached data and don't need to force refresh
      if (!forceRefresh && userCache.hasValidCache()) {
        const cachedProducts = userCache.getProducts();
        if (cachedProducts) {
          console.log('✅ Using cached data (expires in', userCache.getTimeUntilExpiry(), 'seconds)');
          setProducts(cachedProducts);
          setLastUpdated(new Date());
          setTimeUntilRefresh(userCache.getTimeUntilExpiry());
          setLoading(false);
          
          // Update cache with fresh data in background
          userCache.setProducts(freshProducts);
          console.log('💾 Updated cache with fresh data for next time');
          return;
        }
      }
      
      // No valid cache, use fresh data and cache it
      console.log('🆕 No valid cache, using fresh data and caching for 1 minute');
      userCache.setProducts(freshProducts);
      
      // Update state with fresh data
      setProducts(freshProducts);
      setLastUpdated(new Date());
      setTimeUntilRefresh(60); // 1 minute
      setLoading(false);
      
    } catch (error) {
      console.error('❌ UserProductContext: Error loading products:', error);
      setLoading(false);
    }
  };

  // Refresh products (force refresh from server)
  const refreshProducts = async () => {
    console.log('🔄 UserProductContext: Force refreshing products...');
    await loadProducts(true);
  };

  // Get a specific product
  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Auto-refresh every minute
  useEffect(() => {
    // Initial load
    loadProducts();

    // Set up auto-refresh timer
    const interval = setInterval(() => {
      console.log('⏰ UserProductContext: Auto-refreshing products...');
      loadProducts(true); // Force refresh every minute
    }, 60000); // 60 seconds

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      const remaining = userCache.getTimeUntilExpiry();
      setTimeUntilRefresh(remaining);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  const value: UserProductContextType = {
    products,
    loading,
    lastUpdated,
    timeUntilRefresh,
    refreshProducts,
    getProduct
  };

  return (
    <UserProductContext.Provider value={value}>
      {children}
    </UserProductContext.Provider>
  );
};

export const useUserProducts = () => {
  const context = useContext(UserProductContext);
  if (context === undefined) {
    throw new Error('useUserProducts must be used within a UserProductProvider');
  }
  return context;
};
