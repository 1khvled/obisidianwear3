import { NextRequest, NextResponse } from 'next/server';

// Customer type definition
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  wilaya: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (will be replaced with Vercel KV)
let customers: Customer[] = [];

// GET /api/customers - Get all customers
export async function GET() {
  try {
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
    const existingCustomer = customers.find(c => c.email === customerData.email);
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

    customers.push(newCustomer);
    
    console.log('Customers API: POST request - created customer:', newCustomer.id);
    
    return NextResponse.json({
      success: true,
      data: newCustomer,
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
