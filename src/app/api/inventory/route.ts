import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/inventory - Get all inventory
export async function GET() {
  try {
    console.log('🔄 DEBUG API: Starting GET /api/inventory at', new Date().toISOString());
    
    // Always read from products table since inventory table updates are failing
    console.log('📦 DEBUG API: Reading from products table (inventory table updates are failing)');
      
    // Create a fresh Supabase client to avoid connection issues
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    const freshSupabase = createClient(supabaseUrl, supabaseKey);
    
    // Read from products table
    const { data: products, error: productsError } = await freshSupabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Inventory API: Products error:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory data' },
        { status: 500 }
      );
    }

    // Transform products data to inventory format
    console.log('🔄 DEBUG API: Transforming products data to inventory format...');
    const inventoryData: any[] = [];
    products.forEach((product: any) => {
      const defaultColors = ['Black', 'White', 'Red', 'Blue', 'Green'];
      const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      
      const colors = product.colors && product.colors.length > 0 ? product.colors : defaultColors;
      const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;
      
      console.log(`🔍 DEBUG API: Processing product ${product.name} (${product.id}):`, {
        stock: product.stock,
        colors,
        sizes
      });
      
      sizes.forEach((size: string) => {
        colors.forEach((color: string) => {
          const quantity = product.stock?.[size]?.[color] || 0;
          inventoryData.push({
            id: `INV-${product.id}-${size}-${color}`,
            product_id: product.id,
            size,
            color,
            quantity,
            reserved_quantity: 0,
            available_quantity: quantity,
            min_stock_level: 5,
            max_stock_level: 100,
            last_updated: new Date().toISOString(),
            created_at: product.created_at || new Date().toISOString(),
            updated_at: product.updated_at || new Date().toISOString(),
            products: {
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price
            }
          });
        });
      });
    });
    
    console.log('✅ DEBUG API: Transformed inventory data:', {
      totalItems: inventoryData.length,
      firstItem: inventoryData[0],
      sampleQuantities: inventoryData.slice(0, 3).map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    });

    const response = NextResponse.json({
      success: true,
      data: inventoryData,
      message: 'Inventory fetched successfully from products',
      timestamp: Date.now(),
      debug: {
        totalItems: inventoryData.length,
        firstItem: inventoryData[0] || null,
        lastUpdated: new Date().toISOString()
      }
    });

    // Disable ALL caching for real-time updates (Vercel-specific)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Cache-Status', 'BYPASS');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Random', Math.random().toString());
    // Vercel-specific headers
    response.headers.set('CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('X-Vercel-Id', Math.random().toString(36));

    return response;
  } catch (error) {
    console.error('Inventory API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Not needed since we only use products table
// All inventory updates go through PUT /api/inventory/[id] which updates products table