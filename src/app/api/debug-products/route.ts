import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔍 Debug: Fetching all products from database...');
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Debug: Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ Debug: Found', data?.length || 0, 'products in database');
    console.log('📋 Debug: Product IDs:', data?.map(p => p.id) || []);
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      products: data || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug: Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
