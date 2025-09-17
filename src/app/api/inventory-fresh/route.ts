import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// GET /api/inventory-fresh - Nuclear fresh data fetch
export async function GET() {
  try {
    console.log('🚀 NUCLEAR FRESH: Starting completely fresh inventory fetch at', new Date().toISOString());
    
    // Create a brand new Supabase client with unique config
    const freshSupabase = createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          'X-Client-Info': `fresh-inventory-${Date.now()}`,
          'X-Request-ID': Math.random().toString(36),
          'X-Cache-Bypass': 'true'
        }
      }
    });

    // Force a completely fresh read with explicit ordering by updated_at
    console.log('🔄 NUCLEAR FRESH: Reading with force ordering by updated_at...');
    
    const { data: products, error: productsError } = await freshSupabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false });

    if (productsError) {
      console.error('❌ NUCLEAR FRESH: Products error:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fresh inventory data' },
        { status: 500 }
      );
    }

    // Transform products data to inventory format
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
            last_updated: product.updated_at || new Date().toISOString(),
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

    console.log('✅ NUCLEAR FRESH: Fresh inventory data fetched:', {
      totalItems: inventoryData.length,
      firstItem: inventoryData[0] || null,
      lastUpdated: new Date().toISOString()
    });

    const response = NextResponse.json({
      success: true,
      data: inventoryData,
      message: 'Nuclear fresh inventory data fetched successfully',
      timestamp: Date.now(),
      nuclear: true,
      debug: {
        totalItems: inventoryData.length,
        firstItem: inventoryData[0] || null,
        lastUpdated: new Date().toISOString(),
        fetchTime: new Date().toISOString()
      }
    });

    // Nuclear cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate, no-transform, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Cache-Status', 'BYPASS');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Random', Math.random().toString());
    response.headers.set('X-Nuclear', 'true');
    
    // Vercel-specific nuclear headers
    response.headers.set('CDN-Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('X-Vercel-Id', Math.random().toString(36));
    response.headers.set('X-Vercel-Nuclear', 'true');

    return response;
  } catch (error) {
    console.error('❌ NUCLEAR FRESH: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Nuclear fresh fetch failed' },
      { status: 500 }
    );
  }
}
