import { NextRequest, NextResponse } from 'next/server';
import { getWilayaTariffs, updateWilayaTariffs } from '@/lib/supabaseDatabase';

// GET /api/wilaya - Get all wilaya tariffs
export async function GET() {
  try {
    const wilayaTariffs = await getWilayaTariffs();
    console.log('Wilaya API: GET request - returning', wilayaTariffs.length, 'wilaya tariffs');
    return NextResponse.json({
      success: true,
      data: wilayaTariffs,
      count: wilayaTariffs.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Wilaya API: GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wilaya tariffs' },
      { status: 500 }
    );
  }
}

// PUT /api/wilaya - Update wilaya tariffs
export async function PUT(request: NextRequest) {
  try {
    const newTariffs = await request.json();
    
    // Validate data structure
    if (!Array.isArray(newTariffs)) {
      return NextResponse.json(
        { success: false, error: 'Data must be an array of wilaya tariffs' },
        { status: 400 }
      );
    }

    // Validate each tariff
    for (const tariff of newTariffs) {
      if (!tariff.name || typeof tariff.homeDelivery !== 'number' || typeof tariff.stopDesk !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each tariff must have name, homeDelivery, and stopDesk' },
          { status: 400 }
        );
      }
    }

    await updateWilayaTariffs(newTariffs);
    
    const updatedTariffs = await getWilayaTariffs();
    console.log('Wilaya API: PUT request - updated', updatedTariffs.length, 'wilaya tariffs');
    
    return NextResponse.json({
      success: true,
      data: updatedTariffs,
      message: 'Wilaya tariffs updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Wilaya API: PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update wilaya tariffs' },
      { status: 500 }
    );
  }
}
