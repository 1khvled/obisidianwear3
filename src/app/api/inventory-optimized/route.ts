import { NextResponse } from 'next/server';
import { getInventoryOptimized, updateInventoryOptimized } from '@/lib/optimizedSupabase';

// GET /api/inventory-optimized - Get all inventory with optimizations
export async function GET() {
  try {
    console.log('🚀 [OPTIMIZED] Starting GET /api/inventory-optimized at', new Date().toISOString());
    
    const startTime = performance.now();
    const inventoryData = await getInventoryOptimized();
    const endTime = performance.now();
    
    console.log(`⏱️ [OPTIMIZED] Total API time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`📦 [OPTIMIZED] Returning ${inventoryData.length} inventory items`);

    const response = NextResponse.json({
      success: true,
      data: inventoryData,
      message: 'Inventory fetched successfully (optimized)',
      timestamp: Date.now(),
      performance: {
        apiTime: endTime - startTime,
        itemCount: inventoryData.length
      }
    });

    // Optimized caching headers
    response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=120'); // 2 minutes
    response.headers.set('X-Response-Time', `${(endTime - startTime).toFixed(2)}ms`);
    response.headers.set('X-Optimized', 'true');

    return response;
  } catch (error) {
    console.error('❌ [OPTIMIZED] Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
