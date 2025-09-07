import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'Set' : 'Not Set',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Not Set',
      GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Not Set',
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not Set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
      NODE_ENV: process.env.NODE_ENV
    };

    return NextResponse.json({ 
      message: 'Environment variables status',
      envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}
