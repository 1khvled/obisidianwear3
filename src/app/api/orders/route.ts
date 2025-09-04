import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { getOrders, addOrder } from '@/lib/supabaseDatabase';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/orders - Get all orders
export async function GET() {
  try {
    console.log('Orders API: GET request started');
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Orders API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const orders = await getOrders();
    console.log('Orders API: GET request - returning', orders.length, 'orders');
    
    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Orders API: GET error:', error);
    console.error('Orders API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    const addedOrder = await addOrder(newOrder);
    
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
