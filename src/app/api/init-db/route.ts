import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST() {
  try {
    console.log('Initializing database tables...');

    // Create maintenance_status table
    const { error: maintenanceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS maintenance_status (
          id TEXT PRIMARY KEY DEFAULT 'maintenance',
          is_maintenance BOOLEAN NOT NULL DEFAULT false,
          drop_date TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        INSERT INTO maintenance_status (id, is_maintenance, drop_date, updated_at)
        VALUES ('maintenance', false, NOW() + INTERVAL '30 days', NOW())
        ON CONFLICT (id) DO NOTHING;
        
        ALTER TABLE maintenance_status ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to maintenance status" 
        ON maintenance_status FOR SELECT 
        USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public update access to maintenance status" 
        ON maintenance_status FOR ALL 
        USING (true);
      `
    });

    // Create orders table
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_email TEXT,
          customer_phone TEXT,
          customer_address TEXT,
          wilaya_id INTEGER,
          wilaya_name TEXT,
          product_id TEXT NOT NULL,
          product_name TEXT,
          product_image TEXT,
          selected_size TEXT,
          selected_color TEXT,
          quantity INTEGER DEFAULT 1,
          subtotal DECIMAL(10,2) DEFAULT 0,
          shipping_cost DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          shipping_type TEXT DEFAULT 'homeDelivery',
          payment_method TEXT DEFAULT 'cod',
          payment_status TEXT DEFAULT 'pending',
          status TEXT DEFAULT 'pending',
          order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          tracking_number TEXT,
          estimated_delivery TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to orders" 
        ON orders FOR SELECT 
        USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public insert access to orders" 
        ON orders FOR INSERT 
        WITH CHECK (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public update access to orders" 
        ON orders FOR UPDATE 
        USING (true);
      `
    });

    // Create products table
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          image TEXT,
          images TEXT[],
          description TEXT,
          category TEXT,
          sizes TEXT[],
          colors TEXT[],
          in_stock BOOLEAN DEFAULT true,
          rating DECIMAL(3,2) DEFAULT 5.0,
          reviews INTEGER DEFAULT 0,
          stock JSONB,
          sku TEXT,
          weight DECIMAL(8,2),
          tags TEXT[],
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to products" 
        ON products FOR SELECT 
        USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public insert access to products" 
        ON products FOR INSERT 
        WITH CHECK (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public update access to products" 
        ON products FOR UPDATE 
        USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public delete access to products" 
        ON products FOR DELETE 
        USING (true);
      `
    });

    // Create customers table
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          wilaya_id INTEGER,
          wilaya_name TEXT,
          total_orders INTEGER DEFAULT 0,
          total_spent DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to customers" 
        ON customers FOR SELECT 
        USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public insert access to customers" 
        ON customers FOR INSERT 
        WITH CHECK (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public update access to customers" 
        ON customers FOR UPDATE 
        USING (true);
      `
    });

    const errors = [];
    if (maintenanceError) errors.push(`Maintenance table: ${maintenanceError.message}`);
    if (ordersError) errors.push(`Orders table: ${ordersError.message}`);
    if (productsError) errors.push(`Products table: ${productsError.message}`);
    if (customersError) errors.push(`Customers table: ${customersError.message}`);

    if (errors.length > 0) {
      console.error('Database initialization errors:', errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Some tables failed to create',
        details: errors.join('; ')
      }, { status: 500 });
    }

    console.log('Database initialization completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully - all tables created',
      tables: ['maintenance_status', 'orders', 'products', 'customers']
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
