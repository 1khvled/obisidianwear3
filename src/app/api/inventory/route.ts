import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth } from '@/lib/authMiddleware';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/inventory - Get all inventory
export async function GET() {
  try {
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          id,
          name,
          image,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Inventory API: GET error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inventory,
      message: 'Inventory fetched successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Inventory API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create or update inventory
export const POST = withAuth(async (request: Request) => {
  try {
    const inventoryData = await request.json();
    
    // Validate required fields
    if (!inventoryData.productId || !inventoryData.size || !inventoryData.color) {
      return NextResponse.json(
        { success: false, error: 'Product ID, size, and color are required' },
        { status: 400 }
      );
    }

    const inventoryRecord = {
      id: `INV-${inventoryData.productId}-${inventoryData.size}-${inventoryData.color}`,
      product_id: inventoryData.productId,
      size: inventoryData.size,
      color: inventoryData.color,
      quantity: inventoryData.quantity || 0,
      reserved_quantity: inventoryData.reservedQuantity || 0,
      min_stock_level: inventoryData.minStockLevel || 5,
      max_stock_level: inventoryData.maxStockLevel || 100
    };

    const { data, error } = await supabase
      .from('inventory')
      .upsert([inventoryRecord])
      .select()
      .single();

    if (error) {
      console.error('Inventory API: POST error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create/update inventory' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Inventory updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Inventory API: POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create/update inventory' },
      { status: 500 }
    );
  }
});