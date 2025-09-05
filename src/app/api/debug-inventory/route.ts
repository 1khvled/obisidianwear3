import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabaseDatabase';

// Debug endpoint to check inventory issues
export async function GET(request: NextRequest) {
  try {
    console.log('Debug Inventory API: Getting all products...');
    
    const products = await getProducts();
    
    console.log('Debug Inventory API: Found products:', products.length);
    
    // Check for products with stock issues
    const productsWithIssues = products.map(product => ({
      id: product.id,
      name: product.name,
      inStock: product.inStock,
      stock: product.stock,
      stockType: typeof product.stock,
      stockKeys: product.stock ? Object.keys(product.stock) : [],
      sizes: product.sizes,
      colors: product.colors,
      hasStockData: !!product.stock,
      stockIsObject: product.stock && typeof product.stock === 'object',
      stockIsArray: product.stock && Array.isArray(product.stock)
    }));
    
    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      products: productsWithIssues,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Debug Inventory API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
