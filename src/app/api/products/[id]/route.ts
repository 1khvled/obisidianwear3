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

    // Use the product's stock data directly (this is the real-time data)
    console.log('📦 Using product stock data directly:', product.stock);
    
    // Ensure the product has proper stock structure
    const stockData = product.stock || {};
    const inStock = product.in_stock !== false && (
      Object.keys(stockData).length > 0 
        ? Object.values(stockData).some((sizeStock: any) => 
            Object.values(sizeStock).some((quantity: any) => quantity > 0)
          )
        : false
    );

    // Update product with proper stock status
    const productWithStock = {
      ...product,
      stock: stockData,
      inStock: inStock
    };

    console.log('✅ Product with stock data:', {
      id: product.id,
      name: product.name,
      stock: stockData,
      inStock: inStock
    });

    const response = NextResponse.json({
      success: true,
      data: productWithStock
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    return response;
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

    // Get current product data to compare colors and sizes
    const { data: currentProduct, error: currentError } = await supabase
      .from('products')
      .select('colors, sizes, stock')
      .eq('id', productId)
      .single();

    if (currentError) {
      console.error('❌ Error fetching current product:', currentError);
      return NextResponse.json({ error: 'Failed to fetch current product' }, { status: 500 });
    }

    // Clean up inventory records for removed colors and sizes
    if (currentProduct) {
      const currentColors = currentProduct.colors || [];
      const newColors = body.colors || [];
      const currentSizes = currentProduct.sizes || [];
      const newSizes = body.sizes || [];
      
      const removedColors = currentColors.filter((color: string) => !newColors.includes(color));
      const removedSizes = currentSizes.filter((size: string) => !newSizes.includes(size));
      
      if (removedColors.length > 0 || removedSizes.length > 0) {
        console.log('🧹 Cleaning up inventory for removed colors/sizes:', { removedColors, removedSizes });
        
        // Delete inventory records for removed colors
        for (const color of removedColors) {
          const { error: colorError } = await supabase
            .from('inventory')
            .delete()
            .eq('product_id', productId)
            .eq('color', color);
          
          if (colorError) {
            console.error(`❌ Error deleting inventory for color ${color}:`, colorError);
          } else {
            console.log(`✅ Deleted inventory records for color: ${color}`);
          }
        }
        
        // Delete inventory records for removed sizes
        for (const size of removedSizes) {
          const { error: sizeError } = await supabase
            .from('inventory')
            .delete()
            .eq('product_id', productId)
            .eq('size', size);
          
          if (sizeError) {
            console.error(`❌ Error deleting inventory for size ${size}:`, sizeError);
          } else {
            console.log(`✅ Deleted inventory records for size: ${size}`);
          }
        }
      }
    }

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