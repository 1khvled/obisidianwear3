import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceSettings, updateMaintenanceSettings } from '@/lib/supabaseDatabase';
import { withAuth } from '@/lib/authMiddleware';

export async function GET() {
  try {
    console.log('API GET maintenance settings - environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    });
    
    const settings = await getMaintenanceSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('API GET maintenance settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance settings', details: error.message },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { is_maintenance_mode, drop_date, maintenance_message } = body;

    console.log('API POST maintenance settings request:', { is_maintenance_mode, drop_date, maintenance_message });

    const settings = await updateMaintenanceSettings({
      is_maintenance_mode,
      drop_date,
      maintenance_message
    });

    console.log('API POST maintenance settings result:', settings);

    return NextResponse.json(settings);
  } catch (error) {
    console.error('API POST maintenance settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance settings', details: error.message },
      { status: 500 }
    );
  }
});
