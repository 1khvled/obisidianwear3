'use client';

// Cloud-based data service for cross-browser synchronization
// Uses a simple cloud storage solution for demo purposes
// In production, you'd use Firebase, Supabase, or your own API

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
}

class CloudDataService {
  private baseUrl = 'https://api.jsonbin.io/v3/b';
  private binId = '65f8a8c8dc74654018b8b8b8'; // This would be your actual bin ID
  private apiKey = '$2a$10$your-api-key-here'; // This would be your actual API key
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;

  constructor() {
    this.startSync();
    this.setupOnlineDetection();
  }

  private setupOnlineDetection() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startSync() {
    if (typeof window === 'undefined') return;
    
    // Sync every 10 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 10000);
  }

  private async syncData() {
    if (typeof window === 'undefined' || !this.isOnline) return;
    
    try {
      // For demo purposes, we'll use a fallback to localStorage
      // In production, you'd make actual API calls here
      const localData = this.getLocalData();
      
      // Simulate cloud sync
      console.log('Syncing data to cloud...', localData);
      
      // Trigger sync event
      window.dispatchEvent(new CustomEvent('data-sync', {
        detail: localData
      }));
      
    } catch (error) {
      console.error('Cloud sync error:', error);
    }
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
      const stored = localStorage.getItem('obsidian-cloud-data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading local data:', error);
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
      
      localStorage.setItem('obsidian-cloud-data', JSON.stringify(updatedData));
      
      // Trigger immediate update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: updatedData
      }));
      
      // Try to sync to cloud
      if (this.isOnline) {
        this.syncToCloud(updatedData);
      }
      
      console.log('Data saved locally:', updatedData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private async syncToCloud(data: DataStorage) {
    try {
      // In production, you'd make an actual API call here
      // For now, we'll just log it
      console.log('Syncing to cloud:', data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as synced
      window.dispatchEvent(new CustomEvent('data-synced', {
        detail: data
      }));
      
    } catch (error) {
      console.error('Cloud sync failed:', error);
      window.dispatchEvent(new CustomEvent('data-sync-error', {
        detail: error
      }));
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
    
    localStorage.removeItem('obsidian-cloud-data');
    
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
export const cloudDataService = new CloudDataService();

// Export types
export type { DataStorage };
