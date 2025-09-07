import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';
import { getOrders, addOrder, deductStockFromOrder } from '@/lib/supabaseDatabase';
import { withAuth } from '@/lib/authMiddleware';
import { ValidationUtils } from '@/lib/validation';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

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

// POST /api/orders - Create new order (PROTECTED)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const orderData = await request.json();
    
    console.log('Orders API: Received order data:', orderData);
    
    // Validate required fields
    const validation = ValidationUtils.validateRequired(orderData, ['customerName', 'productId', 'total']);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${validation.missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (orderData.customerEmail && !ValidationUtils.isValidEmail(orderData.customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (orderData.customerPhone && !ValidationUtils.isValidPhone(orderData.customerPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (!ValidationUtils.isValidNumber(orderData.total, 0, 999999)) {
      return NextResponse.json(
        { success: false, error: 'Total must be a valid number between 0 and 999999' },
        { status: 400 }
      );
    }

    if (!ValidationUtils.isValidNumber(orderData.quantity, 1, 100)) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Sanitize order data
    const sanitizedData = ValidationUtils.sanitizeOrderData(orderData);

    // Generate unique ID and create complete Order object
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerName: sanitizedData.customerName,
      customerEmail: sanitizedData.customerEmail,
      customerPhone: sanitizedData.customerPhone,
      customerAddress: sanitizedData.customerAddress,
      customerCity: sanitizedData.customerCity || '',
      wilayaId: sanitizedData.wilayaId || 0,
      wilayaName: sanitizedData.wilayaName || '',
      productId: sanitizedData.productId,
      productName: sanitizedData.productName,
      productImage: sanitizedData.productImage || '',
      selectedSize: sanitizedData.selectedSize,
      selectedColor: sanitizedData.selectedColor,
      quantity: sanitizedData.quantity,
      subtotal: sanitizedData.subtotal || 0,
      shippingCost: sanitizedData.shippingCost || 0,
      total: sanitizedData.total,
      shippingType: sanitizedData.shippingType || 'homeDelivery',
      paymentMethod: sanitizedData.paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      orderDate: new Date(),
      notes: sanitizedData.notes,
      trackingNumber: '',
      estimatedDelivery: sanitizedData.estimatedDelivery || '',
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
    
    // Send order confirmation email (async, don't wait for it)
    if (addedOrder.customerEmail) {
      sendOrderConfirmationEmail(addedOrder).catch(error => {
        console.error('Orders API: Failed to send confirmation email:', error);
        // Don't fail the order creation if email fails
      });
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
});
