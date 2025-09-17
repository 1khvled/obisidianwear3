'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Minimal context for essential functionality only
interface LightweightContextType {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Language
  language: 'en' | 'fr';
  toggleLanguage: () => void;
  
  // Cart
  cart: any[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  // Auth
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
  
  // Products (minimal)
  products: any[];
  loading: boolean;
}

const LightweightContext = createContext<LightweightContextType | undefined>(undefined);

export const useLightweight = () => {
  const context = useContext(LightweightContext);
  if (!context) {
    throw new Error('useLightweight must be used within LightweightProvider');
  }
  return context;
};

interface LightweightProviderProps {
  children: ReactNode;
}

export const LightweightProvider: React.FC<LightweightProviderProps> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Language state
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  
  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as 'en' | 'fr' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Load auth from localStorage
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const { isAuthenticated: auth, username: user } = JSON.parse(savedAuth);
      setIsAuthenticated(auth);
      setUsername(user);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load products (minimal)
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=20', {
          cache: 'force-cache', // Use cached data
        });
        const data = await response.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Theme functions
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Language functions
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'fr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Cart functions
  const addToCart = (item: any) => {
    setCart(prev => {
      const newCart = [...prev, { ...item, id: Date.now().toString() }];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Auth functions
  const login = (user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('auth', JSON.stringify({ isAuthenticated: true, username: user }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('auth');
  };

  const value: LightweightContextType = {
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    isAuthenticated,
    username,
    login,
    logout,
    products,
    loading,
  };

  return (
    <LightweightContext.Provider value={value}>
      {children}
    </LightweightContext.Provider>
  );
};
