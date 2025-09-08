import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';
import { MadeToOrderProduct } from '@/types';

export async function GET() {
  try {
    console.log('🔧 Fetching made-to-order products...');
    
    // First try with the full query
    let { data, error } = await supabase
      .from('made_to_order_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    console.log('🔧 Full query result:', { data, error });

    // If that fails, try without the is_active filter
    if (error) {
      console.log('🔧 Trying without is_active filter...');
      const result = await supabase
        .from('made_to_order_products')
        .select('*')
        .order('display_order', { ascending: true });
      
      data = result.data;
      error = result.error;
      console.log('🔧 Simple query result:', { data, error });
    }

    // If that still fails, try the most basic query
    if (error) {
      console.log('🔧 Trying basic query...');
      const result = await supabase
        .from('made_to_order_products')
        .select('*');
      
      data = result.data;
      error = result.error;
      console.log('🔧 Basic query result:', { data, error });
    }

    if (error) {
      console.error('❌ Error fetching made-to-order products:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch products', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('✅ Successfully fetched products:', data?.length || 0);
    return NextResponse.json(data || []);
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
    const { name, description, price, image, images, colors, sizes, category, tags, displayOrder } = body;

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
        category: category || 'Custom',
        tags: tags || [],
        display_order: displayOrder || 0,
        is_active: true
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
    const { id, name, description, price, image, images, colors, sizes, category, tags, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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
      .update({
        name,
        description,
        price,
        image: processedImage,
        images: processedImages,
        colors: colors || ['Noir'],
        sizes: sizes || ['S', 'M', 'L', 'XL'],
        category: category || 'Custom',
        tags: tags || [],
        display_order: displayOrder,
        is_active: isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating made-to-order product:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in made-to-order PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
