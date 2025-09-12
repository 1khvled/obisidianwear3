import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';
import { MadeToOrderProduct } from '@/types';

export async function GET() {
  try {
    console.log('🔧 Fetching made-to-order products...');
    
    // Use a single optimized query with minimal fields first
    let { data, error } = await supabase
      .from('made_to_order_products')
      .select('id, name, description, price, image, images, colors, sizes, category, is_active, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    console.log('🔧 Optimized query result:', { dataLength: data?.length, error });

    // If that fails, try without the is_active filter
    if (error) {
      console.log('🔧 Trying without is_active filter...');
      const result = await supabase
        .from('made_to_order_products')
        .select('id, name, description, price, image, images, colors, sizes, category, is_active, display_order')
        .order('display_order', { ascending: true });
      
      data = result.data;
      error = result.error;
      console.log('🔧 Simple query result:', { dataLength: data?.length, error });
    }

    // If that still fails, try the most basic query
    if (error) {
      console.log('🔧 Trying basic query...');
      const result = await supabase
        .from('made_to_order_products')
        .select('id, name, description, price, image, images, colors, sizes, category, is_active, display_order');
      
      data = result.data;
      error = result.error;
      console.log('🔧 Basic query result:', { dataLength: data?.length, error });
    }

    if (error) {
      console.error('❌ Error fetching made-to-order products:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch products', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    // Filter out inactive products if is_active filter didn't work
    const activeProducts = (data || []).filter(product => product.is_active !== false);
    
    console.log('✅ Successfully fetched products:', activeProducts.length);
    return NextResponse.json(activeProducts);
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
        stock: stock || {},
        category: category || 'Custom',
        tags: tags || [],
        display_order: displayOrder || 0,
        is_active: true,
        custom_size_chart: customSizeChart || null,
        use_custom_size_chart: useCustomSizeChart || false,
        size_chart_category: sizeChartCategory || category || 'Custom'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating made-to-order product:', error);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
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
      is_active: isActive !== undefined ? isActive : true,
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
    return NextResponse.json(data);
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

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in made-to-order DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
