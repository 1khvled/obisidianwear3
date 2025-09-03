'use client';

// Simple data service that uses a shared approach for cross-browser sync
// This is a demo solution - in production you'd use a real database

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
}

class SimpleDataService {
  private storageKey = 'obsidian-simple-data';
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;

  constructor() {
    this.startSync();
  }

  private startSync() {
    if (typeof window === 'undefined') return;
    
    // Sync every 3 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 3000);
  }

  private async syncData() {
    if (typeof window === 'undefined') return;
    
    try {
      // For demo purposes, we'll use a simple approach
      // In production, you'd make API calls to a real backend
      
      const localData = this.getLocalData();
      
      // Simulate checking for updates from other browsers
      // In a real app, this would be an API call
      const hasUpdates = await this.checkForRemoteUpdates();
      
      if (hasUpdates) {
        // Trigger data refresh
        window.dispatchEvent(new CustomEvent('data-refresh-requested'));
      }
      
      // Trigger sync event
      window.dispatchEvent(new CustomEvent('data-sync', {
        detail: localData
      }));
      
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async checkForRemoteUpdates(): Promise<boolean> {
    // In a real app, this would check a remote server
    // For demo purposes, we'll simulate this
    return false;
  }

  private getLocalData(): DataStorage {
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

    return {
      products: [],
      orders: [],
      customers: [],
      wilayaTariffs: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private saveLocalData(data: Partial<DataStorage>) {
    if (typeof window === 'undefined') return;

    try {
      const currentData = this.getLocalData();
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
      
      // Also trigger a custom event for cross-browser sync
      this.triggerCrossBrowserSync(updatedData);
      
      console.log('Data saved:', updatedData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private triggerCrossBrowserSync(data: DataStorage) {
    if (typeof window === 'undefined') return;
    
    // Create a custom event that can be caught by other browser instances
    // This is a simple approach for demo purposes
    const syncEvent = new CustomEvent('obsidian-data-sync', {
      detail: {
        data,
        timestamp: Date.now(),
        source: 'local'
      }
    });
    
    // Dispatch the event
    window.dispatchEvent(syncEvent);
    
    // Also try to store in a way that other browsers can detect
    // This is a hack for demo purposes - in production you'd use a real API
    try {
      // Store a sync marker that other browsers can check
      const syncMarker = {
        data,
        timestamp: Date.now(),
        version: Math.random().toString(36).substr(2, 9)
      };
      
      localStorage.setItem('obsidian-sync-marker', JSON.stringify(syncMarker));
    } catch (error) {
      console.error('Error creating sync marker:', error);
    }
  }

  // Products
  getProducts() {
    return this.getLocalData().products;
  }

  addProduct(product: any) {
    const data = this.getLocalData();
    const newProduct = {
      ...product,
      id: product.id || Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveLocalData({
      products: [...data.products, newProduct]
    });
    
    return newProduct;
  }

  updateProduct(id: string, product: any) {
    const data = this.getLocalData();
    const updatedProducts = data.products.map(p => 
      p.id === id ? { ...p, ...product, updatedAt: new Date() } : p
    );
    
    this.saveLocalData({ products: updatedProducts });
    return updatedProducts.find(p => p.id === id);
  }

  deleteProduct(id: string) {
    const data = this.getLocalData();
    const updatedProducts = data.products.filter(p => p.id !== id);
    
    this.saveLocalData({ products: updatedProducts });
    return true;
  }

  // Orders
  getOrders() {
    return this.getLocalData().orders;
  }

  addOrder(order: any) {
    const data = this.getLocalData();
    const newOrder = {
      ...order,
      id: order.id || `OBS${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      orderDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveLocalData({
      orders: [newOrder, ...data.orders]
    });
    
    return newOrder;
  }

  updateOrder(id: string, order: any) {
    const data = this.getLocalData();
    const updatedOrders = data.orders.map(o => 
      o.id === id ? { ...o, ...order, updatedAt: new Date() } : o
    );
    
    this.saveLocalData({ orders: updatedOrders });
    return updatedOrders.find(o => o.id === id);
  }

  // Customers
  getCustomers() {
    return this.getLocalData().customers;
  }

  addCustomer(customer: any) {
    const data = this.getLocalData();
    const newCustomer = {
      ...customer,
      id: customer.id || Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.saveLocalData({
      customers: [...data.customers, newCustomer]
    });
    
    return newCustomer;
  }

  // Wilaya Tariffs
  getWilayaTariffs() {
    return this.getLocalData().wilayaTariffs;
  }

  updateWilayaTariffs(tariffs: any[]) {
    this.saveLocalData({ wilayaTariffs: tariffs });
    return tariffs;
  }

  // Utility methods
  clearAllData() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('obsidian-sync-marker');
    
    window.dispatchEvent(new CustomEvent('data-cleared'));
  }

  exportData() {
    return this.getLocalData();
  }

  importData(data: DataStorage) {
    this.saveLocalData(data);
    return true;
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Create singleton instance
export const simpleDataService = new SimpleDataService();

// Export types
export type { DataStorage };
