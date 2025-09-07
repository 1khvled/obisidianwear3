import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { getProducts, addProduct } from '@/lib/supabaseDatabase';
import { withAuth } from '@/lib/authMiddleware';
import { ValidationUtils } from '@/lib/validation';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

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

// POST /api/products - Create new product (PROTECTED)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const productData = await request.json();
    
    // Validate required fields
    const validation = ValidationUtils.validateRequired(productData, ['name', 'price']);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${validation.missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate and sanitize data
    if (!ValidationUtils.validateLength(productData.name, 1, 100)) {
      return NextResponse.json(
        { success: false, error: 'Product name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    if (!ValidationUtils.isValidNumber(productData.price, 0, 999999)) {
      return NextResponse.json(
        { success: false, error: 'Price must be a valid number between 0 and 999999' },
        { status: 400 }
      );
    }

    // Sanitize product data
    const sanitizedData = ValidationUtils.sanitizeProductData(productData);

    // Generate unique ID
    const newProduct: Product = {
      id: Date.now().toString(),
      ...sanitizedData,
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
});
