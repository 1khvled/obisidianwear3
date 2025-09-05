// Optimized Maintenance API Route
import { NextRequest, NextResponse } from 'next/server';
import { optimizedMaintenanceService } from '../../../../lib/optimizedMaintenanceService';

export async function GET(request: NextRequest) {
  try {
    const status = await optimizedMaintenanceService.getMaintenanceStatus();
    
    return NextResponse.json({ 
      success: true, 
      status,
      message: 'Maintenance status retrieved successfully (optimized)' 
    });
  } catch (error) {
    console.error('Maintenance status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['online', 'offline'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "online" or "offline"' },
        { status: 400 }
      );
    }

    const success = await optimizedMaintenanceService.setMaintenanceStatus(status);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        status: { status, updated_at: new Date().toISOString() },
        message: `Maintenance status set to ${status} successfully` 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update maintenance status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Maintenance status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance status' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'toggle') {
      const success = await optimizedMaintenanceService.toggleMaintenanceStatus();
      
      if (success) {
        // Get the new status
        const newStatus = await optimizedMaintenanceService.getMaintenanceStatus();
        return NextResponse.json({ 
          success: true, 
          status: newStatus,
          message: 'Maintenance status toggled successfully' 
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to toggle maintenance status' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "toggle" or specify status in POST' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Maintenance toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle maintenance status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear maintenance service cache
    optimizedMaintenanceService.clearCache();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance cache cleared successfully' 
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
