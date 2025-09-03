import { Pool } from 'pg';
import { Product, Order, Customer, WilayaTariff } from '@/types';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:fdRpxupE456@@db.zrmxcjklkthpyanfslsw.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// PostgreSQL Data Service - Direct database connection
class PostgresService {
  
  // Initialize database tables
  async initializeTables(): Promise<void> {
    try {
      const client = await pool.connect();
      
      // Create products table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          image TEXT,
          images TEXT[] DEFAULT '{}',
          stock JSONB DEFAULT '{}',
          category TEXT,
          sizes TEXT[] DEFAULT '{}',
          colors TEXT[] DEFAULT '{}',
          in_stock BOOLEAN DEFAULT true,
          rating DECIMAL(3,2) DEFAULT 0,
          reviews INTEGER DEFAULT 0,
          sku TEXT,
          weight DECIMAL(8,2),
          dimensions JSONB,
          tags TEXT[] DEFAULT '{}',
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create orders table
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          product_image TEXT,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          customer_address TEXT NOT NULL,
          wilaya_id INTEGER NOT NULL,
          wilaya_name TEXT NOT NULL,
          shipping_type TEXT NOT NULL,
          shipping_cost DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL,
          selected_size TEXT NOT NULL,
          selected_color TEXT NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'pending',
          tracking_number TEXT,
          notes TEXT,
          payment_method TEXT NOT NULL,
          payment_status TEXT DEFAULT 'pending',
          estimated_delivery TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create customers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          address TEXT NOT NULL,
          wilaya_id INTEGER NOT NULL,
          wilaya_name TEXT NOT NULL,
          total_orders INTEGER DEFAULT 0,
          total_spent DECIMAL(10,2) DEFAULT 0,
          first_order_date TIMESTAMP WITH TIME ZONE,
          last_order_date TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create wilaya_tariffs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS wilaya_tariffs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          home_delivery DECIMAL(10,2) NOT NULL,
          stop_desk DECIMAL(10,2) NOT NULL,
          "order" INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      client.release();
      console.log('PostgreSQL: Tables initialized successfully');
    } catch (error) {
      console.error('PostgreSQL: Error initializing tables:', error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
      client.release();
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
        image: row.image,
        images: row.images || [],
        stock: row.stock || {},
        category: row.category,
        sizes: row.sizes || [],
        colors: row.colors || [],
        inStock: row.in_stock,
        rating: parseFloat(row.rating || 0),
        reviews: row.reviews || 0,
        sku: row.sku,
        weight: row.weight ? parseFloat(row.weight) : undefined,
        dimensions: row.dimensions,
        tags: row.tags || [],
        featured: row.featured || false,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('PostgreSQL getProducts error:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
      client.release();
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
        image: row.image,
        images: row.images || [],
        stock: row.stock || {},
        category: row.category,
        sizes: row.sizes || [],
        colors: row.colors || [],
        inStock: row.in_stock,
        rating: parseFloat(row.rating || 0),
        reviews: row.reviews || 0,
        sku: row.sku,
        weight: row.weight ? parseFloat(row.weight) : undefined,
        dimensions: row.dimensions,
        tags: row.tags || [],
        featured: row.featured || false,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('PostgreSQL getProduct error:', error);
      return null;
    }
  }

  async addProduct(product: Product): Promise<Product> {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        INSERT INTO products (
          id, name, description, price, original_price, image, images, stock,
          category, sizes, colors, in_stock, rating, reviews, sku, weight,
          dimensions, tags, featured, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `, [
        product.id, product.name, product.description, product.price, product.originalPrice,
        product.image, product.images, JSON.stringify(product.stock), product.category,
        product.sizes, product.colors, product.inStock, product.rating, product.reviews,
        product.sku, product.weight, JSON.stringify(product.dimensions), product.tags,
        product.featured, product.createdAt, product.updatedAt
      ]);
      client.release();
      
      console.log('PostgreSQL: Added product:', product.id);
      return product;
    } catch (error) {
      console.error('PostgreSQL addProduct error:', error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      const client = await pool.connect();
      
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      Object.entries(product).forEach(([key, value]) => {
        if (key === 'id') return; // Skip ID
        if (value !== undefined) {
          const dbKey = key === 'originalPrice' ? 'original_price' :
                       key === 'inStock' ? 'in_stock' :
                       key === 'createdAt' ? 'created_at' :
                       key === 'updatedAt' ? 'updated_at' : key;
          
          fields.push(`${dbKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });
      
      if (fields.length === 0) {
        client.release();
        return await this.getProduct(id);
      }
      
      values.push(id);
      const query = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
      
      const result = await client.query(query, values);
      client.release();
      
      if (result.rows.length === 0) return null;
      
      console.log('PostgreSQL: Updated product:', id);
      return await this.getProduct(id);
    } catch (error) {
      console.error('PostgreSQL updateProduct error:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const client = await pool.connect();
      const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
      client.release();
      
      console.log('PostgreSQL: Deleted product:', id);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('PostgreSQL deleteProduct error:', error);
      return false;
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM orders ORDER BY created_at DESC');
      client.release();
      
      return result.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        productImage: row.product_image,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email,
        customerAddress: row.customer_address,
        wilayaId: row.wilaya_id,
        wilayaName: row.wilaya_name,
        shippingType: row.shipping_type,
        shippingCost: parseFloat(row.shipping_cost),
        quantity: row.quantity,
        selectedSize: row.selected_size,
        selectedColor: row.selected_color,
        subtotal: parseFloat(row.subtotal),
        total: parseFloat(row.total),
        orderDate: new Date(row.order_date),
        status: row.status,
        trackingNumber: row.tracking_number,
        notes: row.notes,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        estimatedDelivery: row.estimated_delivery,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('PostgreSQL getOrders error:', error);
      return [];
    }
  }

  async addOrder(order: Order): Promise<Order> {
    try {
      const client = await pool.connect();
      await client.query(`
        INSERT INTO orders (
          id, product_id, product_name, product_image, customer_name, customer_phone,
          customer_email, customer_address, wilaya_id, wilaya_name, shipping_type,
          shipping_cost, quantity, selected_size, selected_color, subtotal, total,
          order_date, status, tracking_number, notes, payment_method, payment_status,
          estimated_delivery, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      `, [
        order.id, order.productId, order.productName, order.productImage,
        order.customerName, order.customerPhone, order.customerEmail,
        order.customerAddress, order.wilayaId, order.wilayaName,
        order.shippingType, order.shippingCost, order.quantity,
        order.selectedSize, order.selectedColor, order.subtotal,
        order.total, order.orderDate, order.status, order.trackingNumber,
        order.notes, order.paymentMethod, order.paymentStatus,
        order.estimatedDelivery, order.createdAt, order.updatedAt
      ]);
      client.release();
      
      console.log('PostgreSQL: Added order:', order.id);
      return order;
    } catch (error) {
      console.error('PostgreSQL addOrder error:', error);
      throw error;
    }
  }

  // Wilaya Tariffs
  async getWilayaTariffs(): Promise<WilayaTariff[]> {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM wilaya_tariffs ORDER BY "order" ASC');
      client.release();
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        homeDelivery: parseFloat(row.home_delivery),
        stopDesk: parseFloat(row.stop_desk),
        order: row.order
      }));
    } catch (error) {
      console.error('PostgreSQL getWilayaTariffs error:', error);
      return [];
    }
  }

  async updateWilayaTariffs(tariffs: WilayaTariff[]): Promise<WilayaTariff[]> {
    try {
      const client = await pool.connect();
      
      // Clear existing tariffs
      await client.query('DELETE FROM wilaya_tariffs');
      
      // Insert new tariffs
      for (const tariff of tariffs) {
        await client.query(`
          INSERT INTO wilaya_tariffs (id, name, home_delivery, stop_desk, "order")
          VALUES ($1, $2, $3, $4, $5)
        `, [tariff.id, tariff.name, tariff.homeDelivery, tariff.stopDesk, tariff.order]);
      }
      
      client.release();
      console.log('PostgreSQL: Updated wilaya tariffs');
      return tariffs;
    } catch (error) {
      console.error('PostgreSQL updateWilayaTariffs error:', error);
      throw error;
    }
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    try {
      await this.initializeTables();
      
      // Initialize default wilaya tariffs if they don't exist
      const existingTariffs = await this.getWilayaTariffs();
      if (existingTariffs.length === 0) {
        const defaultTariffs: WilayaTariff[] = [
          { id: '1', name: 'Alger', homeDelivery: 400, stopDesk: 200, order: 1 },
          { id: '2', name: 'Oran', homeDelivery: 500, stopDesk: 300, order: 2 },
          { id: '3', name: 'Constantine', homeDelivery: 600, stopDesk: 400, order: 3 },
          { id: '4', name: 'Annaba', homeDelivery: 700, stopDesk: 500, order: 4 },
          { id: '5', name: 'Blida', homeDelivery: 450, stopDesk: 350, order: 5 }
        ];
        await this.updateWilayaTariffs(defaultTariffs);
        console.log('PostgreSQL: Initialized default wilaya tariffs');
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
        console.log('PostgreSQL: Initialized default products');
      }
    } catch (error) {
      console.error('PostgreSQL initializeDefaultData error:', error);
    }
  }
}

export const postgresService = new PostgresService();
