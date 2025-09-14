import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip maintenance check for admin routes, maintenance page, API routes, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname === '/maintenance' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    // Just add security headers for these routes
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Check maintenance mode for all other routes
  try {
    const maintenanceResponse = await fetch(`${request.nextUrl.origin}/api/maintenance`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (maintenanceResponse.ok) {
      const maintenanceData = await maintenanceResponse.json();
      
      // If store is in maintenance mode, redirect to maintenance page
      if (maintenanceData.is_maintenance_mode === true) {
        console.log('🔴 Middleware: Store is in maintenance mode - redirecting to maintenance page');
        const maintenanceUrl = new URL('/maintenance', request.url);
        const response = NextResponse.redirect(maintenanceUrl);
        addSecurityHeaders(response);
        return response;
      }
    }
  } catch (error) {
    console.error('❌ Middleware: Error checking maintenance status:', error);
    // On error, allow access (fail open)
  }

  // Store is open or error occurred - proceed normally
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse) {
  // Enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: *.supabase.co;");
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};