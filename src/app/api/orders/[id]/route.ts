import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting order:', orderId);

    // Delete the order from database
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('❌ Error deleting order:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete order' },
        { status: 500 }
      );
    }

    console.log('✅ Order deleted successfully:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in delete order API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const updates = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating order:', orderId, updates);

    // Update the order in database
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log('✅ Order updated successfully:', data);

    return NextResponse.json({
      success: true,
      order: data,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('❌ Error in update order API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching order:', orderId);

    // Get the order from database
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('❌ Error fetching order:', error);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Order fetched successfully:', data);

    return NextResponse.json({
      success: true,
      order: data
    });

  } catch (error) {
    console.error('❌ Error in get order API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}