'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOptimizedApp } from './OptimizedAppProvider';

// Create compatibility contexts for old components
const DesignContext = createContext<any>(null);
const AuthContext = createContext<any>(null);
const CartContext = createContext<any>(null);
const LanguageContext = createContext<any>(null);
const ThemeContext = createContext<any>(null);

// Compatibility providers that use the optimized app context
export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const { isStreetwear, setTheme } = useOptimizedApp();
  
  const value = {
    isStreetwear,
    setIsStreetwear: () => {}, // No-op for compatibility
    theme: 'dark', // Default theme
    setTheme
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, username, login, logout } = useOptimizedApp();
  
  const value = {
    isAuthenticated,
    username,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { cartItems, cartTotal, addToCart, removeFromCart } = useOptimizedApp();
  
  const value = {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart: () => {}, // No-op for compatibility
    updateQuantity: () => {} // No-op for compatibility
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { language, setLanguage } = useOptimizedApp();
  
  const value = {
    language,
    setLanguage,
    t: (key: string) => key // Simple translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useOptimizedApp();
  
  const value = {
    theme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Compatibility hooks
export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    // Return default values if context is not available
    return {
      isStreetwear: false,
      setIsStreetwear: () => {},
      theme: 'dark',
      setTheme: () => {}
    };
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      isAuthenticated: false,
      username: null,
      login: () => {},
      logout: () => {}
    };
  }
  return context;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      cartTotal: 0,
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      updateQuantity: () => {}
    };
  }
  return context;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'fr',
      setLanguage: () => {},
      t: (key: string) => key
    };
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      setTheme: () => {}
    };
  }
  return context;
};

// Compatibility for OptimizedUserData
export const useOptimizedUserData = () => {
  const { products, madeToOrderProducts, wilayaTariffs, loading, lastUpdated } = useOptimizedApp();
  
  return {
    products,
    madeToOrderProducts,
    wilayaTariffs,
    loading,
    lastUpdated,
    refreshAllData: () => Promise.resolve()
  };
};
