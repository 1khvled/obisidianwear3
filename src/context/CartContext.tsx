'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  addedAt: string; // Timestamp when item was added
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, selectedSize: string, selectedColor: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartLoaded: boolean;
  cartError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const savedCart = localStorage.getItem('obsidian-cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          
          // Validate cart data structure
          if (Array.isArray(parsedCart)) {
            // Add addedAt timestamp to items that don't have it (for backward compatibility)
            const validatedCart = parsedCart.map((item: any) => ({
              ...item,
              addedAt: item.addedAt || new Date().toISOString()
            }));
            
            setItems(validatedCart);
            console.log('Cart loaded from localStorage:', validatedCart.length, 'items');
          } else {
            console.warn('Invalid cart data structure, clearing cart');
            localStorage.removeItem('obsidian-cart');
          }
        }
        setCartError(null);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCartError('Failed to load cart data');
        // Clear corrupted data
        localStorage.removeItem('obsidian-cart');
      } finally {
        setIsCartLoaded(true);
      }
    };

    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isCartLoaded || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('obsidian-cart', JSON.stringify(items));
      console.log('Cart saved to localStorage:', items.length, 'items');
      setCartError(null);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      setCartError('Failed to save cart data');
    }
  }, [items, isCartLoaded]);

  const addToCart = (product: any, selectedSize: string, selectedColor: string, quantity: number) => {
    console.log('CartContext: addToCart called with:', { product, selectedSize, selectedColor, quantity });
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        // Check stock availability without exposing numbers
        const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 999;
        if (newQuantity <= availableStock) {
          return prevItems.map(item =>
            item.id === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          alert('This item is not available in the selected size and color!');
          return prevItems;
        }
      } else {
        // Add new item
        const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
        
        // If no stock data exists for this product at all, assume unlimited stock
        if (!product.stock) {
          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            selectedSize,
            selectedColor,
            quantity,
            addedAt: new Date().toISOString()
          };
          return [...prevItems, newItem];
        }
        
        // If stock data exists but this specific size/color combination doesn't, 
        // check if the size exists and use any available color's stock as fallback
        if (availableStock === 0 && product.stock[selectedSize]) {
          const fallbackStock = Math.max(...Object.values(product.stock[selectedSize]));
          if (fallbackStock > 0) {
            const newItem: CartItem = {
              id: cartItemId,
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              selectedSize,
              selectedColor,
              quantity,
              addedAt: new Date().toISOString()
            };
            return [...prevItems, newItem];
          }
        }
        
        if (quantity <= availableStock) {
          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            selectedSize,
            selectedColor,
            quantity,
            addedAt: new Date().toISOString()
          };
          return [...prevItems, newItem];
        } else {
          alert('This item is not available in the selected size and color!');
          return prevItems;
        }
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // For quantity updates, we'll allow reasonable quantities without exposing stock
    // Set a reasonable limit (e.g., 10 items max per product)
    const maxQuantityPerItem = 10;
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          if (quantity <= maxQuantityPerItem) {
            return { ...item, quantity };
          } else {
            alert(`Maximum ${maxQuantityPerItem} items allowed per product!`);
            return item;
          }
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obsidian-cart');
    }
  };

  // Function to clear cart data (useful for debugging or reset)
  const clearCartData = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obsidian-cart');
    }
    setCartError(null);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isCartLoaded,
      cartError
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
