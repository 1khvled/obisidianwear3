import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// GET /api/inventory/test - Test inventory persistence
export async function GET() {
  try {
    console.log('🧪 TEST: Starting inventory persistence test...');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get a test product
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError || !products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No products found for testing',
        details: productsError
      });
    }
    
    const testProduct = products[0];
    console.log('🧪 TEST: Using product:', testProduct.name, 'ID:', testProduct.id);
    console.log('🧪 TEST: Current stock:', testProduct.stock);
    
    // Test stock structure
    const testStock = {
      "S": { "Black": 99, "White": 88 },
      "M": { "Black": 77, "White": 66 },
      "L": { "Black": 55, "White": 44 }
    };
    
    console.log('🧪 TEST: Updating with test stock:', testStock);
    
    // Update the product with test stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: testStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', testProduct.id);
    
    if (updateError) {
      console.error('❌ TEST: Update failed:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Update failed',
        details: updateError
      });
    }
    
    console.log('✅ TEST: Update successful, waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Retrieve the product again to verify
    const { data: updatedProduct, error: retrieveError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProduct.id)
      .single();
    
    if (retrieveError) {
      console.error('❌ TEST: Retrieve failed:', retrieveError);
      return NextResponse.json({
        success: false,
        error: 'Retrieve failed',
        details: retrieveError
      });
    }
    
    console.log('🧪 TEST: Retrieved stock:', updatedProduct.stock);
    
    // Check if the update persisted
    const stockMatches = JSON.stringify(updatedProduct.stock) === JSON.stringify(testStock);
    
    console.log('🧪 TEST: Stock matches:', stockMatches);
    console.log('🧪 TEST: Expected:', testStock);
    console.log('🧪 TEST: Actual:', updatedProduct.stock);
    
    return NextResponse.json({
      success: true,
      test: {
        productId: testProduct.id,
        productName: testProduct.name,
        originalStock: testProduct.stock,
        testStock: testStock,
        retrievedStock: updatedProduct.stock,
        stockMatches: stockMatches,
        updateTimestamp: new Date().toISOString()
      },
      message: stockMatches ? 'Inventory persistence test PASSED' : 'Inventory persistence test FAILED'
    });
    
  } catch (error) {
    console.error('❌ TEST: Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// POST /api/inventory/test - Reset test data
export async function POST() {
  try {
    console.log('🧪 RESET: Resetting test data...');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get a test product
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError || !products || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No products found for reset'
      });
    }
    
    const testProduct = products[0];
    
    // Reset to default stock
    const defaultStock = {
      "S": { "Black": 0, "White": 0 },
      "M": { "Black": 0, "White": 0 },
      "L": { "Black": 0, "White": 0 }
    };
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: defaultStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', testProduct.id);
    
    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Reset failed',
        details: updateError
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data reset successfully',
      productId: testProduct.id
    });
    
  } catch (error) {
    console.error('❌ RESET: Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Reset failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
