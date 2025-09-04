import { NextRequest, NextResponse } from 'next/server';
import { getInventory } from '@/lib/supabaseDatabase';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// GET /api/inventory - Get all inventory/stock data
export async function GET() {
  try {
    console.log('Inventory API: GET request started');
    
    // Check if Supabase is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Inventory API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const inventory = await getInventory();
    
    console.log('Inventory API: Returning inventory for', inventory.length, 'products');
    
    return NextResponse.json({
      success: true,
      data: inventory,
      count: inventory.length,
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
