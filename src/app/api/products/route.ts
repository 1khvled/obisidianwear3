import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { getProducts, addProduct } from '@/lib/supabaseDatabase';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/products - Get all products
export async function GET() {
  try {
    console.log('Products API: GET request started');
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Products API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const products = await getProducts();
    console.log('Products API: GET request - returning', products.length, 'products');
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Products API: GET error:', error);
    console.error('Products API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const addedProduct = await addProduct(newProduct);
    
    console.log('Products API: POST request - created product:', newProduct.id, newProduct.name);
    
    return NextResponse.json({
      success: true,
      data: addedProduct,
      message: 'Product created successfully',
      timestamp: Date.now()
    }, { status: 201 });
  } catch (error) {
    console.error('Products API: POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
