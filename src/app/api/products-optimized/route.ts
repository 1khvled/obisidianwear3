import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { getProducts } from '@/lib/supabaseDatabase';

// Cache for products
let productsCache: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 300000; // 5 minutes

// GET /api/products-optimized - Get all products with aggressive caching
export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('🚀 [OPTIMIZED] Returning cached products');
      
      const response = NextResponse.json({
        success: true,
        data: productsCache,
        count: productsCache.length,
        timestamp: now,
        cached: true
      });
      
      // Set aggressive caching headers
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
      response.headers.set('X-Cache-Status', 'HIT');
      response.headers.set('X-Cache-Timestamp', cacheTimestamp.toString());
      
      return response;
    }

    console.log('🔄 [OPTIMIZED] Cache miss, fetching fresh products');
    
    // Fetch fresh data
    const products = await getProducts();
    
    // Update cache
    productsCache = products;
    cacheTimestamp = now;
    
    const response = NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      timestamp: now,
      cached: false
    });
    
    // Set caching headers for fresh data
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Cache-Status', 'MISS');
    response.headers.set('X-Cache-Timestamp', now.toString());
    
    return response;
    
  } catch (error) {
    console.error('❌ [OPTIMIZED] Error fetching products:', error);
    
    // Return cached data if available, even if expired
    if (productsCache) {
      console.log('⚠️ [OPTIMIZED] Returning stale cache due to error');
      
      const response = NextResponse.json({
        success: true,
        data: productsCache,
        count: productsCache.length,
        timestamp: cacheTimestamp,
        cached: true,
        stale: true
      });
      
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
      response.headers.set('X-Cache-Status', 'STALE');
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Clear cache endpoint for admin use
export async function DELETE() {
  productsCache = null;
  cacheTimestamp = 0;
  
  console.log('🧹 [OPTIMIZED] Products cache cleared');
  
  return NextResponse.json({
    success: true,
    message: 'Products cache cleared'
  });
}
