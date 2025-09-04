import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { getOrder, updateOrder, deleteOrder } from '@/lib/supabaseDatabase';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Orders API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const order = await getOrder(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('Orders API: GET single order:', id);
    
    return NextResponse.json({
      success: true,
      data: order,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Orders API: GET single error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Orders API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const updatedOrder = await updateOrder(id, updateData);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log('Orders API: PUT request - updated order:', id);
    
    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Orders API: PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Orders API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const deletedOrder = await getOrder(id);
    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const success = await deleteOrder(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete order' },
        { status: 500 }
      );
    }
    
    console.log('Orders API: DELETE request - deleted order:', id);
    
    return NextResponse.json({
      success: true,
      data: deletedOrder,
      message: 'Order deleted successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Orders API: DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
