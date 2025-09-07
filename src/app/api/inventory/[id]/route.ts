import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth } from '@/lib/authMiddleware';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/inventory/[id] - Get inventory by product ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          id,
          name,
          image,
          price
        )
      `)
      .eq('product_id', id)
      .order('size', { ascending: true });

    if (error) {
      console.error('Inventory API: GET error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inventory,
      message: 'Inventory fetched successfully',
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

// PUT /api/inventory/[id] - Update inventory (PROTECTED)
export const PUT = withAuth(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    const updateData = await request.json();

    // Get current inventory record
    const { data: currentRecord, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentRecord) {
      return NextResponse.json(
        { success: false, error: 'Inventory record not found' },
        { status: 404 }
      );
    }

    // Update inventory (available_quantity is auto-calculated)
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: updateData.quantity,
        reserved_quantity: updateData.reservedQuantity || currentRecord.reserved_quantity,
        min_stock_level: updateData.minStockLevel || currentRecord.min_stock_level,
        max_stock_level: updateData.maxStockLevel || currentRecord.max_stock_level,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Inventory API: PUT error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update inventory' },
        { status: 500 }
      );
    }

    // Log transaction
    const quantityChange = updateData.quantity - currentRecord.quantity;
    if (quantityChange !== 0) {
      await supabase
        .from('inventory_transactions')
        .insert([{
          id: `TXN-${Date.now()}-${id}`,
          product_id: currentRecord.product_id,
          size: currentRecord.size,
          color: currentRecord.color,
          transaction_type: 'adjustment',
          quantity_change: quantityChange,
          previous_quantity: currentRecord.quantity,
          new_quantity: updateData.quantity,
          reason: updateData.reason || 'Manual adjustment',
          created_by: updateData.createdBy || 'admin'
        }]);
    }

    return NextResponse.json({
      success: true,
      data,
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
});

// DELETE /api/inventory/[id] - Delete inventory record (PROTECTED)
export const DELETE = withAuth(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Inventory API: DELETE error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete inventory record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory record deleted successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Inventory API: DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete inventory record' },
      { status: 500 }
    );
  }
});