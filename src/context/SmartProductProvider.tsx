'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminProductProvider, useAdminProducts } from './ProductContext';
import { UserProductProvider, useUserProducts } from './UserProductContext';
import { OptimizedUserDataProvider, useOptimizedUserData } from './OptimizedUserDataContext';

interface SmartProductProviderProps {
  children: ReactNode;
}

export const SmartProductProvider = ({ children }: SmartProductProviderProps) => {
  const pathname = usePathname();
  
  // Admin routes use AdminProductProvider (no cache, always fresh)
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    console.log('🔧 Using AdminProductProvider (no cache)');
    return (
      <AdminProductProvider>
        {children}
      </AdminProductProvider>
    );
  }
  
  // User routes use OptimizedUserDataProvider (loads all user data at once)
  console.log('🚀 Using OptimizedUserDataProvider (loads all user data at once)');
  return (
    <OptimizedUserDataProvider>
      {children}
    </OptimizedUserDataProvider>
  );
};

// Export both hooks for convenience
export { useAdminProducts } from './ProductContext';
export { useUserProducts } from './UserProductContext';

// Legacy hook that works for both contexts
export const useProducts = () => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Only call the appropriate hook based on route
  if (isAdminRoute) {
    return useAdminProducts();
  } else {
    const optimizedData = useOptimizedUserData();
    // Return in the same format as the old UserProductContext
    return {
      products: optimizedData.products,
      loading: optimizedData.loading,
      lastUpdated: optimizedData.lastUpdated,
      timeUntilRefresh: optimizedData.timeUntilRefresh,
      refreshProducts: optimizedData.refreshAllData,
      getProduct: optimizedData.getProduct
    };
  }
};
