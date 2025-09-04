import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// PUT /api/inventory/[id] - Update product inventory/stock
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();
    
    console.log('Inventory API: PUT request for product:', id, updateData);
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Inventory API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    // Validate required fields
    if (!updateData.stock && !updateData.inStock) {
      return NextResponse.json(
        { success: false, error: 'Stock data or inStock status is required' },
        { status: 400 }
      );
    }
    
    // Prepare update object
    const updateObj: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updateData.stock) {
      updateObj.stock = updateData.stock;
    }
    
    if (updateData.inStock !== undefined) {
      updateObj.in_stock = updateData.inStock;
    }
    
    // Update the product
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Inventory API: Error updating inventory:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update inventory' },
        { status: 500 }
      );
    }
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('Inventory API: Successfully updated inventory for product:', id);
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
        inStock: updatedProduct.in_stock,
        totalStock: calculateTotalStock(updatedProduct.stock)
      },
      message: 'Inventory updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Inventory API: PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory' },
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
