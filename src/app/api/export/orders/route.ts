import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('📊 Export Orders API: Starting export...');
    
    const orders = await getOrders();
    console.log(`📊 Export Orders API: Found ${orders.length} orders`);
    
    // Create CSV header
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Customer Address',
      'Customer City',
      'Wilaya',
      'Product Name',
      'Product Price',
      'Quantity',
      'Selected Size',
      'Selected Color',
      'Subtotal',
      'Shipping Cost',
      'Total',
      'Shipping Type',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Number',
      'Order Date',
      'Created At'
    ];
    
    // Create CSV rows
    const rows = orders.map(order => {
      return [
        order.id,
        `"${order.customerName}"`,
        order.customerPhone,
        order.customerEmail,
        `"${order.customerAddress}"`,
        order.customerCity,
        order.wilayaName,
        `"${order.productName}"`,
        order.subtotal || 0,
        order.quantity,
        order.selectedSize,
        order.selectedColor,
        order.subtotal || 0,
        order.shippingCost,
        order.total,
        order.shippingType,
        order.paymentMethod,
        order.paymentStatus,
        order.status,
        order.trackingNumber || '',
        order.orderDate ? new Date(order.orderDate).toISOString() : '',
        order.createdAt ? new Date(order.createdAt).toISOString() : ''
      ];
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    console.log('✅ Export Orders API: CSV generated successfully');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('❌ Export Orders API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}
