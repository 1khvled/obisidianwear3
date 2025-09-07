import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const authToken = process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'obsidian-api-token-2025';
    
    return NextResponse.json({
      success: true,
      authToken: authToken,
      message: 'Auth token retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get auth token',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
