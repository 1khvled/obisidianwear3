'use client';

// Simple data persistence service using localStorage with cross-browser sync
// This simulates a backend API for demo purposes
// In production, you'd replace this with a real API

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
}

class DataService {
  private storageKey = 'obsidian-shared-data';
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic sync (every 5 seconds)
    this.startSync();
    
    // Listen for storage changes from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  private startSync() {
    if (typeof window === 'undefined') return;
    
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 5000); // Sync every 5 seconds
  }

  private handleStorageChange(e: StorageEvent) {
    if (e.key === this.storageKey && e.newValue) {
      // Data was updated in another tab, trigger a refresh
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: JSON.parse(e.newValue)
      }));
    }
  }

  private syncData() {
    if (typeof window === 'undefined') return;
    
    try {
      const currentData = this.getData();
      const lastSync = localStorage.getItem('obsidian-last-sync');
      const now = new Date().toISOString();
      
      // Update last sync time
      localStorage.setItem('obsidian-last-sync', now);
      
      // Trigger data update event
      window.dispatchEvent(new CustomEvent('data-sync', {
        detail: currentData
      }));
    } catch (error) {
      console.error('Data sync error:', error);
    }
  }

  private getData(): DataStorage {
    if (typeof window === 'undefined') {
      return {
        products: [],
        orders: [],
        customers: [],
        wilayaTariffs: [],
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading stored data:', error);
    }

    // Return default data structure
    return {
      products: [],
      orders: [],
      customers: [],
      wilayaTariffs: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private saveData(data: Partial<DataStorage>) {
    if (typeof window === 'undefined') return;

    try {
      const currentData = this.getData();
      const updatedData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      
      // Trigger immediate update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: updatedData
      }));
      
      console.log('Data saved:', updatedData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Products
  getProducts() {
    return this.getData().products;
  }

  addProduct(product: any) {
    const data = this.getData();
    const newProduct = {
      ...product,
      id: product.id || Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveData({
      products: [...data.products, newProduct]
    });
    
    return newProduct;
  }

  updateProduct(id: string, product: any) {
    const data = this.getData();
    const updatedProducts = data.products.map(p => 
      p.id === id ? { ...p, ...product, updatedAt: new Date() } : p
    );
    
    this.saveData({ products: updatedProducts });
    return updatedProducts.find(p => p.id === id);
  }

  deleteProduct(id: string) {
    const data = this.getData();
    const updatedProducts = data.products.filter(p => p.id !== id);
    
    this.saveData({ products: updatedProducts });
    return true;
  }

  // Orders
  getOrders() {
    return this.getData().orders;
  }

  addOrder(order: any) {
    const data = this.getData();
    const newOrder = {
      ...order,
      id: order.id || `OBS${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveData({
      orders: [newOrder, ...data.orders] // Add to beginning for newest first
    });
    
    return newOrder;
  }

  updateOrder(id: string, order: any) {
    const data = this.getData();
    const updatedOrders = data.orders.map(o => 
      o.id === id ? { ...o, ...order, updatedAt: new Date() } : o
    );
    
    this.saveData({ orders: updatedOrders });
    return updatedOrders.find(o => o.id === id);
  }

  // Customers
  getCustomers() {
    return this.getData().customers;
  }

  addCustomer(customer: any) {
    const data = this.getData();
    const newCustomer = {
      ...customer,
      id: customer.id || Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveData({
      customers: [...data.customers, newCustomer]
    });
    
    return newCustomer;
  }

  // Wilaya Tariffs
  getWilayaTariffs() {
    return this.getData().wilayaTariffs;
  }

  updateWilayaTariffs(tariffs: any[]) {
    this.saveData({ wilayaTariffs: tariffs });
    return tariffs;
  }

  // Utility methods
  clearAllData() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('obsidian-last-sync');
    
    // Trigger data cleared event
    window.dispatchEvent(new CustomEvent('data-cleared'));
  }

  exportData() {
    return this.getData();
  }

  importData(data: DataStorage) {
    this.saveData(data);
    return true;
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
  }
}

// Create singleton instance
export const dataService = new DataService();

// Export types
export type { DataStorage };
