// Cart service that stores cart data in database for cross-device sync
import { supabase } from './supabaseDatabase';

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
  userId?: string; // Optional user ID for future user accounts
}

export interface Cart {
  id: string;
  items: CartItem[];
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

class CartService {
  private static instance: CartService;
  private sessionId: string;
  private cache: Cart | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor() {
    // Generate a unique session ID for this browser session
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  private generateSessionId(): string {
    // Generate a unique session ID that persists for this browser session
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('obsidian-cart-session-id');
      if (!sessionId) {
        sessionId = 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('obsidian-cart-session-id', sessionId);
      }
      return sessionId;
    }
    return 'server_' + Date.now();
  }

  async getCart(): Promise<CartItem[]> {
    // Check cache first
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache.items;
    }

    try {
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', this.sessionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching cart:', error);
        return [];
      }

      if (data) {
        this.cache = data;
        this.cacheTime = now;
        return data.items || [];
      }

      // No cart found, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  async addToCart(item: Omit<CartItem, 'id'>): Promise<boolean> {
    try {
      const currentCart = await this.getCart();
      
      // Check if item already exists with same product, size, and color
      const existingItemIndex = currentCart.findIndex(
        cartItem => 
          cartItem.productId === item.productId && 
          cartItem.selectedSize === item.selectedSize && 
          cartItem.selectedColor === item.selectedColor
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...currentCart];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        updatedItems = [...currentCart, newItem];
      }

      // Save to database
      const { error } = await supabase
        .from('carts')
        .upsert({
          session_id: this.sessionId,
          items: updatedItems,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving cart:', error);
        return false;
      }

      // Clear cache to force refresh
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  async updateCartItem(itemId: string, updates: Partial<CartItem>): Promise<boolean> {
    try {
      const currentCart = await this.getCart();
      const itemIndex = currentCart.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        return false;
      }

      const updatedItems = [...currentCart];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };

      // Save to database
      const { error } = await supabase
        .from('carts')
        .upsert({
          session_id: this.sessionId,
          items: updatedItems,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating cart item:', error);
        return false;
      }

      // Clear cache
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }

  async removeFromCart(itemId: string): Promise<boolean> {
    try {
      const currentCart = await this.getCart();
      const updatedItems = currentCart.filter(item => item.id !== itemId);

      // Save to database
      const { error } = await supabase
        .from('carts')
        .upsert({
          session_id: this.sessionId,
          items: updatedItems,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }

      // Clear cache
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  async clearCart(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('session_id', this.sessionId);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      // Clear cache
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  async getCartTotal(): Promise<number> {
    const items = await this.getCart();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async getCartItemCount(): Promise<number> {
    const items = await this.getCart();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}

export default CartService.getInstance();
