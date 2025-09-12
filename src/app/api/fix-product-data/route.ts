import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/fix-product-data - Fix product data for inventory
export async function POST() {
  try {
    console.log('🔧 Fixing product data for inventory...');
    
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products found to fix' },
        { status: 404 }
      );
    }

    console.log(`📦 Found ${products.length} products to fix`);

    // Fix each product
    const fixedProducts = [];
    
    for (const product of products) {
      const updates: any = {};
      
      // Fix colors if empty
      if (!product.colors || product.colors.length === 0) {
        updates.colors = ['Black', 'White']; // Default colors
        console.log(`🎨 Fixed colors for ${product.name}`);
      }
      
      // Fix sizes if empty
      if (!product.sizes || product.sizes.length === 0) {
        updates.sizes = ['S', 'M', 'L', 'XL']; // Default sizes
        console.log(`📏 Fixed sizes for ${product.name}`);
      }
      
      // Fix stock if empty
      if (!product.stock || Object.keys(product.stock).length === 0) {
        const sizes = updates.sizes || product.sizes || ['S', 'M', 'L', 'XL'];
        const colors = updates.colors || product.colors || ['Black', 'White'];
        
        const stock: any = {};
        sizes.forEach((size: string) => {
          stock[size] = {};
          colors.forEach((color: string) => {
            stock[size][color] = Math.floor(Math.random() * 20) + 5; // Random stock 5-25
          });
        });
        
        updates.stock = stock;
        console.log(`📦 Fixed stock for ${product.name}`);
      }
      
      // Fix inStock if false
      if (product.inStock === false) {
        updates.inStock = true;
        console.log(`✅ Fixed inStock for ${product.name}`);
      }
      
      // Update product if there are changes
      if (Object.keys(updates).length > 0) {
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update(updates)
          .eq('id', product.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Error updating product ${product.name}:`, updateError);
        } else {
          console.log(`✅ Updated product ${product.name}`);
          fixedProducts.push(updatedProduct);
        }
      } else {
        console.log(`ℹ️ No changes needed for ${product.name}`);
        fixedProducts.push(product);
      }
    }

    console.log(`✅ Fixed ${fixedProducts.length} products`);

    return NextResponse.json({
      success: true,
      data: {
        productsFixed: fixedProducts.length,
        message: 'Product data fixed successfully'
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ Fix product data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix product data' },
      { status: 500 }
    );
  }
}
