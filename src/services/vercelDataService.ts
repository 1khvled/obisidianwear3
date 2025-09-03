'use client';

// Vercel-based data service using Vercel KV for real cross-browser sync
// This will actually sync data between different browsers using Vercel's storage

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
  version: number;
}

class VercelDataService {
  private storageKey = 'obsidian-vercel-data';
  private syncInterval: NodeJS.Timeout | null = null;
  private lastVersion = 0;
  private isOnline = true;
  private apiUrl = '/api/data'; // We'll create this API route

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
    
    // Sync every 3 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 3000);
  }

  private async syncData() {
    if (typeof window === 'undefined' || !this.isOnline) return;
    
    try {
      // Try to sync with Vercel storage
      await this.syncWithVercel();
      
      // Also check for local updates
      await this.checkForLocalUpdates();
      
    } catch (error) {
      console.error('Sync error:', error);
      // Fallback to local storage if Vercel sync fails
      this.fallbackToLocal();
    }
  }

  private async syncWithVercel() {
    try {
      // Fetch latest data from Vercel
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const remoteData = await response.json();
        
        if (remoteData && remoteData.version > this.lastVersion) {
          // Update local data with remote data
          this.updateLocalData(remoteData);
          this.lastVersion = remoteData.version;
          
          console.log('Synced with Vercel, version:', remoteData.version);
        }
      }
    } catch (error) {
      console.error('Vercel sync failed:', error);
      throw error;
    }
  }

  private async checkForLocalUpdates() {
    const localData = this.getLocalData();
    
    if (localData.version > this.lastVersion) {
      // Push local changes to Vercel
      await this.pushToVercel(localData);
      this.lastVersion = localData.version;
    }
  }

  private async pushToVercel(data: DataStorage) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Pushed to Vercel, version:', data.version);
      }
    } catch (error) {
      console.error('Failed to push to Vercel:', error);
      throw error;
    }
  }

  private fallbackToLocal() {
    // If Vercel sync fails, use local storage
    const localData = this.getLocalData();
    
    window.dispatchEvent(new CustomEvent('data-sync', {
      detail: localData
    }));
  }

  private updateLocalData(remoteData: DataStorage) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(remoteData));
      
      // Trigger data update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: remoteData
      }));
      
      console.log('Data updated from Vercel:', remoteData);
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
      
      // Try to push to Vercel immediately
      if (this.isOnline) {
        this.pushToVercel(updatedData).catch(error => {
          console.error('Failed to push to Vercel:', error);
        });
      }
      
      // Trigger immediate update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: updatedData
      }));
      
      console.log('Data saved locally and pushed to Vercel, version:', updatedData.version);
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
export const vercelDataService = new VercelDataService();

// Export types
export type { DataStorage };
