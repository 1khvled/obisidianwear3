import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// POST /api/inventory/force-refresh - Nuclear option to force fresh data
export async function POST(request: Request) {
  try {
    console.log('🚀 FORCE REFRESH: Starting nuclear inventory refresh at', new Date().toISOString());
    
    // Create multiple fresh Supabase clients to ensure no connection pooling
    const clients = Array.from({ length: 3 }, () => createClient(supabaseUrl!, supabaseKey!));
    
    // Try multiple clients to ensure we get fresh data
    let products = null;
    let lastError = null;
    
    for (let i = 0; i < clients.length; i++) {
      try {
        console.log(`🔄 FORCE REFRESH: Attempt ${i + 1} with fresh client...`);
        
        const { data, error } = await clients[i]
          .from('products')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) {
          lastError = error;
          console.error(`❌ FORCE REFRESH: Attempt ${i + 1} failed:`, error);
          continue;
        }
        
        products = data;
        console.log(`✅ FORCE REFRESH: Attempt ${i + 1} successful, got ${data?.length || 0} products`);
        break;
      } catch (err) {
        lastError = err;
        console.error(`❌ FORCE REFRESH: Attempt ${i + 1} exception:`, err);
      }
    }
    
    if (!products) {
      console.error('❌ FORCE REFRESH: All attempts failed');
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch fresh inventory data',
        details: lastError
      }, { status: 500 });
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
    
    console.log('✅ FORCE REFRESH: Nuclear refresh completed:', {
      totalItems: inventoryData.length,
      firstItem: inventoryData[0] || null,
      lastUpdated: new Date().toISOString(),
      attempts: clients.length
    });

    const response = NextResponse.json({
      success: true,
      data: inventoryData,
      message: 'Nuclear inventory refresh completed successfully',
      timestamp: Date.now(),
      debug: {
        totalItems: inventoryData.length,
        firstItem: inventoryData[0] || null,
        lastUpdated: new Date().toISOString(),
        attempts: clients.length,
        nuclear: true
      }
    });

    // Nuclear cache busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Cache-Status', 'NUCLEAR_BYPASS');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Random', Math.random().toString());
    response.headers.set('X-Nuclear', 'true');
    // Vercel-specific headers
    response.headers.set('CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('X-Vercel-Id', Math.random().toString(36));
    response.headers.set('X-Vercel-Nuclear', 'true');

    return response;
  } catch (error) {
    console.error('❌ FORCE REFRESH: Nuclear refresh failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Nuclear inventory refresh failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
