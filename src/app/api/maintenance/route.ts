import { NextRequest, NextResponse } from 'next/server';
import maintenanceService from '@/lib/maintenanceService';

export async function GET() {
  try {
    const status = await maintenanceService.getMaintenanceStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isMaintenance, dropDate } = await request.json();
    
    const success = await maintenanceService.setMaintenanceStatus(isMaintenance, dropDate);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update maintenance status' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    return NextResponse.json({ error: 'Failed to update maintenance status' }, { status: 500 });
  }
}
