// Optimized Orders API Route
import { NextRequest, NextResponse } from 'next/server';
import { optimizedOrderService } from '../../../../lib/optimizedOrderService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer_id || !body.items || !body.total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, items, total_amount' },
        { status: 400 }
      );
    }

    // Create order with optimized service
    const order = await optimizedOrderService.createOrder({
      customer_id: body.customer_id,
      items: body.items,
      total_amount: body.total_amount,
      status: body.status || 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully (optimized)' 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    let orders;
    
    if (search || status) {
      // Use search function
      orders = await optimizedOrderService.searchOrders(search, status, limit, offset);
    } else {
      // Use regular get function
      orders = await optimizedOrderService.getOrders(limit, offset);
    }

    return NextResponse.json({ 
      success: true, 
      orders,
      count: orders.length 
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, status' },
        { status: 400 }
      );
    }

    const success = await optimizedOrderService.updateOrderStatus(orderId, status);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Order status updated successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds, status } = body;

    if (!orderIds || !Array.isArray(orderIds) || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderIds (array), status' },
        { status: 400 }
      );
    }

    const updatedCount = await optimizedOrderService.bulkUpdateOrderStatus(orderIds, status);

    return NextResponse.json({ 
      success: true, 
      updatedCount,
      message: `Updated ${updatedCount} orders successfully` 
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update orders' },
      { status: 500 }
    );
  }
}
