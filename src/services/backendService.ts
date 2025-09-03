import { Product, Order } from '@/types';

// Backend API service using Vercel serverless functions
class BackendService {
  private baseUrl = '/api';

  // Check if we're in a browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Products API
  async getProducts(): Promise<Product[]> {
    if (!this.isBrowser()) {
      console.log('BackendService: Not in browser, returning empty array');
      return [];
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/products`);
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Fetched', result.count, 'products');
        return result.data || [];
      } else {
        console.error('BackendService: Failed to fetch products:', result.error);
        return [];
      }
    } catch (error) {
      console.error('BackendService: Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    if (!this.isBrowser()) {
      return null;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Fetched product:', id);
        return result.data;
      } else {
        console.error('BackendService: Failed to fetch product:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error fetching product:', error);
      return null;
    }
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Created product:', result.data.id);
        return result.data;
      } else {
        console.error('BackendService: Failed to create product:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error creating product:', error);
      return null;
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Updated product:', id);
        return result.data;
      } else {
        console.error('BackendService: Failed to update product:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Deleted product:', id);
        return true;
      } else {
        console.error('BackendService: Failed to delete product:', result.error);
        return false;
      }
    } catch (error) {
      console.error('BackendService: Error deleting product:', error);
      return false;
    }
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    if (!this.isBrowser()) {
      return [];
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/orders`);
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Fetched', result.count, 'orders');
        return result.data || [];
      } else {
        console.error('BackendService: Failed to fetch orders:', result.error);
        return [];
      }
    } catch (error) {
      console.error('BackendService: Error fetching orders:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Fetched order:', id);
        return result.data;
      } else {
        console.error('BackendService: Failed to fetch order:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error fetching order:', error);
      return null;
    }
  }

  async addOrder(order: Omit<Order, 'id'>): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Created order:', result.data.id);
        return result.data;
      } else {
        console.error('BackendService: Failed to create order:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error creating order:', error);
      return null;
    }
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Updated order:', id);
        return result.data;
      } else {
        console.error('BackendService: Failed to update order:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error updating order:', error);
      return null;
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Deleted order:', id);
        return true;
      } else {
        console.error('BackendService: Failed to delete order:', result.error);
        return false;
      }
    } catch (error) {
      console.error('BackendService: Error deleting order:', error);
      return false;
    }
  }

  // Customers API
  async getCustomers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`);
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Fetched', result.count, 'customers');
        return result.data || [];
      } else {
        console.error('BackendService: Failed to fetch customers:', result.error);
        return [];
      }
    } catch (error) {
      console.error('BackendService: Error fetching customers:', error);
      return [];
    }
  }

  async addCustomer(customer: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Created customer:', result.data.id);
        return result.data;
      } else {
        console.error('BackendService: Failed to create customer:', result.error);
        return null;
      }
    } catch (error) {
      console.error('BackendService: Error creating customer:', error);
      return null;
    }
  }

  // Wilaya API
  async getWilayaTariffs(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wilaya`);
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Fetched', result.count, 'wilaya tariffs');
        return result.data || [];
      } else {
        console.error('BackendService: Failed to fetch wilaya tariffs:', result.error);
        return [];
      }
    } catch (error) {
      console.error('BackendService: Error fetching wilaya tariffs:', error);
      return [];
    }
  }

  async updateWilayaTariffs(tariffs: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wilaya`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tariffs)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('BackendService: Updated wilaya tariffs');
        return true;
      } else {
        console.error('BackendService: Failed to update wilaya tariffs:', result.error);
        return false;
      }
    } catch (error) {
      console.error('BackendService: Error updating wilaya tariffs:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendService = new BackendService();
