'use client';

// GitHub-based data service for real cross-browser sync
// Uses GitHub's free API to store data in a repository

interface DataStorage {
  products: any[];
  orders: any[];
  customers: any[];
  wilayaTariffs: any[];
  lastUpdated: string;
  version: number;
}

class GitHubDataService {
  private storageKey = 'obsidian-github-data';
  private syncInterval: NodeJS.Timeout | null = null;
  private lastVersion = 0;
  private isOnline = true;
  
  // GitHub API configuration
  private owner = '1khvled'; // Your GitHub username
  private repo = 'obisidianwear_dz'; // Your repository name
  private filePath = 'data.json'; // File to store data in
  private token = 'ghp_your_token_here'; // You'll need to create a personal access token

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
    
    // Sync every 10 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 10000);
  }

  private async syncData() {
    if (typeof window === 'undefined' || !this.isOnline) return;
    
    try {
      // Try to sync with GitHub
      await this.syncWithGitHub();
      
    } catch (error) {
      console.error('GitHub sync error:', error);
      // Fallback to local storage
      this.fallbackToLocal();
    }
  }

  private async syncWithGitHub() {
    try {
      // First, try to get the current file from GitHub
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`
          }
        }
      );

      if (response.ok) {
        const fileData = await response.json();
        const content = JSON.parse(atob(fileData.content));
        
        if (content && content.version > this.lastVersion) {
          // Update local data with GitHub data
          this.updateLocalData(content);
          this.lastVersion = content.version;
          
          console.log('Synced with GitHub, version:', content.version);
        }
      } else if (response.status === 404) {
        // File doesn't exist yet, create it
        await this.createGitHubFile();
      }
      
    } catch (error) {
      console.error('GitHub sync failed:', error);
      throw error;
    }
  }

  private async createGitHubFile() {
    const localData = this.getLocalData();
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Initialize data storage',
            content: btoa(JSON.stringify(localData, null, 2))
          })
        }
      );

      if (response.ok) {
        console.log('Created GitHub data file');
      }
    } catch (error) {
      console.error('Failed to create GitHub file:', error);
    }
  }

  private async pushToGitHub(data: DataStorage) {
    try {
      // First get the current file to get the SHA
      const getResponse = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`
          }
        }
      );

      let sha = '';
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }

      // Update the file
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update data - version ${data.version}`,
            content: btoa(JSON.stringify(data, null, 2)),
            sha: sha
          })
        }
      );

      if (response.ok) {
        console.log('Pushed to GitHub, version:', data.version);
      }
    } catch (error) {
      console.error('Failed to push to GitHub:', error);
      throw error;
    }
  }

  private fallbackToLocal() {
    // If GitHub sync fails, use local storage
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
      
      console.log('Data updated from GitHub:', remoteData);
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
      
      // Try to push to GitHub immediately
      if (this.isOnline) {
        this.pushToGitHub(updatedData).catch(error => {
          console.error('Failed to push to GitHub:', error);
        });
      }
      
      // Trigger immediate update event
      window.dispatchEvent(new CustomEvent('data-updated', {
        detail: updatedData
      }));
      
      console.log('Data saved locally and pushed to GitHub, version:', updatedData.version);
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
export const githubDataService = new GitHubDataService();

// Export types
export type { DataStorage };
