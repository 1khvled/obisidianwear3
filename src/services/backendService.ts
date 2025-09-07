import { Product, Order } from '@/types';

// Backend API service using Vercel serverless functions
class BackendService {
  private baseUrl = '/api';
  
  // Get the full URL for API calls
  private getApiUrl(path: string): string {
    // If we're in the browser, use relative URLs
    if (typeof window !== 'undefined') {
      return `${this.baseUrl}${path}`;
    }
    
    // If we're on the server, we need to construct the full URL
    // This is a fallback - in most cases, this service should only be called from the client
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    return `${protocol}://${host}${this.baseUrl}${path}`;
  }

  // Check if we're in a browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof fetch !== 'undefined';
  }

  // Get authentication headers for protected API calls
  private getAuthHeaders(): HeadersInit {
    const token = process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'obsidian-api-token-2025';
    console.log('🔧 BackendService: Using auth token:', token);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Products API
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(this.getApiUrl('/products'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=30'
        },
        next: { revalidate: 30 } // Next.js caching
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
    try {
      const response = await fetch(this.getApiUrl(`/products/${id}`));
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
      console.log('🔧 BackendService: addProduct called with:', product);
      console.log('🔧 BackendService: API URL:', this.getApiUrl('/products'));
      console.log('🔧 BackendService: Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(this.getApiUrl('/products'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(product)
      });
      
      console.log('🔧 BackendService: Response status:', response.status);
      console.log('🔧 BackendService: Response ok:', response.ok);
      
      const result = await response.json();
      console.log('🔧 BackendService: Response data:', result);
      
      if (result.success) {
        console.log('✅ BackendService: Created product:', result.data.id);
        return result.data;
      } else {
        console.error('❌ BackendService: Failed to create product:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ BackendService: Error creating product:', error);
      return null;
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      const response = await fetch(this.getApiUrl(`/products/${id}`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(this.getApiUrl(`/products/${id}`), {
        method: 'DELETE',
        headers: this.getAuthHeaders()
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
    try {
      const response = await fetch(this.getApiUrl('/orders'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=30'
        },
        next: { revalidate: 30 } // Next.js caching
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('BackendService: Received non-JSON response:', {
          status: response.status,
          contentType,
          text: text.substring(0, 200)
        });
        return [];
      }
      
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
      const response = await fetch(this.getApiUrl(`/orders/${id}`));
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
      const response = await fetch(this.getApiUrl('/orders'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(this.getApiUrl(`/orders/${id}`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
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
      const response = await fetch(this.getApiUrl(`/orders/${id}`), {
        method: 'DELETE',
        headers: this.getAuthHeaders()
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
      const response = await fetch(this.getApiUrl('/customers'));
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
      const response = await fetch(this.getApiUrl('/customers'), {
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
      const response = await fetch(this.getApiUrl('/wilaya'));
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
      const response = await fetch(this.getApiUrl('/wilaya'), {
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
