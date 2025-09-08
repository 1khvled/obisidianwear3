import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔧 Checking table structure...');
    
    // Get all records without filters to see the structure
    const { data, error } = await supabase
      .from('made_to_order_products')
      .select('*')
      .limit(5);

    console.log('🔧 Table data:', { data, error });

    if (error) {
      return NextResponse.json({ 
        error: 'Table query error', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Table query successful',
      data: data || [],
      columns: data && data.length > 0 ? Object.keys(data[0]) : []
    });
  } catch (error) {
    console.error('❌ Table check error:', error);
    return NextResponse.json({ 
      error: 'Table check failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
