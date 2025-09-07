import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';
import { sendOrderConfirmationEmail } from '@/lib/emailService';
import { MadeToOrderOrder } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('made_to_order_orders')
      .select(`
        *,
        made_to_order_products (
          name,
          image
        )
      `)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching made-to-order orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in made-to-order orders GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received order data:', body);
    
    const {
      productId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      wilayaId,
      wilayaName,
      selectedSize,
      selectedColor,
      quantity,
      unitPrice,
      whatsappContact,
      notes
    } = body;

    // Validate required fields
    if (!productId || !customerName || !customerPhone || !customerAddress || !wilayaId || !selectedSize || !selectedColor || !quantity || !unitPrice) {
      console.error('Missing required fields:', {
        productId: !!productId,
        customerName: !!customerName,
        customerPhone: !!customerPhone,
        customerAddress: !!customerAddress,
        wilayaId: !!wilayaId,
        selectedSize: !!selectedSize,
        selectedColor: !!selectedColor,
        quantity: !!quantity,
        unitPrice: !!unitPrice
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalPrice = unitPrice * quantity;
    const depositAmount = totalPrice * 0.35; // 35% deposit
    const remainingAmount = totalPrice * 0.65; // 65% remaining

    const orderData = {
      product_id: productId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      customer_address: customerAddress,
      wilaya_id: wilayaId,
      wilaya_name: wilayaName,
      selected_size: selectedSize,
      selected_color: selectedColor,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      remaining_amount: remainingAmount,
      shipping_time: '20-18 days',
      status: 'pending',
      whatsapp_contact: whatsappContact,
      notes
    };

    console.log('Inserting order data:', orderData);

    const { data, error } = await supabase
      .from('made_to_order_orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating made-to-order order:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ 
        error: 'Failed to create order', 
        details: error.message 
      }, { status: 500 });
    }

    // Send order confirmation email for made-to-order (async, don't wait for it)
    if (customerEmail && data) {
      // Convert made-to-order data to Order format for email
      const orderForEmail = {
        id: data.id,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        customerCity: customerCity || '',
        wilayaId: wilayaId,
        wilayaName: wilayaName,
        productId: productId,
        productName: 'Special Order Product', // Made-to-order products don't have names in the same way
        productImage: '',
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        quantity: quantity,
        subtotal: totalPrice,
        shippingCost: 0, // Made-to-order doesn't have separate shipping cost
        total: totalPrice,
        shippingType: 'homeDelivery' as const,
        paymentMethod: 'cod' as const,
        paymentStatus: 'pending' as const,
        status: 'pending' as const,
        orderDate: new Date(),
        notes: notes || '',
        trackingNumber: '',
        estimatedDelivery: '20-18 days',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      sendOrderConfirmationEmail(orderForEmail).catch(error => {
        console.error('Made-to-order API: Failed to send confirmation email:', error);
        // Don't fail the order creation if email fails
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in made-to-order orders POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, estimatedCompletionDate, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (estimatedCompletionDate) updateData.estimated_completion_date = estimatedCompletionDate;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('made_to_order_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating made-to-order order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in made-to-order orders PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
