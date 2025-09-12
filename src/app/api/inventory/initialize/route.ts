import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/inventory/initialize - Initialize inventory from products
export async function POST() {
  try {
    console.log('🔄 Initializing inventory from products...');
    
    // First, get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image, price, sizes, colors, stock')
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
        { success: false, error: 'No products found to initialize inventory' },
        { status: 404 }
      );
    }

    console.log(`📦 Found ${products.length} products to process`);

    // Create inventory records for each product
    const inventoryRecords = [];
    
    for (const product of products) {
      const sizes = product.sizes || [];
      const colors = product.colors || [];
      const stock = product.stock || {};

      // Create inventory records for each size/color combination
      for (const size of sizes) {
        for (const color of colors) {
          const stockQuantity = stock[size]?.[color] || 0;
          
          inventoryRecords.push({
            id: `INV-${product.id}-${size}-${color}`,
            product_id: product.id,
            size,
            color,
            quantity: stockQuantity,
            reserved_quantity: 0,
            available_quantity: stockQuantity, // This will be calculated by the database
            min_stock_level: 5,
            max_stock_level: 100
          });
        }
      }
    }

    console.log(`📝 Created ${inventoryRecords.length} inventory records`);

    if (inventoryRecords.length > 0) {
      // Clear existing inventory first
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .neq('id', 'dummy'); // Delete all records

      if (deleteError) {
        console.error('❌ Error clearing existing inventory:', deleteError);
        // Continue anyway, upsert will handle conflicts
      }

      // Insert new inventory records
      const { data: insertedRecords, error: insertError } = await supabase
        .from('inventory')
        .upsert(inventoryRecords)
        .select();

      if (insertError) {
        console.error('❌ Error inserting inventory records:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to insert inventory records' },
          { status: 500 }
        );
      }

      console.log(`✅ Successfully initialized ${insertedRecords?.length || inventoryRecords.length} inventory records`);

      return NextResponse.json({
        success: true,
        data: {
          productsProcessed: products.length,
          inventoryRecordsCreated: insertedRecords?.length || inventoryRecords.length,
          message: 'Inventory initialized successfully'
        },
        timestamp: Date.now()
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'No inventory records to create' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Inventory initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize inventory' },
      { status: 500 }
    );
  }
}
