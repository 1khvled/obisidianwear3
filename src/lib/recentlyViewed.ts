'use client';

import { Product } from '@/types';

class RecentlyViewedService {
  private readonly STORAGE_KEY = 'obsidian-recently-viewed';
  private readonly MAX_ITEMS = 8;

  // Add product to recently viewed
  addProduct(product: Product): void {
    try {
      const recent = this.getRecentlyViewed();
      
      // Remove if already exists (to avoid duplicates)
      const filtered = recent.filter(p => p.id !== product.id);
      
      // Add to beginning
      const updated = [product, ...filtered].slice(0, this.MAX_ITEMS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('📱 Added to recently viewed:', product.name);
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  }

  // Get recently viewed products
  getRecentlyViewed(): Product[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  }

  // Clear recently viewed
  clearRecentlyViewed(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('📱 Cleared recently viewed');
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }

  // Get count
  getCount(): number {
    return this.getRecentlyViewed().length;
  }

  // Check if product is recently viewed
  isRecentlyViewed(productId: string): boolean {
    return this.getRecentlyViewed().some(p => p.id === productId);
  }
}

export const recentlyViewedService = new RecentlyViewedService();
export default recentlyViewedService;
