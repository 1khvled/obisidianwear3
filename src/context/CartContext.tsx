'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import cartService, { CartItem } from '@/lib/cartService';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, selectedSize: string, selectedColor: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Only use toast on client side
  let showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  try {
    const toastContext = useToast();
    showToast = toastContext.showToast;
  } catch {
    // Fallback for SSR/build time
    showToast = () => {};
  }

  useEffect(() => {
    // Load cart from database
    const loadCart = async () => {
      try {
        setLoading(true);
        const cartItems = await cartService.getCart();
        setItems(cartItems);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const addToCart = async (product: any, selectedSize: string, selectedColor: string, quantity: number) => {
    console.log('CartContext: addToCart called with:', { product, selectedSize, selectedColor, quantity });
    
    const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
    
    if (quantity > availableStock) {
      alert(`Only ${availableStock} items available in stock!`);
      return;
    }

    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedSize,
      selectedColor,
      quantity,
      availableStock
    };

    try {
      const success = await cartService.addToCart(cartItem);
      if (success) {
        // Reload cart from database
        const updatedCart = await cartService.getCart();
        setItems(updatedCart);
        // Show success toast
        showToast(`${product.name} added to cart!`, 'success');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const success = await cartService.removeFromCart(id);
      if (success) {
        // Reload cart from database
        const updatedCart = await cartService.getCart();
        setItems(updatedCart);
        showToast('Item removed from cart', 'info');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showToast('Failed to remove item from cart', 'error');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    try {
      const success = await cartService.updateCartItem(id, { quantity });
      if (success) {
        // Reload cart from database
        const updatedCart = await cartService.getCart();
        setItems(updatedCart);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const success = await cartService.clearCart();
      if (success) {
        setItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
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
      loading
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