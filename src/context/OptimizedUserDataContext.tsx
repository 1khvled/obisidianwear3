'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, MadeToOrderProduct, WilayaTariff } from '@/types';
import { backendService } from '@/services/backendService';
import { userCache } from '@/lib/userCache';

interface OptimizedUserDataContextType {
  // Collection products
  products: Product[];
  // Made-to-order products
  madeToOrderProducts: MadeToOrderProduct[];
  // Wilaya tariffs for shipping
  wilayaTariffs: WilayaTariff[];
  // Loading states
  loading: boolean;
  lastUpdated: Date | null;
  timeUntilRefresh: number;
  // Actions
  refreshAllData: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getMadeToOrderProduct: (id: string) => MadeToOrderProduct | undefined;
}

const OptimizedUserDataContext = createContext<OptimizedUserDataContextType | undefined>(undefined);

export const OptimizedUserDataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [madeToOrderProducts, setMadeToOrderProducts] = useState<MadeToOrderProduct[]>([]);
  const [wilayaTariffs, setWilayaTariffs] = useState<WilayaTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);

  // Load all user-side data in one optimized call
  const loadAllUserData = async (forceRefresh = false) => {
    try {
      console.log('🚀 OptimizedUserDataContext: Loading all user data...');
      
      // Check if we have valid cached data and don't need to force refresh
      if (!forceRefresh && userCache.hasValidCache()) {
        const cachedData = userCache.getAllUserData();
        if (cachedData) {
          console.log('✅ Using cached user data (expires in', userCache.getTimeUntilExpiry(), 'seconds)');
          setProducts(cachedData.products || []);
          setMadeToOrderProducts(cachedData.madeToOrderProducts || []);
          setWilayaTariffs(cachedData.wilayaTariffs || []);
          setLastUpdated(new Date());
          setTimeUntilRefresh(userCache.getTimeUntilExpiry());
          setLoading(false);
          
          // Update cache with fresh data in background (no loading state)
          console.log('🔄 Updating cache in background...');
          fetchAndCacheFreshData().catch(error => {
            console.error('❌ Background cache update failed:', error);
          });
          return;
        }
      }
      
      // No valid cache, fetch fresh data
      console.log('🆕 No valid cache, fetching fresh data and caching for 1 minute');
      setLoading(true);
      await fetchAndCacheFreshData();
      
    } catch (error) {
      console.error('❌ OptimizedUserDataContext: Error loading user data:', error);
      setLoading(false);
    }
  };

  // Fetch fresh data from all sources and cache it
  const fetchAndCacheFreshData = async () => {
    try {
      console.log('🌐 Fetching fresh data from all sources...');
      
      // Fetch only essential data first (products) for faster initial load
      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();
      
      // Extract products from the API response
      const products = productsData.success ? productsData.data : [];
      
      console.log('✅ Downloaded products:', products.length);
      
      // Update state with products immediately for faster UI
      setProducts(products);
      setLastUpdated(new Date());
      setTimeUntilRefresh(300); // 5 minutes
      setLoading(false);
      
      // Cache the products immediately
      userCache.setAllUserData({
        products,
        madeToOrderProducts: [],
        wilayaTariffs: []
      });
      
      // Load additional data in background (non-blocking)
      Promise.all([
        fetch('/api/made-to-order').then(res => res.json()).catch(() => []),
        backendService.getWilayaTariffs().catch(() => [])
      ]).then(([madeToOrderData, wilayaData]) => {
        console.log('✅ Downloaded additional data:', {
          madeToOrder: madeToOrderData.length,
          wilayas: wilayaData.length
        });
        
        // Update state with additional data
        setMadeToOrderProducts(madeToOrderData);
        setWilayaTariffs(wilayaData);
        
        // Update cache with complete data
        userCache.setAllUserData({
          products,
          madeToOrderProducts: madeToOrderData,
          wilayaTariffs: wilayaData
        });
      }).catch(error => {
        console.error('❌ Background data fetch failed:', error);
      });
      
    } catch (error) {
      console.error('❌ Error fetching fresh data:', error);
      setLoading(false);
    }
  };

  // Refresh all data (force refresh from server)
  const refreshAllData = async () => {
    console.log('🔄 OptimizedUserDataContext: Force refreshing all data...');
    await loadAllUserData(true);
  };

  // Get a specific collection product
  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Get a specific made-to-order product
  const getMadeToOrderProduct = (id: string) => {
    return madeToOrderProducts.find(product => product.id === id);
  };

  // Auto-refresh every minute
  useEffect(() => {
    // Initial load
    loadAllUserData();

    // Set up auto-refresh timer
    const interval = setInterval(() => {
      console.log('⏰ OptimizedUserDataContext: Auto-refreshing all data...');
      loadAllUserData(true); // Force refresh every minute
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

  const value: OptimizedUserDataContextType = {
    products,
    madeToOrderProducts,
    wilayaTariffs,
    loading,
    lastUpdated,
    timeUntilRefresh,
    refreshAllData,
    getProduct,
    getMadeToOrderProduct
  };

  return (
    <OptimizedUserDataContext.Provider value={value}>
      {children}
    </OptimizedUserDataContext.Provider>
  );
};

export const useOptimizedUserData = () => {
  const context = useContext(OptimizedUserDataContext);
  if (context === undefined) {
    throw new Error('useOptimizedUserData must be used within an OptimizedUserDataProvider');
  }
  return context;
};
