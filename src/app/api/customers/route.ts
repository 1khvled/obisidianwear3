import { NextRequest, NextResponse } from 'next/server';
import { sharedDataStore, Customer } from '@/lib/sharedDataStore';

// GET /api/customers - Get all customers
export async function GET() {
  try {
    const customers = sharedDataStore.getCustomers();
    console.log('Customers API: GET request - returning', customers.length, 'customers');
    return NextResponse.json({
      success: true,
      data: customers,
      count: customers.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Customers API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    
    // Validate required fields
    if (!customerData.name || !customerData.email || !customerData.phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomers = sharedDataStore.getCustomers();
    const existingCustomer = existingCustomers.find(c => c.email === customerData.email);
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique ID
    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const addedCustomer = sharedDataStore.addCustomer(newCustomer);
    
    console.log('Customers API: POST request - created customer:', newCustomer.id);
    
    return NextResponse.json({
      success: true,
      data: addedCustomer,
      message: 'Customer created successfully',
      timestamp: Date.now()
    }, { status: 201 });
  } catch (error) {
    console.error('Customers API: POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
