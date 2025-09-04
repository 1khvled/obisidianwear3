import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { getOrders, addOrder, deductStockFromOrder } from '@/lib/supabaseDatabase';

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
    
    console.log('Orders API: Received order data:', orderData);
    
    // Validate required fields - check for Order interface format
    if (!orderData.customerName || !orderData.productId || !orderData.total) {
      console.error('Orders API: Missing required fields:', {
        hasCustomerName: !!orderData.customerName,
        hasProductId: !!orderData.productId,
        hasTotal: !!orderData.total,
        receivedFields: Object.keys(orderData)
      });
      return NextResponse.json(
        { success: false, error: 'Customer name, product ID, and total are required' },
        { status: 400 }
      );
    }

    // Generate unique ID and create complete Order object
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      customerAddress: orderData.customerAddress || '',
      wilayaId: orderData.wilayaId || 0,
      wilayaName: orderData.wilayaName || '',
      productId: orderData.productId,
      productName: orderData.productName || '',
      productImage: orderData.productImage || '',
      selectedSize: orderData.selectedSize || 'M',
      selectedColor: orderData.selectedColor || 'Black',
      quantity: orderData.quantity || 1,
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      total: orderData.total,
      shippingType: orderData.shippingType || 'homeDelivery',
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      orderDate: new Date(),
      notes: orderData.notes || '',
      trackingNumber: '',
      estimatedDelivery: orderData.estimatedDelivery || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const addedOrder = await addOrder(newOrder);
    
    // Automatically deduct stock from inventory
    const stockDeducted = await deductStockFromOrder(newOrder);
    if (!stockDeducted) {
      console.warn('Orders API: Failed to deduct stock for order:', newOrder.id);
      // Note: We still return success for the order, but log the stock issue
    }
    
    console.log('Orders API: POST request - created order:', newOrder.id);
    
    return NextResponse.json({
      success: true,
      data: addedOrder,
      message: 'Order created successfully',
      stockDeducted: stockDeducted,
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
