import { NextRequest, NextResponse } from 'next/server';

// Server-side admin credentials (NEVER expose these in client code)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'khvled',
  password: process.env.ADMIN_PASSWORD || 'Dzt3ch456@',
};

// Rate limiting storage (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) return false;
  
  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return false;
  }
  
  return attempts.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  
  attempts.count += 1;
  attempts.lastAttempt = now;
  loginAttempts.set(ip, attempts);
}

function recordSuccessfulAttempt(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many failed login attempts. Please try again later.' 
        }, 
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    const isValidUsername = username === ADMIN_CREDENTIALS.username;
    const isValidPassword = password === ADMIN_CREDENTIALS.password;

    if (isValidUsername && isValidPassword) {
      recordSuccessfulAttempt(ip);
      return NextResponse.json({ success: true });
    } else {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
