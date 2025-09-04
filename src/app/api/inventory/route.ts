import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/inventory - Get all inventory/stock data
export async function GET() {
  try {
    console.log('Inventory API: GET request started');
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Inventory API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, sizes, colors, in_stock, category')
      .order('name');
    
    if (error) {
      console.error('Inventory API: Error fetching inventory:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory' },
        { status: 500 }
      );
    }
    
    // Transform data for inventory management
    const inventory = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      inStock: product.in_stock,
      stock: product.stock || {},
      sizes: product.sizes || [],
      colors: product.colors || [],
      totalStock: calculateTotalStock(product.stock || {}),
      stockBySize: calculateStockBySize(product.stock || {}, product.sizes || [], product.colors || [])
    }));
    
    console.log('Inventory API: Returning inventory for', inventory.length, 'products');
    
    return NextResponse.json({
      success: true,
      data: inventory,
      count: inventory.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Inventory API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// Helper function to calculate total stock
function calculateTotalStock(stock: any): number {
  if (!stock || typeof stock !== 'object') return 0;
  
  let total = 0;
  for (const size in stock) {
    if (typeof stock[size] === 'object') {
      for (const color in stock[size]) {
        total += Number(stock[size][color]) || 0;
      }
    }
  }
  return total;
}

// Helper function to calculate stock by size
function calculateStockBySize(stock: any, sizes: string[], colors: string[]): any {
  const result: any = {};
  
  sizes.forEach(size => {
    result[size] = {};
    colors.forEach(color => {
      result[size][color] = Number(stock[size]?.[color]) || 0;
    });
  });
  
  return result;
}
