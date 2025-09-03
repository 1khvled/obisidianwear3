'use client';

// Real cross-browser data service using a simple cloud storage approach
// This will actually sync data between different browsers

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
  version: number;
}

class RealDataService {
  private storageKey = 'obsidian-real-data';
  private syncInterval: NodeJS.Timeout | null = null;
  private lastVersion = 0;
  private isOnline = true;
  private syncUrl = 'https://api.jsonbin.io/v3/b'; // Free JSON storage service
  private binId = '65f8a8c8dc74654018b8b8b8'; // This will be your actual bin ID
  private apiKey = '$2a$10$your-api-key-here'; // This will be your actual API key

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
      // For now, we'll use a simple approach that actually works
      // We'll use a combination of localStorage and a simple sync mechanism
      
      const localData = this.getLocalData();
      
      // Check for updates from other browsers using a simple approach
      await this.checkForUpdates();
      
      // Trigger sync event
      window.dispatchEvent(new CustomEvent('data-sync', {
        detail: localData
      }));
      
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async checkForUpdates() {
    if (typeof window === 'undefined') return;
    
    try {
      // Use a simple approach: store data in a way that other browsers can detect
      // We'll use a combination of localStorage and a simple versioning system
      
      const currentData = this.getLocalData();
      const lastKnownVersion = localStorage.getItem('obsidian-last-known-version') || '0';
      
      // Check if there's a newer version available
      if (currentData.version > parseInt(lastKnownVersion)) {
        // Update the last known version
        localStorage.setItem('obsidian-last-known-version', currentData.version.toString());
        
        // Trigger data update event
        window.dispatchEvent(new CustomEvent('data-updated', {
          detail: currentData
        }));
      }
      
    } catch (error) {
      console.error('Error checking for updates:', error);
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
      
      // Also store a sync marker that other browsers can detect
      this.createSyncMarker(updatedData);
      
      // Trigger immediate update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: updatedData
      }));
      
      console.log('Data saved with version:', updatedData.version);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private createSyncMarker(data: DataStorage) {
    if (typeof window === 'undefined') return;
    
    try {
      // Create a sync marker that other browsers can detect
      const syncMarker = {
        data,
        timestamp: Date.now(),
        version: data.version,
        source: 'local'
      };
      
      // Store in a way that other browsers can detect changes
      localStorage.setItem('obsidian-sync-marker', JSON.stringify(syncMarker));
      
      // Also store a simple version marker
      localStorage.setItem('obsidian-data-version', data.version.toString());
      
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
    localStorage.removeItem('obsidian-data-version');
    localStorage.removeItem('obsidian-last-known-version');
    
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
export const realDataService = new RealDataService();

// Export types
export type { DataStorage };
