import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, apiRateLimiter } from './rateLimiter';

// Simple authentication middleware for API routes
export function authenticateRequest(request: NextRequest): boolean {
  // Get authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  // Extract token
  const token = authHeader.substring(7);
  
  // Simple token validation (in production, use JWT or proper session validation)
  const expectedToken = process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'obsidian-api-token-2025';
  
  return token === expectedToken;
}

// Middleware wrapper for protected API routes
export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Skip auth for public routes
    const url = new URL(request.url);
    const publicRoutes = ['/api/maintenance', '/api/test-db', '/api/test-supabase'];
    
    if (publicRoutes.some(route => url.pathname.startsWith(route))) {
      return handler(request, ...args);
    }

    // Get client IP for rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP, apiRateLimiter);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.' 
        },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    // Check authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Authentication required' 
        },
        { 
          status: 401,
          headers: rateLimitResult.headers
        }
      );
    }

    return handler(request, ...args);
  };
}

// Generate API token for admin
export function generateApiToken(): string {
  return process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'obsidian-api-token-2025';
}
