import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';

// In-memory storage (will be replaced with Vercel KV)
let products: Product[] = [];

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Products API: GET single product:', id);
    
    return NextResponse.json({
      success: true,
      data: product,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Products API: GET single error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct: Product = {
      ...products[productIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    products[productIndex] = updatedProduct;
    
    console.log('Products API: PUT request - updated product:', id);
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Products API: PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);
    
    console.log('Products API: DELETE request - deleted product:', id);
    
    return NextResponse.json({
      success: true,
      data: deletedProduct,
      message: 'Product deleted successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Products API: DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
