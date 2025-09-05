import { NextRequest, NextResponse } from 'next/server';
import { updateInventory, getProduct } from '@/lib/supabaseDatabase';

// Test endpoint to update inventory for a specific product
export async function POST(request: NextRequest) {
  try {
    const { productId, stockData } = await request.json();
    
    console.log('Test Inventory Update API: Testing update for product:', productId);
    console.log('Test Inventory Update API: Stock data:', stockData);
    
    // First, get the current product
    const currentProduct = await getProduct(productId);
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('Test Inventory Update API: Current product:', {
      id: currentProduct.id,
      name: currentProduct.name,
      currentStock: currentProduct.stock,
      inStock: currentProduct.inStock
    });
    
    // Try to update the inventory
    const updatedProduct = await updateInventory(productId, stockData);
    
    console.log('Test Inventory Update API: Updated product:', updatedProduct);
    
    return NextResponse.json({
      success: true,
      originalProduct: {
        id: currentProduct.id,
        name: currentProduct.name,
        stock: currentProduct.stock,
        inStock: currentProduct.inStock
      },
      updatedProduct: updatedProduct,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Test Inventory Update API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
