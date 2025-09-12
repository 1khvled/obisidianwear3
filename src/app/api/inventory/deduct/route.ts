import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, color, quantity } = body;

    if (!productId || !size || !color || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📦 Deducting stock:', { productId, size, color, quantity });

    // Get current quantity
    const { data: currentData, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color)
      .single();

    if (fetchError || !currentData) {
      console.error('❌ Error fetching current stock:', fetchError);
      return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 });
    }

    const newQuantity = Math.max(0, currentData.quantity - quantity);

    // Update quantity
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color);

    if (updateError) {
      console.error('❌ Error updating stock:', updateError);
      return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
    }

    console.log('✅ Stock deducted successfully:', { 
      productId, 
      size, 
      color, 
      deducted: quantity, 
      newQuantity 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Stock deducted successfully',
      newQuantity 
    });

  } catch (error) {
    console.error('❌ Error deducting stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
