import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceStatus, updateMaintenanceStatus } from '@/lib/supabaseDatabase';
import { createAuthenticatedHandler, AuthenticatedRequest } from '@/lib/authMiddleware';

// GET endpoint - public (for maintenance page display)
export async function GET() {
  try {
    const status = await getMaintenanceStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance status' }, { status: 500 });
  }
}

// POST endpoint - requires authentication
export const POST = createAuthenticatedHandler(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    console.log('Maintenance API received from user:', request.user?.username, body);
    
    // Handle different parameter names
    const isMaintenance = body.isMaintenance || body.is_maintenance;
    const dropDate = body.dropDate || body.drop_date;
    
    const success = await updateMaintenanceStatus(isMaintenance, dropDate);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update maintenance status' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    return NextResponse.json({ error: 'Failed to update maintenance status' }, { status: 500 });
  }
});
