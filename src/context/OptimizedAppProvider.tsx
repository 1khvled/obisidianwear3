'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, MadeToOrderProduct, WilayaTariff, Order } from '@/types';
import { backendService } from '@/services/backendService';
import { userCache } from '@/lib/userCache';

// Combined state interface
interface OptimizedAppState {
  // Theme & Design
  theme: 'dark' | 'light';
  isStreetwear: boolean;
  
  // Language
  language: 'en' | 'fr';
  
  // Auth
  isAuthenticated: boolean;
  username: string | null;
  
  // Products & Data
  products: Product[];
  madeToOrderProducts: MadeToOrderProduct[];
  wilayaTariffs: WilayaTariff[];
  
  // Cart
  cartItems: any[];
  cartTotal: number;
  
  // Loading states
  loading: boolean;
  lastUpdated: Date | null;
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (lang: 'en' | 'fr') => void;
  login: (username: string) => void;
  logout: () => void;
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  refreshData: () => Promise<void>;
}

const OptimizedAppContext = createContext<OptimizedAppState | undefined>(undefined);

export const OptimizedAppProvider = ({ children }: { children: ReactNode }) => {
  // Combined state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isStreetwear, setIsStreetwear] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [madeToOrderProducts, setMadeToOrderProducts] = useState<MadeToOrderProduct[]>([]);
  const [wilayaTariffs, setWilayaTariffs] = useState<WilayaTariff[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Memoized cart total
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Optimized data loading
  const loadData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && userCache.hasValidCache()) {
        const cachedData = userCache.getAllUserData();
        if (cachedData) {
          setProducts(cachedData.products || []);
          setMadeToOrderProducts(cachedData.madeToOrderProducts || []);
          setWilayaTariffs(cachedData.wilayaTariffs || []);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      
      // Load products first (most critical)
      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();
      const loadedProducts = productsData.success ? productsData.data : [];
      
      setProducts(loadedProducts);
      setLastUpdated(new Date());
      setLoading(false);

      // Load other data in background
      Promise.all([
        fetch('/api/made-to-order').then(r => r.json()),
        backendService.getWilayaTariffs()
      ]).then(([madeToOrderData, wilayaData]) => {
        const madeToOrder = Array.isArray(madeToOrderData) ? madeToOrderData : (madeToOrderData?.data || []);
        setMadeToOrderProducts(madeToOrder);
        setWilayaTariffs(wilayaData);
        
        // Update cache
        userCache.setAllUserData({
          products: loadedProducts,
          madeToOrderProducts: madeToOrder,
          wilayaTariffs: wilayaData
        });
      }).catch(console.error);

    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Actions
  const login = (user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('admin_username', user);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('admin_username');
  };

  const addToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const refreshData = async () => {
    await loadData(true);
  };

  // Initialize
  useEffect(() => {
    // Check auth
    const savedUsername = localStorage.getItem('admin_username');
    if (savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }

    // Load data
    loadData();
  }, []);

  // Memoized context value
  const value = useMemo(() => ({
    theme,
    isStreetwear,
    language,
    isAuthenticated,
    username,
    products,
    madeToOrderProducts,
    wilayaTariffs,
    cartItems,
    cartTotal,
    loading,
    lastUpdated,
    setTheme,
    setLanguage,
    login,
    logout,
    addToCart,
    removeFromCart,
    refreshData
  }), [
    theme, isStreetwear, language, isAuthenticated, username,
    products, madeToOrderProducts, wilayaTariffs, cartItems,
    cartTotal, loading, lastUpdated
  ]);

  return (
    <OptimizedAppContext.Provider value={value}>
      {children}
    </OptimizedAppContext.Provider>
  );
};

export const useOptimizedApp = () => {
  const context = useContext(OptimizedAppContext);
  if (context === undefined) {
    throw new Error('useOptimizedApp must be used within an OptimizedAppProvider');
  }
  return context;
};
