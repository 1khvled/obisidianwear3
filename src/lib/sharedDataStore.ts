// Shared data store for all API routes
// This ensures data is shared across all endpoints

import { Product, Order } from '@/types';

// Customer type definition
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  wilaya: string;
  createdAt: Date;
  updatedAt: Date;
}

// Wilaya tariff type definition
interface WilayaTariff {
  id: string;
  name: string;
  homeDelivery: number;
  stopDesk: number;
  order: number;
}

// Shared data store
class SharedDataStore {
  private static instance: SharedDataStore;
  
  public products: Product[] = [];
  public orders: Order[] = [];
  public customers: Customer[] = [];
  public wilayaTariffs: WilayaTariff[] = [
    { id: '1', name: 'Alger', homeDelivery: 400, stopDesk: 200, order: 1 },
    { id: '2', name: 'Oran', homeDelivery: 500, stopDesk: 300, order: 2 },
    { id: '3', name: 'Constantine', homeDelivery: 600, stopDesk: 400, order: 3 },
    { id: '4', name: 'Blida', homeDelivery: 400, stopDesk: 200, order: 4 },
    { id: '5', name: 'Setif', homeDelivery: 500, stopDesk: 300, order: 5 },
    { id: '6', name: 'Batna', homeDelivery: 600, stopDesk: 400, order: 6 },
    { id: '7', name: 'Annaba', homeDelivery: 700, stopDesk: 500, order: 7 },
    { id: '8', name: 'Sidi Bel Abbes', homeDelivery: 600, stopDesk: 400, order: 8 },
    { id: '9', name: 'Tlemcen', homeDelivery: 700, stopDesk: 500, order: 9 },
    { id: '10', name: 'Biskra', homeDelivery: 800, stopDesk: 600, order: 10 }
  ];

  private constructor() {}

  public static getInstance(): SharedDataStore {
    if (!SharedDataStore.instance) {
      SharedDataStore.instance = new SharedDataStore();
    }
    return SharedDataStore.instance;
  }

  // Products methods
  getProducts(): Product[] {
    return this.products;
  }

  getProduct(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  addProduct(product: Product): Product {
    this.products.push(product);
    console.log('SharedDataStore: Added product:', product.id, product.name);
    return product;
  }

  updateProduct(id: string, product: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...product, id };
    console.log('SharedDataStore: Updated product:', id);
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    console.log('SharedDataStore: Deleted product:', id);
    return true;
  }

  // Orders methods
  getOrders(): Order[] {
    return this.orders;
  }

  getOrder(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  addOrder(order: Order): Order {
    this.orders.push(order);
    console.log('SharedDataStore: Added order:', order.id);
    return order;
  }

  updateOrder(id: string, order: Partial<Order>): Order | null {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    this.orders[index] = { ...this.orders[index], ...order, id };
    console.log('SharedDataStore: Updated order:', id);
    return this.orders[index];
  }

  deleteOrder(id: string): boolean {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return false;
    
    this.orders.splice(index, 1);
    console.log('SharedDataStore: Deleted order:', id);
    return true;
  }

  // Customers methods
  getCustomers(): Customer[] {
    return this.customers;
  }

  addCustomer(customer: Customer): Customer {
    this.customers.push(customer);
    console.log('SharedDataStore: Added customer:', customer.id);
    return customer;
  }

  // Wilaya methods
  getWilayaTariffs(): WilayaTariff[] {
    return this.wilayaTariffs;
  }

  updateWilayaTariffs(tariffs: WilayaTariff[]): void {
    this.wilayaTariffs = tariffs;
    console.log('SharedDataStore: Updated wilaya tariffs');
  }
}

// Export singleton instance
export const sharedDataStore = SharedDataStore.getInstance();
export type { Customer, WilayaTariff };
