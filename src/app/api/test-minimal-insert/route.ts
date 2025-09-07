import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST() {
  try {
    console.log('🔧 Testing minimal product insert...');
    
    // Try to insert a minimal product
    const minimalProduct = {
      id: 'test-' + Date.now(),
      name: 'Test Product',
      price: 100
    };
    
    console.log('🔧 Minimal product:', minimalProduct);
    
    const { data, error } = await supabase
      .from('products')
      .insert([minimalProduct])
      .select();
    
    if (error) {
      console.error('❌ Minimal insert failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: error.message,
        code: error.code,
        hint: error.hint,
        details_full: error
      });
    }
    
    console.log('✅ Minimal insert successful');
    return NextResponse.json({
      success: true,
      message: 'Minimal insert working',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Minimal insert error:', error);
    return NextResponse.json({
      success: false,
      error: 'Insert test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
