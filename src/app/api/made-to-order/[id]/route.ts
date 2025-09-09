import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

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

    console.log('🔧 Updating made-to-order product size chart:', productId, {
      customSizeChart: body.customSizeChart,
      useCustomSizeChart: body.useCustomSizeChart,
      sizeChartCategory: body.sizeChartCategory
    });

    // Update only the size chart fields in the database
    const { data: updatedProduct, error } = await supabase
      .from('made_to_order_products')
      .update({
        custom_size_chart: body.customSizeChart,
        use_custom_size_chart: body.useCustomSizeChart,
        size_chart_category: body.sizeChartCategory,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating made-to-order product size chart:', error);
      return NextResponse.json({ error: 'Failed to update size chart' }, { status: 500 });
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('✅ Made-to-order product size chart updated successfully:', updatedProduct.id);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Size chart updated successfully'
    });
  } catch (error) {
    console.error('❌ Error in made-to-order size chart update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
