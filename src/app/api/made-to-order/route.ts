import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';
import { MadeToOrderProduct } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('made_to_order_products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching made-to-order products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in made-to-order GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, images, colors, sizes, category, tags, displayOrder } = body;

    // Validate required fields
    if (!name || !price || !colors || !sizes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('made_to_order_products')
      .insert({
        name,
        description,
        price,
        image,
        images,
        colors,
        sizes,
        category,
        tags,
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

    const { data, error } = await supabase
      .from('made_to_order_products')
      .update({
        name,
        description,
        price,
        image,
        images,
        colors,
        sizes,
        category,
        tags,
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

    const { error } = await supabaseDatabase
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
