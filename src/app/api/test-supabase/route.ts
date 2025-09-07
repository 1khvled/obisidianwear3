import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure we use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: {
          error: error.message,
          code: error.code,
          hint: error.hint
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      details: {
        url: supabaseUrl,
        hasData: !!data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
