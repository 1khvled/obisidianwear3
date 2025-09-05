import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST() {
  try {
    console.log('Checking database tables...');

    // Test if maintenance_status table exists
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('maintenance_status')
      .select('*')
      .limit(1);

    if (maintenanceError) {
      console.log('Maintenance table does not exist or has issues:', maintenanceError);
      return NextResponse.json({
        success: false,
        error: 'Database tables not properly initialized. Please run the SQL script in Supabase first.',
        details: maintenanceError
      }, { status: 500 });
    }

    // Test if orders table exists
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (ordersError) {
      console.log('Orders table does not exist or has issues:', ordersError);
      return NextResponse.json({
        success: false,
        error: 'Database tables not properly initialized. Please run the SQL script in Supabase first.',
        details: ordersError
      }, { status: 500 });
    }

    // Test if products table exists
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productsError) {
      console.log('Products table does not exist or has issues:', productsError);
      return NextResponse.json({
        success: false,
        error: 'Database tables not properly initialized. Please run the SQL script in Supabase first.',
        details: productsError
      }, { status: 500 });
    }

    // Test if customers table exists
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (customersError) {
      console.log('Customers table does not exist or has issues:', customersError);
      return NextResponse.json({
        success: false,
        error: 'Database tables not properly initialized. Please run the SQL script in Supabase first.',
        details: customersError
      }, { status: 500 });
    }

    console.log('All database tables are properly initialized');
    return NextResponse.json({
      success: true,
      message: 'All database tables are properly initialized',
      tables: {
        maintenance: maintenanceData?.length || 0,
        orders: ordersData?.length || 0,
        products: productsData?.length || 0,
        customers: customersData?.length || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check database tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}