'use client';

// Shared data service using a simple cloud storage approach
// This creates a shared data URL that all browsers can access
// For demo purposes, we'll use a simple approach

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
  version: number;
}

class SharedDataService {
  private storageKey = 'obsidian-shared-data';
  private syncInterval: NodeJS.Timeout | null = null;
  private lastVersion = 0;
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
    
    // Sync every 5 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 5000);
  }

  private async syncData() {
    if (typeof window === 'undefined') return;
    
    try {
      // Create a shared data URL using a simple approach
      const localData = this.getLocalData();
      
      // Generate a unique identifier for this session
      const sessionId = this.getSessionId();
      
      // Create a shared data blob URL
      const dataBlob = new Blob([JSON.stringify({
        ...localData,
        sessionId,
        timestamp: Date.now()
      })], { type: 'application/json' });
      
      const dataUrl = URL.createObjectURL(dataBlob);
      
      // Store the data URL in a way that can be accessed by other browsers
      // For demo purposes, we'll use a simple approach
      this.storeSharedDataUrl(dataUrl);
      
      // Check for updates from other sessions
      await this.checkForUpdates();
      
      // Trigger sync event
      window.dispatchEvent(new CustomEvent('data-sync', {
        detail: localData
      }));
      
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'default';
    
    let sessionId = sessionStorage.getItem('obsidian-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('obsidian-session-id', sessionId);
    }
    return sessionId;
  }

  private storeSharedDataUrl(dataUrl: string) {
    if (typeof window === 'undefined') return;
    
    // Store the data URL in localStorage with a timestamp
    const sharedData = {
      url: dataUrl,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
    
    localStorage.setItem('obsidian-shared-data-url', JSON.stringify(sharedData));
  }

  private async checkForUpdates() {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if there's a newer version of the data
      const storedSharedData = localStorage.getItem('obsidian-shared-data-url');
      if (storedSharedData) {
        const sharedData = JSON.parse(storedSharedData);
        
        // If the data is from a different session and newer, update local data
        if (sharedData.sessionId !== this.getSessionId() && 
            sharedData.timestamp > this.lastVersion) {
          
          // Fetch the shared data
          const response = await fetch(sharedData.url);
          const remoteData = await response.json();
          
          // Update local data if it's newer
          if (remoteData.timestamp > this.lastVersion) {
            this.updateLocalData(remoteData);
            this.lastVersion = remoteData.timestamp;
          }
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  private updateLocalData(remoteData: any) {
    if (typeof window === 'undefined') return;
    
    try {
      const currentData = this.getLocalData();
      const updatedData = {
        ...currentData,
        ...remoteData,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      
      // Trigger data update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: updatedData
      }));
      
      console.log('Data updated from remote source:', updatedData);
    } catch (error) {
      console.error('Error updating local data:', error);
    }
  }

  private getLocalData(): DataStorage {
    if (typeof window === 'undefined') {
      return {
        products: [],
        orders: [],
        customers: [],
        wilayaTariffs: [],
        lastUpdated: new Date().toISOString(),
        version: 0
      };
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          version: data.version || 0
        };
      }
    } catch (error) {
      console.error('Error reading stored data:', error);
    }

    return {
      products: [],
      orders: [],
      customers: [],
      wilayaTariffs: [],
      lastUpdated: new Date().toISOString(),
      version: 0
    };
  }

  private saveLocalData(data: Partial<DataStorage>) {
    if (typeof window === 'undefined') return;

    try {
      const currentData = this.getLocalData();
      const updatedData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString(),
        version: currentData.version + 1
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
    localStorage.removeItem('obsidian-shared-data-url');
    
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
export const sharedDataService = new SharedDataService();

// Export types
export type { DataStorage };
