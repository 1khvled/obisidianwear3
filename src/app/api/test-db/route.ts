import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://zrmxcjklkthpyanfslsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('Supabase connection error:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: connectionError.message,
        code: connectionError.code
      }, { status: 500 });
    }
    
    // Test 2: Try to get products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('Products query error:', productsError);
      return NextResponse.json({
        success: false,
        error: 'Products query failed',
        details: productsError.message,
        code: productsError.code,
        hint: 'You may need to run the SQL setup script in Supabase'
      }, { status: 500 });
    }
    
    // Test 3: Try to get wilaya tariffs
    const { data: wilaya, error: wilayaError } = await supabase
      .from('wilaya_tariffs')
      .select('*')
      .limit(5);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data: {
        products: products || [],
        wilaya_tariffs: wilaya || [],
        wilayaError: wilayaError ? wilayaError.message : null
      },
      connectionTest: connectionTest
    });
    
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
