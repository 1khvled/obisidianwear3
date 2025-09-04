import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('Testing maintenance status...');
    
    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('maintenance_status')
      .select('*')
      .limit(1);
    
    console.log('Table check result:', { tableCheck, tableError });
    
    if (tableError) {
      return NextResponse.json({ 
        error: 'Table check failed', 
        details: tableError.message,
        code: tableError.code 
      }, { status: 500 });
    }
    
    // Test 2: Try to get maintenance status
    const { data: status, error: statusError } = await supabase
      .from('maintenance_status')
      .select('*')
      .single();
    
    console.log('Status check result:', { status, statusError });
    
    if (statusError) {
      return NextResponse.json({ 
        error: 'Status check failed', 
        details: statusError.message,
        code: statusError.code 
      }, { status: 500 });
    }
    
    // Test 3: Try to update maintenance status
    const { data: updateData, error: updateError } = await supabase
      .from('maintenance_status')
      .upsert({
        id: 'maintenance',
        is_maintenance: false,
        drop_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    console.log('Update test result:', { updateData, updateError });
    
    if (updateError) {
      return NextResponse.json({ 
        error: 'Update test failed', 
        details: updateError.message,
        code: updateError.code 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tests passed',
      currentStatus: status,
      updateResult: updateData
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
