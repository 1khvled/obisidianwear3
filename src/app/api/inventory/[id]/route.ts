import { NextRequest, NextResponse } from 'next/server';
import { updateInventory } from '@/lib/supabaseDatabase';

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
    
    const updatedProduct = await updateInventory(id, updateData);
    
    console.log('Inventory API: Successfully updated inventory for product:', id);
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
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
