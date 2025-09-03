import { NextRequest, NextResponse } from 'next/server';

// Wilaya tariff type definition
interface WilayaTariff {
  id: string;
  name: string;
  homeDelivery: number;
  stopDesk: number;
  order: number;
}

// In-memory storage (will be replaced with Vercel KV)
let wilayaTariffs: WilayaTariff[] = [
  { id: '1', name: 'Alger', homeDelivery: 400, stopDesk: 200, order: 1 },
  { id: '2', name: 'Oran', homeDelivery: 500, stopDesk: 300, order: 2 },
  { id: '3', name: 'Constantine', homeDelivery: 600, stopDesk: 400, order: 3 },
  { id: '4', name: 'Blida', homeDelivery: 400, stopDesk: 200, order: 4 },
  { id: '5', name: 'Setif', homeDelivery: 500, stopDesk: 300, order: 5 },
  { id: '6', name: 'Batna', homeDelivery: 600, stopDesk: 400, order: 6 },
  { id: '7', name: 'Annaba', homeDelivery: 700, stopDesk: 500, order: 7 },
  { id: '8', name: 'Sidi Bel Abbes', homeDelivery: 600, stopDesk: 400, order: 8 },
  { id: '9', name: 'Tlemcen', homeDelivery: 700, stopDesk: 500, order: 9 },
  { id: '10', name: 'Biskra', homeDelivery: 800, stopDesk: 600, order: 10 }
];

// GET /api/wilaya - Get all wilaya tariffs
export async function GET() {
  try {
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

    wilayaTariffs = newTariffs;
    
    console.log('Wilaya API: PUT request - updated', wilayaTariffs.length, 'wilaya tariffs');
    
    return NextResponse.json({
      success: true,
      data: wilayaTariffs,
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
