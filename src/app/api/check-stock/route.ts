import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const productType = searchParams.get('type'); // 'collection' or 'made-to-order'

    if (!productId || !productType) {
      return NextResponse.json(
        { success: false, error: 'Product ID and type are required' },
        { status: 400 }
      );
    }

    let stockData = null;

    if (productType === 'made-to-order') {
      // Check made-to-order products stock
      const { data, error } = await supabase
        .from('made_to_order_products')
        .select('id, name, stock, colors, sizes')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching made-to-order stock:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch stock data' },
          { status: 500 }
        );
      }

      stockData = data;
    } else {
      // Check collection products stock
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, colors, sizes')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching collection stock:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch stock data' },
          { status: 500 }
        );
      }

      stockData = data;
    }

    if (!stockData) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse stock data and create availability map
    const stock = stockData.stock || {};
    const colors = stockData.colors || ['Default'];
    const sizes = stockData.sizes || ['S', 'M', 'L', 'XL'];

    // Create availability matrix
    const availability: { [key: string]: { [key: string]: number } } = {};
    
    colors.forEach((color: string) => {
      availability[color] = {};
      sizes.forEach((size: string) => {
        // Use the correct stock structure: stock[size][color]
        availability[color][size] = stock[size]?.[color] || 0;
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        productId: stockData.id,
        productName: stockData.name,
        colors,
        sizes,
        availability,
        stock
      }
    });

  } catch (error) {
    console.error('Error in check-stock API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
