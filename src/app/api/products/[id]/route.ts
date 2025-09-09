import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

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

    console.log('✅ Product fetched successfully:', product.name);
    console.log('📦 Current stock:', product.stock);

    return NextResponse.json(product);
  } catch (error) {
    console.error('❌ Error in product API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}