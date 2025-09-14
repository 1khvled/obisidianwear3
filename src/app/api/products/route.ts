import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { getProducts, addProduct, deleteProduct } from '@/lib/supabaseDatabase';
import { ValidationUtils } from '@/lib/validation';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/products - Get all products
export async function GET() {
  try {
    const products = await getProducts();
    console.log('Products API: GET request - returning', products.length, 'products');
    
    const response = NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      timestamp: Date.now()
    });
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=120');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=120');
    
    return response;
  } catch (error) {
    console.error('Products API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (PROTECTED)
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Products API: POST request received');
    const productData = await request.json();
    console.log('🔧 Products API: Product data:', JSON.stringify(productData, null, 2));
    
    // Validate required fields
    const validation = ValidationUtils.validateRequired(productData, ['name', 'price']);
    if (!validation.isValid) {
      console.error('❌ Products API: Validation failed:', validation.missingFields);
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

    console.log('🔧 Products API: Validating price:', productData.price, 'Type:', typeof productData.price);
    console.log('🔧 Products API: Number conversion:', Number(productData.price));
    console.log('🔧 Products API: Is NaN:', isNaN(Number(productData.price)));
    
    if (!ValidationUtils.isValidNumber(productData.price, 0, 999999)) {
      console.error('❌ Products API: Price validation failed for:', productData.price);
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

    console.log('🔧 Products API: Calling addProduct with:', newProduct);
    
    try {
      const addedProduct = await addProduct(newProduct);
      console.log('🔧 Products API: addProduct result:', addedProduct);
      
      if (!addedProduct) {
        console.error('❌ Products API: addProduct returned null');
        return NextResponse.json(
          { success: false, error: 'Failed to create product - addProduct returned null' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: addedProduct,
        message: 'Product created successfully'
      });
    } catch (addProductError) {
      console.error('❌ Products API: addProduct threw error:', addProductError);
      console.error('❌ Products API: Error type:', typeof addProductError);
      console.error('❌ Products API: Error stack:', addProductError instanceof Error ? addProductError.stack : 'No stack');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create product', 
          details: addProductError instanceof Error ? addProductError.message : 'Unknown error',
          errorType: typeof addProductError,
          fullError: JSON.stringify(addProductError, null, 2)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Products API: POST error:', error);
    console.error('❌ Products API: Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products - Delete product (PROTECTED)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔧 Products API: DELETE request received');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      console.error('❌ Products API: No product ID provided');
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Products API: Deleting product with ID:', productId);
    
    const success = await deleteProduct(productId);
    
    if (success) {
      console.log('✅ Products API: Product deleted successfully');
      return NextResponse.json({
        success: true,
        message: 'Product deleted successfully',
        deletedId: productId
      });
    } else {
      console.error('❌ Products API: Failed to delete product');
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Products API: DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
