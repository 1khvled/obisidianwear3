import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔧 Testing database schema...');
    
    // Try to get table info
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database schema test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }
    
    console.log('✅ Database schema test successful');
    return NextResponse.json({
      success: true,
      message: 'Database schema working',
      sampleData: data?.[0] || null,
      columnCount: data?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Database schema test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
