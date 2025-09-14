import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';
import { sendOrderConfirmationEmail } from '@/lib/emailService';
import { Product } from '@/types';

// Extended product type for order processing
interface OrderProduct extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    console.log('📦 Order API: Received order data:', orderData);

    // Validate required fields
    const isCartOrder = orderData.items && orderData.items.length > 0;
    const hasProduct = orderData.product;
    const hasItems = orderData.items && orderData.items.length > 0;
    
    if ((!hasProduct && !hasItems) || !orderData.customer || !orderData.delivery) {
      return NextResponse.json(
        { success: false, error: 'Missing required order data' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(orderData.customer.phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Must start with 0 and be 10 digits.' },
        { status: 400 }
      );
    }

    // Validate quantity (must be > 0)
    const productsToValidate = isCartOrder ? orderData.items : [orderData.product];
    for (const productData of productsToValidate) {
      if (!productData.quantity || productData.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Quantity must be greater than 0' },
          { status: 400 }
        );
      }
    }

    // Handle both single product and cart orders
    const productsToCheck = isCartOrder ? orderData.items : [orderData.product];

    // Check inventory availability for all products
    console.log('📦 Order API: Checking inventory availability...');
    
    for (const productData of productsToCheck) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productData.id)
        .single();

      if (productError || !product) {
        console.error('❌ Order API: Product not found:', productError);
        return NextResponse.json(
          { success: false, error: `Product ${productData.name} not found` },
          { status: 404 }
        );
      }

      // Check if product has stock (skip for made-to-order products)
      if (product.stock) {
        const availableStock = product.stock?.[productData.selectedSize]?.[productData.selectedColor] || 0;
        const requestedQuantity = productData.quantity;
        
        console.log('📦 Order API: Stock check:', {
          productId: productData.id,
          productName: productData.name,
          size: productData.selectedSize,
          color: productData.selectedColor,
          available: availableStock,
          requested: requestedQuantity
        });
        
        if (availableStock < requestedQuantity) {
          console.error('❌ Order API: Insufficient stock');
          return NextResponse.json(
            { 
              success: false, 
              error: `${productData.name} - Size ${productData.selectedSize} in ${productData.selectedColor}: Only ${availableStock} available (requested ${requestedQuantity})` 
            },
            { status: 400 }
          );
        }
      } else {
        console.log('📦 Order API: Made-to-order product, skipping stock check');
      }
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare order for database (matching existing schema)
    const orderItems = productsToCheck.map((productData: OrderProduct) => ({
      productId: productData.id,
      product_name: productData.name,
      product_price: productData.price,
      selectedSize: productData.selectedSize,
      selectedColor: productData.selectedColor,
      quantity: productData.quantity
    }));

    const order = {
      id: orderId,
      customer_id: customerId,
      items: orderItems,
      total: isCartOrder ? orderData.total : (orderData.product.price * orderData.product.quantity) + orderData.delivery.cost,
      shipping_cost: orderData.delivery.cost,
      shipping_type: orderData.delivery.option,
      payment_method: 'cod',
      payment_status: 'pending',
      status: 'pending',
      order_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Prepare customer data
    const customer = {
      id: customerId,
      name: orderData.customer.name,
      email: orderData.customer.email || `${orderData.customer.phone}@temp.com`,
      phone: orderData.customer.phone,
      address: orderData.customer.address || 'Not provided',
      city: orderData.customer.wilaya,
      wilaya: orderData.customer.wilaya,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📦 Order API: Inserting customer and order into database:', { customer, order });

    // Try to insert or update customer first (handle duplicate emails)
    let customerData = null;
    let customerError = null;
    
    try {
      const result = await supabase
        .from('customers')
        .upsert([customer], { onConflict: 'email' })
        .select()
        .single();
      
      customerData = result.data;
      customerError = result.error;
    } catch (error) {
      customerError = error;
    }

    if (customerError) {
      console.error('❌ Order API: Customer insert error:', customerError);
      console.log('⚠️ Order API: Customers table might not exist, proceeding without customer record');
      
      // If customers table doesn't exist, we'll still create the order
      // but don't add customer_info field as it doesn't exist in the schema
    }

    // Insert order into database
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error('❌ Order API: Database error:', error);
      console.error('❌ Order API: Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, error: 'Failed to save order to database', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Order API: Order saved successfully:', data);

    // Send email confirmation if customer has email
    if (orderData.customer.email && orderData.customer.email !== `${orderData.customer.phone}@temp.com`) {
      try {
        console.log('📧 Order API: Sending email confirmation to:', orderData.customer.email);
        
        // Prepare order data for email
        const emailOrderData = {
          id: data.id,
          customerName: orderData.customer.name,
          customerEmail: orderData.customer.email,
          customerPhone: orderData.customer.phone,
          customerAddress: orderData.customer.address,
          wilaya: orderData.customer.wilaya,
          product: isCartOrder ? {
            name: `${productsToCheck.length} items`,
            price: productsToCheck.reduce((sum: number, item: OrderProduct) => sum + (item.price * item.quantity), 0),
            selectedSize: 'Multiple',
            selectedColor: 'Multiple',
            quantity: productsToCheck.reduce((sum: number, item: OrderProduct) => sum + item.quantity, 0),
            items: productsToCheck.map((item: OrderProduct) => ({
              name: item.name,
              size: item.selectedSize,
              color: item.selectedColor,
              quantity: item.quantity,
              price: item.price
            }))
          } : {
            name: orderData.product.name,
            price: orderData.product.price,
            selectedSize: orderData.product.selectedSize,
            selectedColor: orderData.product.selectedColor,
            quantity: orderData.product.quantity
          },
          delivery: {
            option: orderData.delivery.option,
            cost: orderData.delivery.cost
          },
          total: isCartOrder ? orderData.total : orderData.product.total,
          orderDate: new Date().toLocaleDateString(),
          status: 'pending'
        };

        const emailSent = await sendOrderConfirmationEmail(emailOrderData);
        
        if (emailSent) {
          console.log('✅ Order API: Email confirmation sent successfully');
        } else {
          console.log('⚠️ Order API: Email confirmation failed, but order was saved');
        }
      } catch (emailError) {
        console.error('❌ Order API: Email sending error:', emailError);
        // Don't fail the order if email fails
      }
    } else {
      console.log('📧 Order API: No valid email provided, skipping email confirmation');
    }

    return NextResponse.json({
      success: true,
      order: data,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('❌ Order API: Error processing order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('📦 Order API: Fetching orders...');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Order API: Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    console.log('✅ Order API: Fetched orders:', data?.length || 0);

    return NextResponse.json({
      success: true,
      orders: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Order API: Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}