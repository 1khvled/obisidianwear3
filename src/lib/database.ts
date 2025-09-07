import { MongoClient, Db, Collection } from 'mongodb';
import { Product, Order } from '@/types';

// Database connection
let client: MongoClient;
let db: Db;

// Collections
let productsCollection: Collection<Product>;
let ordersCollection: Collection<Order>;
let customersCollection: Collection<any>;
let wilayaCollection: Collection<any>;

// MongoDB connection string - you'll need to replace this with your actual MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/obisidianwear?retryWrites=true&w=majority';

export async function connectToDatabase() {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('obisidianwear');
    
    // Initialize collections
    productsCollection = db.collection<Product>('products');
    ordersCollection = db.collection<Order>('orders');
    customersCollection = db.collection('customers');
    wilayaCollection = db.collection('wilaya');
    
    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Products operations
export async function getProducts(): Promise<Product[]> {
  await connectToDatabase();
  return await productsCollection.find({}).toArray();
}

export async function getProduct(id: string): Promise<Product | null> {
  await connectToDatabase();
  return await productsCollection.findOne({ id });
}

export async function addProduct(product: Product): Promise<Product> {
  await connectToDatabase();
  await productsCollection.insertOne(product);
  return product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  await connectToDatabase();
  const result = await productsCollection.findOneAndUpdate(
    { id },
    { $set: { ...product, id } },
    { returnDocument: 'after' }
  );
  return result || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await productsCollection.deleteOne({ id });
  return result.deletedCount > 0;
}

// Orders operations
export async function getOrders(): Promise<Order[]> {
  await connectToDatabase();
  return await ordersCollection.find({}).toArray();
}

export async function getOrder(id: string): Promise<Order | null> {
  await connectToDatabase();
  return await ordersCollection.findOne({ id });
}

export async function addOrder(order: Order): Promise<Order> {
  await connectToDatabase();
  await ordersCollection.insertOne(order);
  console.log('Database: Added order:', order.id);
  return order;
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order | null> {
  await connectToDatabase();
  const result = await ordersCollection.findOneAndUpdate(
    { id },
    { $set: { ...order, id } },
    { returnDocument: 'after' }
  );
  console.log('Database: Updated order:', id);
  return result || null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await ordersCollection.deleteOne({ id });
  return result.deletedCount > 0;
}

// Customers operations
export async function getCustomers(): Promise<any[]> {
  await connectToDatabase();
  return await customersCollection.find({}).toArray();
}

export async function addCustomer(customer: any): Promise<any> {
  await connectToDatabase();
  await customersCollection.insertOne(customer);
  return customer;
}

// Wilaya operations
export async function getWilayaTariffs(): Promise<any[]> {
  await connectToDatabase();
  const result = await wilayaCollection.findOne({ type: 'tariffs' });
  return result?.tariffs || [];
}

export async function updateWilayaTariffs(tariffs: any[]): Promise<void> {
  await connectToDatabase();
  await wilayaCollection.replaceOne(
    { type: 'tariffs' },
    { type: 'tariffs', tariffs },
    { upsert: true }
  );
}

// Initialize default data
export async function initializeDefaultData() {
  await connectToDatabase();
  
  // Check if we already have data
  const productCount = await productsCollection.countDocuments();
  const wilayaCount = await wilayaCollection.countDocuments();
  
  if (productCount === 0) {
    console.log('Initializing default products...');
    // Add default products if none exist
  }
  
  if (wilayaCount === 0) {
    console.log('Initializing default wilaya tariffs...');
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
    await updateWilayaTariffs(defaultTariffs);
  }
}
