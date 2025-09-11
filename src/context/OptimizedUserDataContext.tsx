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

  // Progressive loading system - load landing page first, then everything else
  const loadAllUserData = async (forceRefresh = false) => {
    try {
      console.log('🚀 OptimizedUserDataContext: Starting progressive loading...');
      
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
          loadDataProgressively().catch(error => {
            console.error('❌ Background cache update failed:', error);
          });
          return;
        }
      }
      
      // No valid cache, start progressive loading
      console.log('🆕 No valid cache, starting progressive loading...');
      setLoading(true);
      await loadDataProgressively();
      
    } catch (error) {
      console.error('❌ OptimizedUserDataContext: Error loading user data:', error);
      setLoading(false);
    }
  };

  // Progressive loading system - load data piece by piece
  const loadDataProgressively = async () => {
    try {
      console.log('🌐 Starting progressive data loading...');
      
      // STEP 1: Load products first (most important for landing page)
      console.log('📦 Step 1: Loading products...');
      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();
      const products = productsData.success ? productsData.data : [];
      
      console.log('✅ Products loaded:', products.length);
      
      // Update UI immediately with products
      setProducts(products);
      setLastUpdated(new Date());
      setTimeUntilRefresh(300); // 5 minutes
      setLoading(false); // Landing page is now ready!
      
      // Cache products immediately
      userCache.setAllUserData({
        products,
        madeToOrderProducts: [], // Will be updated when made-to-order products load
        wilayaTariffs: []
      });
      
      // STEP 2: Load made-to-order products in background (immediately, no delay)
      try {
        console.log('🎨 Step 2: Loading made-to-order products...');
        const madeToOrderResponse = await fetch('/api/made-to-order');
        const madeToOrderData = await madeToOrderResponse.json();
        const madeToOrderProducts = Array.isArray(madeToOrderData) ? madeToOrderData : [];
        
        console.log('✅ Made-to-order products loaded:', madeToOrderProducts.length);
        
        // Update UI with made-to-order products
        setMadeToOrderProducts(madeToOrderProducts);
        
        // Update cache with made-to-order products
        userCache.setAllUserData({
          products,
          madeToOrderProducts,
          wilayaTariffs: []
        });
      } catch (error) {
        console.error('❌ Made-to-order loading failed:', error);
      }
      
      // STEP 3: Load wilaya data in background (after 2 seconds delay)
      setTimeout(async () => {
        try {
          console.log('🗺️ Step 3: Loading wilaya data...');
          const wilayaData = await backendService.getWilayaTariffs();
          
          console.log('✅ Wilaya data loaded:', wilayaData.length);
          
          // Update UI with wilaya data
          setWilayaTariffs(wilayaData);
          
          // Update cache with complete data
          userCache.setAllUserData({
            products,
            madeToOrderProducts: madeToOrderProducts, // Use the actual loaded products
            wilayaTariffs: wilayaData
          });
        } catch (error) {
          console.error('❌ Wilaya loading failed:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error in progressive loading:', error);
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
