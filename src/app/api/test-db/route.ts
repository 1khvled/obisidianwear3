import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Test DB - Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl,
      supabaseKey: supabaseKey ? 'Set' : 'Not set'
    });
    
    // Test products table (should work)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    // Test maintenance_settings table
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_settings')
      .select('*')
      .limit(1);
    
    return NextResponse.json({
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl,
        supabaseKey: supabaseKey ? 'Set' : 'Not set'
      },
      products: {
        data: products,
        error: productsError?.message,
        success: !productsError
      },
      maintenance: {
        data: maintenance,
        error: maintenanceError?.message,
        success: !maintenanceError
      }
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}