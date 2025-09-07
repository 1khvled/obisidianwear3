// Simple file-based database using Vercel's file system
// This provides persistent storage without external dependencies

import { promises as fs } from 'fs';
import path from 'path';
import { Product, Order } from '@/types';

// File paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const WILAYA_FILE = path.join(DATA_DIR, 'wilaya.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic function to read JSON file
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`File ${filePath} not found, using default value`);
    return defaultValue;
  }
}

// Generic function to write JSON file
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Products operations
export async function getProducts(): Promise<Product[]> {
  return await readJsonFile<Product[]>(PRODUCTS_FILE, []);
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function addProduct(product: Product): Promise<Product> {
  const products = await getProducts();
  products.push(product);
  await writeJsonFile(PRODUCTS_FILE, products);
  console.log('FileDB: Added product:', product.id);
  return product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...product, id };
  await writeJsonFile(PRODUCTS_FILE, products);
  console.log('FileDB: Updated product:', id);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  if (filteredProducts.length === products.length) return false;
  
  await writeJsonFile(PRODUCTS_FILE, filteredProducts);
  console.log('FileDB: Deleted product:', id);
  return true;
}

// Orders operations
export async function getOrders(): Promise<Order[]> {
  return await readJsonFile<Order[]>(ORDERS_FILE, []);
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(o => o.id === id) || null;
}

export async function addOrder(order: Order): Promise<Order> {
  const orders = await getOrders();
  orders.push(order);
  await writeJsonFile(ORDERS_FILE, orders);
  console.log('FileDB: Added order:', order.id);
  return order;
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  orders[index] = { ...orders[index], ...order, id };
  await writeJsonFile(ORDERS_FILE, orders);
  console.log('FileDB: Updated order:', id);
  return orders[index];
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = await getOrders();
  const filteredOrders = orders.filter(o => o.id !== id);
  if (filteredOrders.length === orders.length) return false;
  
  await writeJsonFile(ORDERS_FILE, filteredOrders);
  console.log('FileDB: Deleted order:', id);
  return true;
}

// Customers operations
export async function getCustomers(): Promise<any[]> {
  return await readJsonFile<any[]>(CUSTOMERS_FILE, []);
}

export async function addCustomer(customer: any): Promise<any> {
  const customers = await getCustomers();
  customers.push(customer);
  await writeJsonFile(CUSTOMERS_FILE, customers);
  return customer;
}

// Wilaya operations
export async function getWilayaTariffs(): Promise<any[]> {
  const defaultTariffs = [
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
  
  return await readJsonFile<any[]>(WILAYA_FILE, defaultTariffs);
}

export async function updateWilayaTariffs(tariffs: any[]): Promise<void> {
  await writeJsonFile(WILAYA_FILE, tariffs);
  console.log('FileDB: Updated wilaya tariffs');
}
