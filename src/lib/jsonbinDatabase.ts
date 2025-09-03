// Simple database using JSONBin.io (free service)
// This provides persistent storage without requiring MongoDB setup

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || 'your-jsonbin-api-key-here';

// Bin IDs for different data types
const BIN_IDS = {
  products: 'your-products-bin-id',
  orders: 'your-orders-bin-id', 
  customers: 'your-customers-bin-id',
  wilaya: 'your-wilaya-bin-id'
};

interface ApiResponse<T> {
  record: T;
  metadata: {
    id: string;
    created: string;
    private: boolean;
  };
}

// Generic function to get data from JSONBin
async function getData<T>(binId: string): Promise<T> {
  try {
    const response = await fetch(`${JSONBIN_API_URL}/${binId}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('JSONBin GET error:', response.status, response.statusText);
      return [] as T;
    }
    
    const data: ApiResponse<T> = await response.json();
    return data.record;
  } catch (error) {
    console.error('JSONBin GET error:', error);
    return [] as T;
  }
}

// Generic function to save data to JSONBin
async function saveData<T>(binId: string, data: T): Promise<boolean> {
  try {
    const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error('JSONBin PUT error:', response.status, response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('JSONBin PUT error:', error);
    return false;
  }
}

// Products operations
export async function getProducts(): Promise<any[]> {
  return await getData<any[]>(BIN_IDS.products);
}

export async function getProduct(id: string): Promise<any | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function addProduct(product: any): Promise<any> {
  const products = await getProducts();
  products.push(product);
  await saveData(BIN_IDS.products, products);
  console.log('JSONBin: Added product:', product.id);
  return product;
}

export async function updateProduct(id: string, product: any): Promise<any | null> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...product, id };
  await saveData(BIN_IDS.products, products);
  console.log('JSONBin: Updated product:', id);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  if (filteredProducts.length === products.length) return false;
  
  await saveData(BIN_IDS.products, filteredProducts);
  console.log('JSONBin: Deleted product:', id);
  return true;
}

// Orders operations
export async function getOrders(): Promise<any[]> {
  return await getData<any[]>(BIN_IDS.orders);
}

export async function getOrder(id: string): Promise<any | null> {
  const orders = await getOrders();
  return orders.find(o => o.id === id) || null;
}

export async function addOrder(order: any): Promise<any> {
  const orders = await getOrders();
  orders.push(order);
  await saveData(BIN_IDS.orders, orders);
  console.log('JSONBin: Added order:', order.id);
  return order;
}

export async function updateOrder(id: string, order: any): Promise<any | null> {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  orders[index] = { ...orders[index], ...order, id };
  await saveData(BIN_IDS.orders, orders);
  console.log('JSONBin: Updated order:', id);
  return orders[index];
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = await getOrders();
  const filteredOrders = orders.filter(o => o.id !== id);
  if (filteredOrders.length === orders.length) return false;
  
  await saveData(BIN_IDS.orders, filteredOrders);
  console.log('JSONBin: Deleted order:', id);
  return true;
}

// Customers operations
export async function getCustomers(): Promise<any[]> {
  return await getData<any[]>(BIN_IDS.customers);
}

export async function addCustomer(customer: any): Promise<any> {
  const customers = await getCustomers();
  customers.push(customer);
  await saveData(BIN_IDS.customers, customers);
  return customer;
}

// Wilaya operations
export async function getWilayaTariffs(): Promise<any[]> {
  return await getData<any[]>(BIN_IDS.wilaya);
}

export async function updateWilayaTariffs(tariffs: any[]): Promise<void> {
  await saveData(BIN_IDS.wilaya, tariffs);
  console.log('JSONBin: Updated wilaya tariffs');
}
