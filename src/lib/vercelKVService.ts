import { kv } from '@vercel/kv';
import { Product, Order, Customer, WilayaTariff } from '@/types';

// Vercel KV Data Service - Much simpler than Supabase
class VercelKVService {
  private productsKey = 'products';
  private ordersKey = 'orders';
  private customersKey = 'customers';
  private wilayaTariffsKey = 'wilaya_tariffs';

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const products = await kv.get<Product[]>(this.productsKey);
      return products || [];
    } catch (error) {
      console.error('Vercel KV getProducts error:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Vercel KV getProduct error:', error);
      return null;
    }
  }

  async addProduct(product: Product): Promise<Product> {
    try {
      const products = await this.getProducts();
      products.push(product);
      await kv.set(this.productsKey, products);
      console.log('Vercel KV: Added product:', product.id);
      return product;
    } catch (error) {
      console.error('Vercel KV addProduct error:', error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      products[index] = { ...products[index], ...product };
      await kv.set(this.productsKey, products);
      console.log('Vercel KV: Updated product:', id);
      return products[index];
    } catch (error) {
      console.error('Vercel KV updateProduct error:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const products = await this.getProducts();
      const filteredProducts = products.filter(p => p.id !== id);
      await kv.set(this.productsKey, filteredProducts);
      console.log('Vercel KV: Deleted product:', id);
      return true;
    } catch (error) {
      console.error('Vercel KV deleteProduct error:', error);
      return false;
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const orders = await kv.get<Order[]>(this.ordersKey);
      return orders || [];
    } catch (error) {
      console.error('Vercel KV getOrders error:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const orders = await this.getOrders();
      return orders.find(o => o.id === id) || null;
    } catch (error) {
      console.error('Vercel KV getOrder error:', error);
      return null;
    }
  }

  async addOrder(order: Order): Promise<Order> {
    try {
      const orders = await this.getOrders();
      orders.push(order);
      await kv.set(this.ordersKey, orders);
      console.log('Vercel KV: Added order:', order.id);
      return order;
    } catch (error) {
      console.error('Vercel KV addOrder error:', error);
      throw error;
    }
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
    try {
      const orders = await this.getOrders();
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) return null;
      
      orders[index] = { ...orders[index], ...order };
      await kv.set(this.ordersKey, orders);
      console.log('Vercel KV: Updated order:', id);
      return orders[index];
    } catch (error) {
      console.error('Vercel KV updateOrder error:', error);
      return null;
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const orders = await this.getOrders();
      const filteredOrders = orders.filter(o => o.id !== id);
      await kv.set(this.ordersKey, filteredOrders);
      console.log('Vercel KV: Deleted order:', id);
      return true;
    } catch (error) {
      console.error('Vercel KV deleteOrder error:', error);
      return false;
    }
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const customers = await kv.get<Customer[]>(this.customersKey);
      return customers || [];
    } catch (error) {
      console.error('Vercel KV getCustomers error:', error);
      return [];
    }
  }

  async addCustomer(customer: Customer): Promise<Customer> {
    try {
      const customers = await this.getCustomers();
      customers.push(customer);
      await kv.set(this.customersKey, customers);
      console.log('Vercel KV: Added customer:', customer.id);
      return customer;
    } catch (error) {
      console.error('Vercel KV addCustomer error:', error);
      throw error;
    }
  }

  // Wilaya Tariffs
  async getWilayaTariffs(): Promise<WilayaTariff[]> {
    try {
      const tariffs = await kv.get<WilayaTariff[]>(this.wilayaTariffsKey);
      return tariffs || [];
    } catch (error) {
      console.error('Vercel KV getWilayaTariffs error:', error);
      return [];
    }
  }

  async updateWilayaTariffs(tariffs: WilayaTariff[]): Promise<WilayaTariff[]> {
    try {
      await kv.set(this.wilayaTariffsKey, tariffs);
      console.log('Vercel KV: Updated wilaya tariffs');
      return tariffs;
    } catch (error) {
      console.error('Vercel KV updateWilayaTariffs error:', error);
      throw error;
    }
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    try {
      // Initialize default wilaya tariffs if they don't exist
      const existingTariffs = await this.getWilayaTariffs();
      if (existingTariffs.length === 0) {
        const defaultTariffs: WilayaTariff[] = [
          { id: '1', wilaya_id: 1, name: 'Alger', domicile_ecommerce: 400, stop_desk_ecommerce: 200, order: 1 },
          { id: '2', wilaya_id: 2, name: 'Oran', domicile_ecommerce: 500, stop_desk_ecommerce: 300, order: 2 },
          { id: '3', wilaya_id: 3, name: 'Constantine', domicile_ecommerce: 600, stop_desk_ecommerce: 400, order: 3 },
          { id: '4', wilaya_id: 4, name: 'Annaba', domicile_ecommerce: 700, stop_desk_ecommerce: 500, order: 4 },
          { id: '5', wilaya_id: 5, name: 'Blida', domicile_ecommerce: 450, stop_desk_ecommerce: 350, order: 5 }
        ];
        await this.updateWilayaTariffs(defaultTariffs);
        console.log('Vercel KV: Initialized default wilaya tariffs');
      }

      // Initialize default products if they don't exist
      const existingProducts = await this.getProducts();
      if (existingProducts.length === 0) {
        const defaultProducts: Product[] = [
          {
            id: '1',
            name: 'Classic T-Shirt',
            description: 'Comfortable cotton t-shirt',
            price: 2500,
            originalPrice: 3000,
            image: '/images/tshirt1.jpg',
            images: ['/images/tshirt1.jpg'],
                         stock: { 
               'M': { 'Black': 5, 'White': 3, 'Gray': 2 },
               'L': { 'Black': 8, 'White': 4, 'Gray': 3 },
               'XL': { 'Black': 3, 'White': 3, 'Gray': 2 }
             },
            category: 'T-Shirts',
            sizes: ['M', 'L', 'XL'],
            colors: ['Black', 'White', 'Gray'],
            inStock: true,
            rating: 4.5,
            reviews: 25,
            sku: 'TSH-001',
            weight: 0.2,
                         dimensions: { length: 50, width: 70, height: 1 },
            tags: ['casual', 'cotton', 'basic'],
            featured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Hoodie Premium',
            description: 'Warm and cozy hoodie',
            price: 4500,
            originalPrice: 5500,
            image: '/images/hoodie1.jpg',
            images: ['/images/hoodie1.jpg'],
                         stock: { 
               'M': { 'Black': 3, 'Gray': 2 },
               'L': { 'Black': 5, 'Gray': 3 },
               'XL': { 'Black': 2, 'Gray': 1 }
             },
            category: 'Hoodies',
            sizes: ['M', 'L', 'XL'],
            colors: ['Black', 'Gray'],
            inStock: true,
            rating: 4.8,
            reviews: 18,
            sku: 'HOD-001',
            weight: 0.6,
                         dimensions: { length: 60, width: 80, height: 2 },
            tags: ['warm', 'casual', 'premium'],
            featured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        for (const product of defaultProducts) {
          await this.addProduct(product);
        }
        console.log('Vercel KV: Initialized default products');
      }
    } catch (error) {
      console.error('Vercel KV initializeDefaultData error:', error);
    }
  }
}

export const vercelKVService = new VercelKVService();
