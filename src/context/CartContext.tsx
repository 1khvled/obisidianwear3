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
  availableStock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, selectedSize: string, selectedColor: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('obsidian-cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('obsidian-cart', JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (product: any, selectedSize: string, selectedColor: string, quantity: number) => {
    console.log('CartContext: addToCart called with:', { product, selectedSize, selectedColor, quantity });
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= existingItem.availableStock) {
          return prevItems.map(item =>
            item.id === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          alert(`Only ${existingItem.availableStock} items available in stock!`);
          return prevItems;
        }
      } else {
        // Add new item
        const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
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
            availableStock
          };
          return [...prevItems, newItem];
        } else {
          alert(`Only ${availableStock} items available in stock!`);
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

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          if (quantity <= item.availableStock) {
            return { ...item, quantity };
          } else {
            alert(`Only ${item.availableStock} items available in stock!`);
            return item;
          }
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
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
      getTotalPrice
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
