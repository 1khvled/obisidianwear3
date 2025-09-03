import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';

// In-memory storage (will be replaced with Vercel KV)
let orders: Order[] = [];

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const order = orders.find(o => o.id === id);
    
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
    
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder: Order = {
      ...orders[orderIndex],
      ...updateData,
      id // Ensure ID doesn't change
    };

    orders[orderIndex] = updatedOrder;
    
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
    
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const deletedOrder = orders[orderIndex];
    orders.splice(orderIndex, 1);
    
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
