import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';
import { postgresService } from '@/lib/postgresService';

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await postgresService.getProduct(id);
    
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
    
    const updatedProduct = await postgresService.updateProduct(id, {
      ...updateData,
      updatedAt: new Date()
    });
    
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
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
    
    const deletedProduct = await postgresService.getProduct(id);
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const success = await postgresService.deleteProduct(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      );
    }
    
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
