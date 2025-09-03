import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
// In production, you'd use a real database
let dataStore: any = {
  products: [],
  orders: [],
  customers: [],
  wilayaTariffs: [],
  lastUpdated: new Date().toISOString(),
  version: 0
};

export async function GET() {
  try {
    return NextResponse.json(dataStore);
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
      version: (dataStore.version || 0) + 1
    };
    
    console.log('Data updated, version:', dataStore.version);
    
    return NextResponse.json({ 
      success: true, 
      version: dataStore.version,
      message: 'Data updated successfully' 
    });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
