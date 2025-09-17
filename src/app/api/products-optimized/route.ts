import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cache: { data: any; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = url.searchParams.get('limit');
    const search = url.searchParams.get('search');

    // Check cache first
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log('🚀 [OPTIMIZED] Serving products from cache');
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('🚀 [OPTIMIZED] Fetching fresh products from database');

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('inStock', true)
      .order('createdAt', { ascending: false });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    } else {
      query = query.limit(20); // Default limit for performance
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [OPTIMIZED] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update cache
    cache = {
      data: data || [],
      timestamp: Date.now()
    };

    console.log(`✅ [OPTIMIZED] Fetched ${data?.length || 0} products`);

    return NextResponse.json({
      success: true,
      data: data || [],
      cached: false,
      timestamp: new Date().toISOString(),
      count: data?.length || 0
    });

  } catch (error) {
    console.error('❌ [OPTIMIZED] Error in products-optimized API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear cache endpoint for admin use
export async function DELETE() {
  cache = null;
  console.log('🧹 [OPTIMIZED] Products cache cleared');
  return NextResponse.json({ success: true, message: 'Cache cleared' });
}