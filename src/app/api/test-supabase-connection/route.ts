import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔧 Testing Supabase connection...');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔧 Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('🔧 Supabase Key:', supabaseKey ? 'Set' : 'Not set');
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables not set',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }
    
    // Test connection by trying to fetch products
    console.log('🔧 Testing database connection...');
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message,
        code: error.code
      });
    }
    
    console.log('✅ Supabase connection test successful');
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      productCount: data?.length || 0,
      sampleProduct: data?.[0] || null
    });
    
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
