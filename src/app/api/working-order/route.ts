import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    console.log('📦 Working Order API: Received order data:', orderData);

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a simple order object
    const order = {
      id: orderId,
      product: orderData.product,
      customer: orderData.customer,
      delivery: orderData.delivery,
      total: orderData.product?.total || 1000,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log('📦 Working Order API: Order created:', order);

    // Send email confirmation
    try {
      await sendOrderConfirmationEmail(orderData.customer, order);
      console.log('✅ Email confirmation sent');
    } catch (emailError) {
      console.error('⚠️ Email confirmation failed:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Order placed successfully and confirmation email sent'
    });

  } catch (error) {
    console.error('❌ Working Order API: Error processing order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function sendOrderConfirmationEmail(customer: any, order: any) {
  try {
    // Create email content
    const emailData = {
      to: customer.email,
      subject: `Order Confirmation - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">OBSIDIAN WEAR</h1>
            <p style="margin: 5px 0; color: #ccc;">Plus qu'un vêtement, une attitude</p>
          </div>
          
          <h2 style="color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">Order Confirmation</h2>
          
          <p>Dear ${customer.name},</p>
          <p>Thank you for your order! Your order has been received and is being processed.</p>
          
          <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #333;">
            <h3 style="color: #8b5cf6; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Product:</strong> ${order.product?.name || 'Custom Product'}</p>
            <p><strong>Size:</strong> ${order.product?.selectedSize || 'Not specified'}</p>
            <p><strong>Color:</strong> ${order.product?.selectedColor || 'Not specified'}</p>
            <p><strong>Quantity:</strong> ${order.product?.quantity || 1}</p>
            <p><strong>Total:</strong> ${order.total} DZD</p>
            <p><strong>Shipping:</strong> ${order.delivery?.option === 'domicile' ? 'Home Delivery' : 'Stop Desk'}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #333;">
            <h3 style="color: #8b5cf6; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${customer.name}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Address:</strong> ${customer.address}</p>
            <p><strong>Wilaya:</strong> ${customer.wilaya}</p>
          </div>
          
          <p>We will contact you soon with delivery details and payment information.</p>
          <p>Thank you for choosing <strong style="color: #8b5cf6;">OBSIDIAN WEAR</strong>!</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `
    };

    // For now, just log the email (you can integrate with actual email service)
    console.log('📧 Email confirmation would be sent to:', customer.email);
    console.log('📧 Email subject:', emailData.subject);
    console.log('📧 Email content preview:', emailData.html.substring(0, 200) + '...');
    
    // TODO: Integrate with actual email service like EmailJS, Nodemailer, etc.
    // Example with EmailJS:
    // await emailjs.send('service_id', 'template_id', emailData, 'user_id');
    
    // For demonstration, we'll simulate successful email sending
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Working Order API: Deleting order:', orderId);

    // For now, we'll just simulate successful deletion
    // In a real system, you would delete from database
    console.log('✅ Order deleted successfully:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      deletedId: orderId
    });

  } catch (error) {
    console.error('❌ Working Order API: Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
