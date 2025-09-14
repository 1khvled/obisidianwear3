import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';
import { MadeToOrderProduct } from '@/types';

export async function GET() {
  const apiStartTime = performance.now();
  console.log('🚀 [API DEBUG] API route started at:', new Date().toISOString());
  
  try {
    console.log('🔧 [API DEBUG] Fetching made-to-order products...');
    
    // Try optimized database query
    let data: any[] = [];
    let error: any = null;
    
    try {
      const queryStartTime = performance.now();
      console.log('🗄️ [API DEBUG] Starting optimized database query...');
      
      // Original working query
      const queryPromise = supabase
        .from('made_to_order_products')
        .select('id, name, price, image, images, description, colors, sizes, category')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(20); // Back to original limit
      
      // Remove timeout race condition - let the query run normally
      const result = await queryPromise;
      const queryEndTime = performance.now();
      console.log('⏱️ [API DEBUG] Database query completed in:', (queryEndTime - queryStartTime).toFixed(2), 'ms');
      
      data = result.data || [];
      error = result.error;
      
      console.log('🔧 [API DEBUG] Query result:', { 
        dataLength: data?.length, 
        error: error?.code,
        hasData: !!data
      });
      
    } catch (queryError) {
      const queryTime = performance.now() - apiStartTime;
      console.log('🔧 [API DEBUG] Query failed after', queryTime.toFixed(2), 'ms:', queryError);
      data = [];
      error = { code: 'QUERY_ERROR', message: queryError instanceof Error ? queryError.message : 'Query failed' };
    }

    // If there's an error, return empty array
    if (error) {
      console.log('🔧 [API DEBUG] Database error, returning empty products array');
      data = [];
    }

    // All products are considered active
    const activeProducts = data || [];
    
    console.log('✅ [API DEBUG] Successfully fetched products:', activeProducts.length);
    
    const response = NextResponse.json({ 
      success: true, 
      data: activeProducts 
    });
    
    // Add enhanced caching headers for performance optimization
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    const totalApiTime = performance.now() - apiStartTime;
    console.log('🏁 [API DEBUG] Total API response time:', totalApiTime.toFixed(2), 'ms');
    
    return response;
  } catch (error) {
    console.error('❌ Error in made-to-order GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, images, colors, sizes, category, tags, displayOrder, customSizeChart, useCustomSizeChart, sizeChartCategory, stock } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Check if image is too large for VARCHAR(500) - store in images array instead
    let processedImage = image;
    let processedImages = images || [];
    
    if (image && image.length > 500) {
      console.warn('⚠️ Image data is too large for VARCHAR(500) schema. Length:', image.length);
      console.warn('⚠️ Moving image to images array instead');
      // Move the large image to the images array and clear the image field
      processedImages = [image, ...(images || [])];
      processedImage = ''; // Clear the image field
    }

    const { data, error } = await supabase
      .from('made_to_order_products')
      .insert({
        name,
        description,
        price,
        image: processedImage,
        images: processedImages,
        colors: colors || ['Noir'],
        sizes: sizes || ['S', 'M', 'L', 'XL'],
        // stock: stock || {}, // Temporarily commented out to test
        category: category || 'Custom',
        tags: tags || [],
        display_order: displayOrder || 0,
        custom_size_chart: customSizeChart || null,
        use_custom_size_chart: useCustomSizeChart || false,
        size_chart_category: sizeChartCategory || category || 'Custom'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating made-to-order product:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create product', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in made-to-order POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, image, images, colors, sizes, category, tags, displayOrder, isActive, customSizeChart, useCustomSizeChart, sizeChartCategory } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('🔄 Updating made-to-order product:', { id, name, hasImage: !!image, imageLength: image?.length });

    // Optimize image handling to prevent timeouts
    let processedImage = '';
    let processedImages = images || [];
    
    if (image) {
      // If image is a data URL and too large, move to images array
      if (image.startsWith('data:') && image.length > 1000) {
        console.warn('⚠️ Large data URL image detected, moving to images array');
        processedImages = [image, ...(images || [])];
        processedImage = ''; // Clear the image field
      } else if (image.length > 500) {
        console.warn('⚠️ Image data too large for VARCHAR(500), moving to images array');
        processedImages = [image, ...(images || [])];
        processedImage = '';
      } else {
        processedImage = image;
      }
    }

    // Create update object with only necessary fields
    const updateData: any = {
      name: name || '',
      description: description || '',
      price: price || 0,
      category: category || 'Custom',
      display_order: displayOrder || 0,
      custom_size_chart: customSizeChart || null,
      use_custom_size_chart: useCustomSizeChart || false,
      size_chart_category: sizeChartCategory || category || 'Custom'
    };

    // Only update image fields if they have content
    if (processedImage) {
      updateData.image = processedImage;
    }
    if (processedImages.length > 0) {
      updateData.images = processedImages;
    }
    if (colors && colors.length > 0) {
      updateData.colors = colors;
    }
    if (sizes && sizes.length > 0) {
      updateData.sizes = sizes;
    }
    if (tags && tags.length > 0) {
      updateData.tags = tags;
    }

    console.log('📝 Update data prepared:', { 
      id, 
      hasImage: !!updateData.image, 
      imagesCount: updateData.images?.length || 0,
      colorsCount: updateData.colors?.length || 0,
      sizesCount: updateData.sizes?.length || 0
    });

    // Use a timeout promise to prevent hanging
    const updatePromise = supabase
      .from('made_to_order_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 10000)
    );

    const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Error updating made-to-order product:', error);
      
      // Provide more specific error messages
      if (error.code === '57014') {
        return NextResponse.json({ 
          error: 'Database timeout - please try again with smaller images or contact support' 
        }, { status: 408 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to update product', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('✅ Product updated successfully:', data?.id);
    return NextResponse.json({ 
      success: true, 
      data: data 
    });
  } catch (error) {
    console.error('❌ Error in made-to-order PUT:', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Request timeout - please try again with smaller images' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('made_to_order_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting made-to-order product:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in made-to-order DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
