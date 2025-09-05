import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST() {
  try {
    console.log('Initializing database tables...');

    // Create maintenance_status table
    const { error: maintenanceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS maintenance_status (
          id TEXT PRIMARY KEY DEFAULT 'maintenance',
          is_maintenance BOOLEAN NOT NULL DEFAULT false,
          drop_date TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        INSERT INTO maintenance_status (id, is_maintenance, drop_date, updated_at)
        VALUES ('maintenance', false, NOW() + INTERVAL '30 days', NOW())
        ON CONFLICT (id) DO NOTHING;
        
        ALTER TABLE maintenance_status ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to maintenance status" 
        ON maintenance_status FOR SELECT 
        USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public update access to maintenance status" 
        ON maintenance_status FOR ALL 
        USING (true);
      `
    });

    if (maintenanceError) {
      console.error('Error creating maintenance table:', maintenanceError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create maintenance table',
        details: maintenanceError.message 
      }, { status: 500 });
    }

    console.log('Database initialization completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
