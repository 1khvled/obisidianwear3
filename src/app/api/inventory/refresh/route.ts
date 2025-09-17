import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// POST /api/inventory/refresh - Force refresh inventory data
export async function POST() {
  try {
    console.log('🔄 FORCE REFRESH: Starting inventory refresh at', new Date().toISOString());
    
    // Create a fresh Supabase client
    const freshSupabase = createClient(supabaseUrl, supabaseKey);
    
    // Read from products table with fresh connection
    const { data: products, error: productsError } = await freshSupabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('❌ FORCE REFRESH: Products error:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory data' },
        { status: 500 }
      );
    }

    // Transform products data to inventory format
    console.log('🔄 FORCE REFRESH: Transforming products data to inventory format...');
    const inventoryData: any[] = [];
    products.forEach((product: any) => {
      const defaultColors = ['Black', 'White', 'Red', 'Blue', 'Green'];
      const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      
      const colors = product.colors && product.colors.length > 0 ? product.colors : defaultColors;
      const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;
      
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
    
    console.log('✅ FORCE REFRESH: Transformed inventory data:', {
      totalItems: inventoryData.length,
      sampleQuantities: inventoryData.slice(0, 3).map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    });

    const response = NextResponse.json({
      success: true,
      data: inventoryData,
      message: 'Inventory force refreshed successfully',
      timestamp: Date.now(),
      refresh: true,
      debug: {
        totalItems: inventoryData.length,
        firstItem: inventoryData[0] || null,
        lastUpdated: new Date().toISOString()
      }
    });

    // Disable ALL caching for force refresh
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Cache-Status', 'BYPASS');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Random', Math.random().toString());
    response.headers.set('X-Force-Refresh', 'true');
    // Vercel-specific headers
    response.headers.set('CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('X-Vercel-Id', Math.random().toString(36));

    return response;
  } catch (error) {
    console.error('❌ FORCE REFRESH: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to force refresh inventory' },
      { status: 500 }
    );
  }
}
