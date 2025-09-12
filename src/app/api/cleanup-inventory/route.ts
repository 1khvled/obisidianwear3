import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/cleanup-inventory - Clean up orphaned inventory records
export async function POST() {
  try {
    console.log('🧹 Starting inventory cleanup...');
    
    // Get all inventory records
    const { data: inventoryRecords, error: inventoryError } = await supabase
      .from('inventory')
      .select('id, product_id, size, color');
    
    if (inventoryError) {
      console.error('❌ Error fetching inventory records:', inventoryError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory records' },
        { status: 500 }
      );
    }
    
    if (!inventoryRecords || inventoryRecords.length === 0) {
      console.log('✅ No inventory records to clean up');
      return NextResponse.json({
        success: true,
        message: 'No inventory records to clean up',
        cleaned: 0
      });
    }
    
    // Get all products with their colors and sizes
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, colors, sizes');
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // Create a map of valid product configurations
    const validConfigurations = new Set<string>();
    products?.forEach(product => {
      const colors = product.colors || [];
      const sizes = product.sizes || [];
      
      colors.forEach((color: string) => {
        sizes.forEach((size: string) => {
          validConfigurations.add(`${product.id}-${size}-${color}`);
        });
      });
    });
    
    // Find orphaned inventory records
    const orphanedRecords = inventoryRecords.filter(record => {
      const configKey = `${record.product_id}-${record.size}-${record.color}`;
      return !validConfigurations.has(configKey);
    });
    
    console.log(`🔍 Found ${orphanedRecords.length} orphaned inventory records`);
    
    if (orphanedRecords.length === 0) {
      console.log('✅ No orphaned records found');
      return NextResponse.json({
        success: true,
        message: 'No orphaned records found',
        cleaned: 0
      });
    }
    
    // Delete orphaned records
    const orphanedIds = orphanedRecords.map(record => record.id);
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .in('id', orphanedIds);
    
    if (deleteError) {
      console.error('❌ Error deleting orphaned records:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete orphaned records' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Successfully cleaned up ${orphanedRecords.length} orphaned inventory records`);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${orphanedRecords.length} orphaned inventory records`,
      cleaned: orphanedRecords.length,
      orphanedRecords: orphanedRecords.map(record => ({
        id: record.id,
        product_id: record.product_id,
        size: record.size,
        color: record.color
      }))
    });
    
  } catch (error) {
    console.error('❌ Error in inventory cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
