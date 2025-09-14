import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    
    console.log('📱 WhatsApp Order: Received order data:', orderData);

    // Check environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ WhatsApp Order: Missing Supabase environment variables');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase configuration' 
      }, { status: 500 });
    }

    // Generate unique IDs
    const orderId = `whatsapp_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare customer data
    const customer = {
      id: customerId,
      name: orderData.customer.name,
      phone: orderData.customer.phone,
      email: orderData.customer.email || null,
      address: orderData.customer.address || null,
      wilaya: orderData.customer.wilaya,
      created_at: new Date().toISOString()
    };

    // Prepare order data
    const order = {
      id: orderId,
      customer_id: customerId,
      product_name: orderData.product.name,
      product_price: orderData.product.price,
      product_type: 'made-to-order',
      selected_size: orderData.product.customSize || 'Custom',
      selected_color: orderData.product.customColor || 'Custom',
      quantity: orderData.product.quantity || 1,
      subtotal: orderData.product.price * (orderData.product.quantity || 1),
      delivery_option: orderData.delivery?.option || 'domicile',
      delivery_cost: orderData.delivery?.cost || 0,
      total_price: orderData.product.price * (orderData.product.quantity || 1) + (orderData.delivery?.cost || 0),
      status: 'pending_whatsapp_confirmation',
      order_source: 'whatsapp',
      notes: orderData.product.notes || 'Custom made-to-order item',
      created_at: new Date().toISOString()
    };

    console.log('📱 WhatsApp Order: Testing Supabase connection...');
    
    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ WhatsApp Order: Supabase connection test failed:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed: ' + testError.message 
      }, { status: 500 });
    }

    console.log('✅ WhatsApp Order: Supabase connection successful');

    console.log('📱 WhatsApp Order: Inserting customer data:', customer);
    
    // Insert customer data
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();

    if (customerError) {
      console.error('❌ WhatsApp Order: Customer insertion error:', customerError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save customer data: ' + customerError.message 
      }, { status: 500 });
    }

    console.log('📱 WhatsApp Order: Customer inserted successfully:', customerData);

    console.log('📱 WhatsApp Order: Inserting order data:', order);
    
    // Insert order data
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error('❌ WhatsApp Order: Order insertion error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save order data: ' + error.message 
      }, { status: 500 });
    }

    console.log('✅ WhatsApp Order: Order saved successfully:', data);

    return NextResponse.json({ 
      success: true, 
      order: data,
      message: 'WhatsApp order saved successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ WhatsApp Order: Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
