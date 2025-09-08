import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔧 Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('made_to_order_products')
      .select('count')
      .limit(1);

    console.log('🔧 Test query result:', { testData, testError });

    if (testError) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: testError.message,
        code: testError.code,
        hint: testError.hint
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: testData
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({ 
      error: 'Database test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}