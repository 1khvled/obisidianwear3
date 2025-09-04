import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export const runtime = 'nodejs';

// POST /api/fix-products - Fix existing products to have proper colors and stock
export async function POST() {
  try {
    console.log('Fix Products API: Starting product fix...');
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Fix Products API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');
    
    if (fetchError) {
      console.error('Fix Products API: Error fetching products:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    console.log(`Fix Products API: Found ${products.length} products`);
    
    let fixedCount = 0;
    const results = [];
    
    // Update each product to have default colors and stock if missing
    for (const product of products) {
      const updates: any = {};
      let needsUpdate = false;
      
      // Fix empty colors array
      if (!product.colors || product.colors.length === 0) {
        updates.colors = ['Black'];
        needsUpdate = true;
        console.log(`Fix Products API: Fixing colors for product: ${product.name}`);
      }
      
      // Fix empty stock object or stock with empty size objects
      const hasEmptyStock = !product.stock || 
        Object.keys(product.stock).length === 0 ||
        Object.values(product.stock).every(sizeStock => 
          !sizeStock || Object.keys(sizeStock).length === 0
        );
      
      if (hasEmptyStock) {
        updates.stock = {
          S: { Black: 10 },
          M: { Black: 15 },
          L: { Black: 12 },
          XL: { Black: 8 }
        };
        needsUpdate = true;
        console.log(`Fix Products API: Fixing stock for product: ${product.name}`);
      }
      
      // Fix empty sizes array
      if (!product.sizes || product.sizes.length === 0) {
        updates.sizes = ['S', 'M', 'L', 'XL'];
        needsUpdate = true;
        console.log(`Fix Products API: Fixing sizes for product: ${product.name}`);
      }
      
      // Update the product if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('products')
          .update(updates)
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`Fix Products API: Error updating product ${product.name}:`, updateError);
          results.push({ product: product.name, status: 'error', error: updateError.message });
        } else {
          console.log(`Fix Products API: ✅ Updated product: ${product.name}`);
          results.push({ product: product.name, status: 'success' });
          fixedCount++;
        }
      } else {
        results.push({ product: product.name, status: 'no_changes_needed' });
      }
    }
    
    console.log(`Fix Products API: ✅ Fixed ${fixedCount} products successfully!`);
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} products successfully`,
      totalProducts: products.length,
      fixedCount: fixedCount,
      results: results,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Fix Products API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix products' },
      { status: 500 }
    );
  }
}
