// Inventory Management Service
class InventoryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://obsidian-wear.vercel.app' 
      : 'http://localhost:3000';
  }

  private getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/api${endpoint}`;
  }

  // Get all inventory data
  async getInventory(): Promise<any[]> {
    try {
      const response = await fetch(this.getApiUrl('/inventory'));
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('InventoryService: Received non-JSON response:', {
          status: response.status,
          contentType,
          text: text.substring(0, 200)
        });
        return [];
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('InventoryService: Fetched inventory for', result.count, 'products');
        return result.data || [];
      } else {
        console.error('InventoryService: Failed to fetch inventory:', result.error);
        return [];
      }
    } catch (error) {
      console.error('InventoryService: Error fetching inventory:', error);
      return [];
    }
  }

  // Update product inventory
  async updateInventory(productId: string, stockData: any): Promise<boolean> {
    try {
      console.log('InventoryService: Updating inventory for product:', productId);
      
      const response = await fetch(this.getApiUrl(`/inventory/${productId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'obsidian-api-token-2025'}`
        },
        body: JSON.stringify(stockData)
      });
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('InventoryService: Received non-JSON response:', {
          status: response.status,
          contentType,
          text: text.substring(0, 200)
        });
        return false;
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('InventoryService: Successfully updated inventory for product:', productId);
        return true;
      } else {
        console.error('InventoryService: Failed to update inventory:', result.error);
        return false;
      }
    } catch (error) {
      console.error('InventoryService: Error updating inventory:', error);
      return false;
    }
  }

  // Update stock for specific size and color
  async updateStock(productId: string, size: string, color: string, quantity: number): Promise<boolean> {
    try {
      // First get current inventory
      const inventory = await this.getInventory();
      const product = inventory.find(p => p.id === productId);
      
      if (!product) {
        console.error('InventoryService: Product not found:', productId);
        return false;
      }
      
      // Update the stock data
      const updatedStock = { ...product.stock };
      if (!updatedStock[size]) {
        updatedStock[size] = {};
      }
      updatedStock[size][color] = quantity;
      
      // Update the inventory
      return await this.updateInventory(productId, { stock: updatedStock });
    } catch (error) {
      console.error('InventoryService: Error updating stock:', error);
      return false;
    }
  }

  // Update in-stock status
  async updateInStockStatus(productId: string, inStock: boolean): Promise<boolean> {
    try {
      return await this.updateInventory(productId, { inStock });
    } catch (error) {
      console.error('InventoryService: Error updating in-stock status:', error);
      return false;
    }
  }

  // Get total stock for a product
  calculateTotalStock(stock: any): number {
    if (!stock || typeof stock !== 'object') return 0;
    
    let total = 0;
    for (const size in stock) {
      if (typeof stock[size] === 'object') {
        for (const color in stock[size]) {
          total += Number(stock[size][color]) || 0;
        }
      }
    }
    return total;
  }

  // Get stock for specific size and color
  getStockForSizeColor(stock: any, size: string, color: string): number {
    if (!stock || !stock[size] || !stock[size][color]) return 0;
    return Number(stock[size][color]) || 0;
  }
}

export const inventoryService = new InventoryService();
