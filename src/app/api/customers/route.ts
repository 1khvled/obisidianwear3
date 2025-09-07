import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, addCustomer } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    const customers = await getCustomers();
    
    return NextResponse.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('API Error: Failed to fetch customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    
    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const customer = await addCustomer(customerData);
    
    if (customer) {
      return NextResponse.json({
        success: true,
        data: customer
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create customer' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error: Failed to create customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}