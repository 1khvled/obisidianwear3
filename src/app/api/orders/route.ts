import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { vercelKVService } from '@/lib/vercelKVService';

// GET /api/orders - Get all orders
export async function GET() {
  try {
    const orders = await vercelKVService.getOrders();
    console.log('Orders API: GET request - returning', orders.length, 'orders');
    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Orders API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.customer || !orderData.items || !orderData.total) {
      return NextResponse.json(
        { success: false, error: 'Customer, items, and total are required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      orderDate: new Date(),
      status: 'pending',
      paymentStatus: 'pending'
    };

    const addedOrder = await vercelKVService.addOrder(newOrder);
    
    console.log('Orders API: POST request - created order:', newOrder.id);
    
    return NextResponse.json({
      success: true,
      data: addedOrder,
      message: 'Order created successfully',
      timestamp: Date.now()
    }, { status: 201 });
  } catch (error) {
    console.error('Orders API: POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
