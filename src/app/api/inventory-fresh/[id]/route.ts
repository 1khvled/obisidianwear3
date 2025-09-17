import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// PUT /api/inventory-fresh/[id] - Nuclear fresh inventory update
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🚀 NUCLEAR FRESH UPDATE: Starting nuclear fresh inventory update at', new Date().toISOString());
    
    const { quantity, reason } = await request.json();
    
    // Parse inventory ID to get product details
    const inventoryId = params.id;
    const parts = inventoryId.split('-');
    if (parts.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Invalid inventory ID format' },
        { status: 400 }
      );
    }
    
    const productId = parts[1];
    const size = parts[2];
    const color = parts[3];
    
    console.log('🚀 NUCLEAR FRESH UPDATE: Updating', { productId, size, color, quantity });

    // Create a brand new Supabase client with unique config
    const freshSupabase = createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          'X-Client-Info': `fresh-update-${Date.now()}`,
          'X-Request-ID': Math.random().toString(36),
          'X-Cache-Bypass': 'true'
        }
      }
    });

    // Get current product data
    const { data: product, error: productError } = await freshSupabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('❌ NUCLEAR FRESH UPDATE: Product not found:', productError);
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Update stock with explicit JSONB handling
    let currentStock = product.stock || {};
    if (!currentStock[size]) {
      currentStock[size] = {};
    }
    currentStock[size][color] = quantity;

    // Calculate in_stock status
    const hasStock = Object.values(currentStock).some((sizeStock: any) =>
      Object.values(sizeStock).some((qty: any) => qty > 0)
    );

    console.log('🚀 NUCLEAR FRESH UPDATE: Updating product stock:', { productId, currentStock, hasStock });

    // Update with explicit timestamp
    const updateTimestamp = new Date().toISOString();
    const { error: updateError } = await freshSupabase
      .from('products')
      .update({
        stock: currentStock,
        in_stock: hasStock,
        updated_at: updateTimestamp
      })
      .eq('id', productId);

    if (updateError) {
      console.error('❌ NUCLEAR FRESH UPDATE: Error updating product stock:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update product stock', error: updateError },
        { status: 500 }
      );
    }

    console.log('✅ NUCLEAR FRESH UPDATE: Database update successful');

    // Wait longer for database consistency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify with a completely fresh read
    console.log('🔄 NUCLEAR FRESH UPDATE: Verifying with fresh read...');
    const { data: verifiedProduct, error: verifyError } = await freshSupabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .order('updated_at', { ascending: false })
      .single();

    if (verifyError || !verifiedProduct) {
      console.error('❌ NUCLEAR FRESH UPDATE: Error verifying update:', verifyError);
    } else {
      const actualQuantity = verifiedProduct.stock?.[size]?.[color];
      console.log('✅ NUCLEAR FRESH UPDATE: Verification result:', {
        expected: quantity,
        actual: actualQuantity,
        match: actualQuantity === quantity,
        updated_at: verifiedProduct.updated_at
      });
    }

    console.log(`✅ NUCLEAR FRESH UPDATE: Successfully updated stock for ${product.name} - ${size} ${color}: ${quantity}`);

    // Create response with nuclear cache-busting headers
    const response = NextResponse.json({
      success: true,
      message: 'Nuclear fresh inventory updated successfully',
      data: {
        id: params.id,
        product_id: productId,
        size,
        color,
        quantity,
        updated_at: updateTimestamp,
        product_name: product.name,
        product_image: product.image
      },
      nuclear: true,
      debug: {
        updatedStock: currentStock,
        verifiedStock: verifiedProduct?.stock?.[size]?.[color],
        fullVerifiedStock: verifiedProduct?.stock,
        updateTimestamp
      }
    });

    // Nuclear cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate, no-transform, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Timestamp', Date.now().toString());
    response.headers.set('X-Cache-Status', 'BYPASS');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Random', Math.random().toString());
    response.headers.set('X-Nuclear', 'true');
    
    // Vercel-specific nuclear headers
    response.headers.set('CDN-Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('X-Vercel-Id', Math.random().toString(36));
    response.headers.set('X-Vercel-Nuclear', 'true');

    return response;
  } catch (error) {
    console.error('❌ NUCLEAR FRESH UPDATE: Error:', error);
    return NextResponse.json(
      { success: false, message: 'Nuclear fresh update failed', error: error },
      { status: 500 }
    );
  }
}
