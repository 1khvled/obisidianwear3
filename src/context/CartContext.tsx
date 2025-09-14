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
  addToCart: (product: any, selectedSize: string, selectedColor: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
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

  const addToCart = async (product: any, selectedSize: string, selectedColor: string, quantity: number) => {
    console.log('CartContext: addToCart called with:', { product, selectedSize, selectedColor, quantity });
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    
    try {
      // Check if this is a made-to-order product (no stock property)
      const isMadeToOrder = !product.stock;
      
      if (isMadeToOrder) {
        alert('Made-to-order products cannot be added to cart. Please use the "Order Now" button to place your order.');
        return;
      }
      
      if (!isMadeToOrder) {
        // Simple stock check - no reservation, just check if available
        const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
        
        // Check if the specific size/color combination is available
        if (availableStock === 0) {
          alert(`❌ Size ${selectedSize} in ${selectedColor} is OUT OF STOCK!`);
          return;
        }
        
        // Check if requested quantity exceeds available stock
        if (quantity > availableStock) {
          alert(`❌ Not enough stock available in ${selectedSize} ${selectedColor}! Only ${availableStock} available.`);
          return;
        }

        console.log('✅ Stock check passed - adding to cart');
      } else {
        console.log('✅ Made-to-order product - no stock check needed');
      }

      // If inventory reservation successful (or skipped for made-to-order), add to cart
      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === cartItemId);
        
        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + quantity;
          return prevItems.map(item =>
            item.id === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          // Add new item
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
      });

      console.log('✅ Item added to cart and inventory reserved');
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('❌ Failed to add item to cart. Please try again.');
    }
  };

  const removeFromCart = async (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;

    // Note: Inventory table has been removed - all inventory data is now stored in products table
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    console.log('✅ Item removed from cart');
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    const item = items.find(item => item.id === id);
    if (!item) return;

    const currentQuantity = item.quantity;
    const quantityDifference = quantity - currentQuantity;

    if (quantityDifference === 0) return; // No change needed

    try {
      // For regular products, we'll skip the stock check during quantity updates
      // since the item is already in the cart and stock was checked during add
        // Note: Inventory table has been removed - all inventory data is now stored in products table
        // Stock management is handled at checkout time

      // Update the cart
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      );

      console.log('✅ Quantity updated and inventory synced');
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      alert('❌ Failed to update quantity. Please try again.');
    }
  };

  const clearCart = async () => {
    // Note: Inventory table has been removed - all inventory data is now stored in products table
    // Stock management is handled at checkout time, no need to restore here
    
    setItems([]);
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obsidian-cart');
    }
    
    console.log('✅ Cart cleared');
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
