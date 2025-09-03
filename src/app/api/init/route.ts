import { NextResponse } from 'next/server';
import { postgresService } from '@/lib/postgresService';

// POST /api/init - Initialize default data
export async function POST() {
  try {
    await postgresService.initializeDefaultData();
    
    return NextResponse.json({
      success: true,
      message: 'Default data initialized successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Init API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize default data' },
      { status: 500 }
    );
  }
}
