import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage with better persistence
// This will work for cross-browser sync within the same deployment
let dataStore: any = {
  products: [],
  orders: [],
  customers: [],
  wilayaTariffs: [],
  lastUpdated: new Date().toISOString(),
  version: 0
};

// Track active connections for real-time updates
const activeConnections = new Set<ReadableStreamDefaultController>();

export async function GET() {
  try {
    console.log('API GET: Returning data, version:', dataStore.version, 'products:', dataStore.products.length);
    return NextResponse.json({
      ...dataStore,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newData = await request.json();
    
    // Update the data store
    dataStore = {
      ...newData,
      lastUpdated: new Date().toISOString(),
      version: (dataStore.version || 0) + 1,
      timestamp: Date.now()
    };
    
    console.log('API POST: Data updated, version:', dataStore.version, 'products:', dataStore.products.length);
    
    return NextResponse.json({ 
      success: true, 
      version: dataStore.version,
      message: 'Data updated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
