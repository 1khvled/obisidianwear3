import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('🔧 Testing made-to-order query...');
    
    const { data, error } = await supabase
      .from('made_to_order_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    console.log('🔧 Made-to-order query result:', { data, error });

    if (error) {
      return NextResponse.json({ 
        error: 'Made-to-order query error', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Made-to-order query successful',
      data: data || []
    });
  } catch (error) {
    console.error('❌ Made-to-order test error:', error);
    return NextResponse.json({ 
      error: 'Made-to-order test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
