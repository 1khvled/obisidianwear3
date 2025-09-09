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