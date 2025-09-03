import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { getProducts, addProduct } from '@/lib/supabaseDatabase';

// GET /api/products - Get all products
export async function GET() {
  try {
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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
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
