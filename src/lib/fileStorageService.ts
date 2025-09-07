import { Product, Order, Customer, WilayaTariff } from '@/types';
import fs from 'fs';
import path from 'path';

// Simple file-based storage - guaranteed to work
class FileStorageService {
  private dataDir = path.join(process.cwd(), 'data');
  private productsFile = path.join(this.dataDir, 'products.json');
  private ordersFile = path.join(this.dataDir, 'orders.json');
  private customersFile = path.join(this.dataDir, 'customers.json');
  private wilayaFile = path.join(this.dataDir, 'wilaya.json');

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private readJsonFile<T>(filePath: string, defaultValue: T[]): T[] {
    try {
      this.ensureDataDir();
      if (!fs.existsSync(filePath)) {
        return defaultValue;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return defaultValue;
    }
  }

  private writeJsonFile<T>(filePath: string, data: T[]): void {
    try {
      this.ensureDataDir();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const products = this.readJsonFile(this.productsFile, []);
    // Convert date strings back to Date objects
    return products.map((product: any) => ({
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    }));
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async addProduct(product: Product): Promise<Product> {
    const products = await this.getProducts();
    products.push(product);
    this.writeJsonFile(this.productsFile, products);
    console.log('FileStorage: Added product:', product.id);
    return product;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...product };
    this.writeJsonFile(this.productsFile, products);
    console.log('FileStorage: Updated product:', id);
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    this.writeJsonFile(this.productsFile, filteredProducts);
    console.log('FileStorage: Deleted product:', id);
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const orders = this.readJsonFile(this.ordersFile, []);
    // Convert date strings back to Date objects
    return orders.map((order: any) => ({
      ...order,
      orderDate: new Date(order.orderDate),
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt)
    }));
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  async addOrder(order: Order): Promise<Order> {
    const orders = await this.getOrders();
    orders.push(order);
    this.writeJsonFile(this.ordersFile, orders);
    console.log('FileStorage: Added order:', order.id);
    return order;
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    orders[index] = { ...orders[index], ...order };
    this.writeJsonFile(this.ordersFile, orders);
    console.log('FileStorage: Updated order:', id);
    return orders[index];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const orders = await this.getOrders();
    const filteredOrders = orders.filter(o => o.id !== id);
    this.writeJsonFile(this.ordersFile, filteredOrders);
    console.log('FileStorage: Deleted order:', id);
    return true;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const customers = this.readJsonFile(this.customersFile, []);
    // Convert date strings back to Date objects
    return customers.map((customer: any) => ({
      ...customer,
      firstOrderDate: new Date(customer.firstOrderDate),
      lastOrderDate: new Date(customer.lastOrderDate)
    }));
  }

  async addCustomer(customer: Customer): Promise<Customer> {
    const customers = await this.getCustomers();
    customers.push(customer);
    this.writeJsonFile(this.customersFile, customers);
    console.log('FileStorage: Added customer:', customer.id);
    return customer;
  }

  // Wilaya Tariffs
  async getWilayaTariffs(): Promise<WilayaTariff[]> {
    return this.readJsonFile(this.wilayaFile, []);
  }

  async updateWilayaTariffs(tariffs: WilayaTariff[]): Promise<WilayaTariff[]> {
    this.writeJsonFile(this.wilayaFile, tariffs);
    console.log('FileStorage: Updated wilaya tariffs');
    return tariffs;
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
        console.log('FileStorage: Initialized default wilaya tariffs');
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
        console.log('FileStorage: Initialized default products');
      }
    } catch (error) {
      console.error('FileStorage initializeDefaultData error:', error);
    }
  }
}

export const fileStorageService = new FileStorageService();
