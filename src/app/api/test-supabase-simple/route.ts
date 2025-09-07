import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔧 Testing simple Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: error.message,
        code: error.code
      });
    }
    
    console.log('✅ Supabase connection working');
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
