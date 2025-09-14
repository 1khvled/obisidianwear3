import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// PUT /api/inventory/[id] - Update inventory record
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity } = body;

    console.log(`🔄 DEBUG API: Updating inventory record ${id} with quantity ${quantity}`);
    console.log(`🔄 DEBUG API: Full request body:`, body);
    console.log(`🔄 DEBUG API: Request timestamp:`, new Date().toISOString());

    // Parse the inventory ID to extract product info
    // Format: INV-{productId}-{size}-{color}
    const parts = id.replace('INV-', '').split('-');
    console.log('🔍 DEBUG API: Parsed parts:', parts);
    
    if (parts.length < 3) {
      console.error('❌ DEBUG API: Invalid inventory ID format:', id, 'parts:', parts);
      return NextResponse.json(
        { success: false, error: 'Invalid inventory ID format' },
        { status: 400 }
      );
    }

    const productId = parts[0];
    const size = parts[1];
    const color = parts[2];
    
    console.log('🔍 DEBUG API: Extracted info:', { productId, size, color });

    // Get the current product
    console.log('🔍 DEBUG API: Looking up product with ID:', productId);
    console.log('🔍 DEBUG API: Product ID type:', typeof productId);
    
    // Try to find the product with different ID formats
    let product = null;
    let productError = null;
    
    // First try with the exact ID
    const { data: productData, error: productErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (productErr) {
      console.log('🔍 DEBUG API: Direct ID lookup failed, trying as string...');
      // Try with string conversion
      const { data: productData2, error: productErr2 } = await supabase
        .from('products')
        .select('*')
        .eq('id', String(productId))
        .single();
      
      if (productErr2) {
        console.log('🔍 DEBUG API: String ID lookup failed, trying as number...');
        // Try with number conversion
        const { data: productData3, error: productErr3 } = await supabase
          .from('products')
          .select('*')
          .eq('id', Number(productId))
          .single();
        
        product = productData3;
        productError = productErr3;
      } else {
        product = productData2;
        productError = productErr2;
      }
    } else {
      product = productData;
      productError = productErr;
    }

    if (productError || !product) {
      console.error('❌ DEBUG API: Product not found:', productError);
      console.error('❌ DEBUG API: Product ID searched:', productId);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ DEBUG API: Product found:', product.name, 'Current stock:', product.stock);
    console.log('✅ DEBUG API: Product ID type:', typeof productId, 'Value:', productId);

    // Update the stock data in the product
    const currentStock = product.stock || {};
    console.log('🔍 DEBUG API: Current stock structure:', currentStock);
    console.log('🔍 DEBUG API: Current stock for', size, color, ':', currentStock[size]?.[color]);
    
    if (!currentStock[size]) {
      currentStock[size] = {};
      console.log('🔍 DEBUG API: Created new size entry for:', size);
    }
    currentStock[size][color] = quantity;
    
    console.log('🔍 DEBUG API: Updated stock structure:', currentStock);
    console.log('🔍 DEBUG API: Setting stock for', size, color, 'to', quantity);
    console.log('🔍 DEBUG API: Final stock value for', size, color, ':', currentStock[size][color]);

    // Update the product with new stock data
    console.log('🔍 Updating product in database:', {
      productId,
      productIdType: typeof productId,
      currentStock,
      updateData: {
        stock: currentStock,
        in_stock: Object.values(currentStock).some((sizeStock: any) => 
          Object.values(sizeStock).some((qty: any) => qty > 0)
        )
      }
    });
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: currentStock,
        in_stock: Object.values(currentStock).some((sizeStock: any) => 
          Object.values(sizeStock).some((qty: any) => qty > 0)
        )
      })
      .eq('id', productId);

    if (updateError) {
      console.error('❌ DEBUG API: Error updating product stock:', updateError);
      console.error('❌ DEBUG API: Update details:', { productId, currentStock, updateError });
      return NextResponse.json(
        { success: false, error: 'Failed to update product stock' },
        { status: 500 }
      );
    }

    console.log('✅ DEBUG API: Product stock updated successfully');

    // Skip inventory table - only use products table for better performance
    console.log('✅ DEBUG API: Skipping inventory table update (using products table only)');
    
    console.log('✅ Database update successful');

    // Verify the update by fetching the product again
    console.log('🔄 DEBUG API: Verifying update by fetching product again...');
    const { data: updatedProduct, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (verifyError) {
      console.error('❌ DEBUG API: Error verifying update:', verifyError);
    } else {
    console.log('✅ DEBUG API: Verification successful:', {
      productName: updatedProduct.name,
      updatedStock: updatedProduct.stock,
      specificStock: updatedProduct.stock?.[size]?.[color],
      expectedQuantity: quantity,
      actualQuantity: updatedProduct.stock?.[size]?.[color],
      match: updatedProduct.stock?.[size]?.[color] === quantity
    });
    
    if (updatedProduct.stock?.[size]?.[color] !== quantity) {
      console.error('❌ DEBUG API: DATABASE UPDATE FAILED! Expected:', quantity, 'Got:', updatedProduct.stock?.[size]?.[color]);
    } else {
      console.log('✅ DEBUG API: Database update verified successfully!');
    }
    }

    console.log(`✅ Successfully updated stock for ${product.name} - ${size} ${color}: ${quantity}`);

    // Create response with no-cache headers
    const response = NextResponse.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        id: id,
        quantity: quantity,
        productId,
        size,
        color
      },
      debug: {
        timestamp: new Date().toISOString(),
        updatedProduct: updatedProduct?.name,
        verifiedStock: updatedProduct?.stock?.[size]?.[color]
      }
    });

    // Disable ALL caching for real-time updates (Vercel-specific)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Cache-Status', 'BYPASS');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Random', Math.random().toString());
    // Vercel-specific headers
    response.headers.set('CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('X-Vercel-Id', Math.random().toString(36));

    return response;

  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/inventory/[id] - Get inventory record
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Parse the inventory ID to extract product info
    const parts = id.replace('INV-', '').split('-');
    if (parts.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid inventory ID format' },
        { status: 400 }
      );
    }

    const productId = parts[0];
    const size = parts[1];
    const color = parts[2];

    // Get the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get the stock quantity for this size/color combination
    const stock = product.stock || {};
    const quantity = stock[size]?.[color] || 0;

    return NextResponse.json({
      success: true,
      data: {
        id,
        product_id: productId,
        size,
        color,
        quantity,
        product_name: product.name,
        product_image: product.image
      }
    });

  } catch (error) {
    console.error('❌ Error getting inventory record:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}