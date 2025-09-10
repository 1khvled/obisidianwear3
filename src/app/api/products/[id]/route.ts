import { NextRequest, NextResponse } from 'next/server';
import { supabase, deleteProduct } from '@/lib/supabaseDatabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching product from database:', productId);

    // Fetch product from database
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('❌ Error fetching product:', error);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch REAL-TIME inventory data from inventory table
    console.log('🔍 Fetching REAL-TIME inventory data for product:', productId);
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('size, color, available_quantity')
      .eq('product_id', productId);

    if (inventoryError) {
      console.error('❌ Error fetching inventory:', inventoryError);
      // Fall back to product stock if inventory table fails
      console.log('📦 Using product stock as fallback:', product.stock);
      return NextResponse.json(product);
    }

    // Convert inventory data to stock format
    const realTimeStock: any = {};
    if (inventoryData && inventoryData.length > 0) {
      inventoryData.forEach((item: any) => {
        if (!realTimeStock[item.size]) {
          realTimeStock[item.size] = {};
        }
        realTimeStock[item.size][item.color] = item.available_quantity;
      });
    }

    console.log('✅ REAL-TIME inventory data:', realTimeStock);

    // Update product with real-time stock data
    const productWithRealTimeStock = {
      ...product,
      stock: realTimeStock
    };

    return NextResponse.json(productWithRealTimeStock);
  } catch (error) {
    console.error('❌ Error in product API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('🔧 Updating product:', productId, {
      name: body.name,
      customSizeChart: body.customSizeChart,
      useCustomSizeChart: body.useCustomSizeChart,
      sizeChartCategory: body.sizeChartCategory
    });

    // Update product in database
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        image: body.image,
        images: body.images,
        sizes: body.sizes,
        colors: body.colors,
        stock: body.stock,
        in_stock: body.inStock,
        rating: body.rating,
        reviews: body.reviews,
        sku: body.sku,
        weight: body.weight,
        dimensions: body.dimensions,
        tags: body.tags,
        featured: body.featured,
        custom_size_chart: body.customSizeChart,
        use_custom_size_chart: body.useCustomSizeChart,
        size_chart_category: body.sizeChartCategory,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating product:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('✅ Product updated successfully:', updatedProduct.id);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('❌ Error in product update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('🔧 Products API: DELETE request for product ID:', productId);
    
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