import { NextRequest, NextResponse } from 'next/server';
import sessionService from './sessionService';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    username: string;
    sessionId: string;
  };
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get session ID from request headers or cookies
    const sessionId = request.headers.get('x-session-id') || 
                     request.cookies.get('obsidian-admin-session-id')?.value;

    if (!sessionId) {
      console.log('No session ID found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Checking session:', sessionId);

    // Verify session with database using the session ID from the request
    const session = await verifySessionById(sessionId);
    if (!session || !session.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt) {
      await deactivateSessionById(sessionId);
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Add user info to request for use in route handlers
    (request as AuthenticatedRequest).user = {
      username: session.username,
      sessionId: session.sessionId
    };

    return null; // Authentication successful, continue to route handler
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Helper function to verify session by ID
async function verifySessionById(sessionId: string) {
  try {
    const { supabase } = await import('./supabaseDatabase');
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Helper function to deactivate session by ID
async function deactivateSessionById(sessionId: string) {
  try {
    const { supabase } = await import('./supabaseDatabase');
    if (!supabase) return false;

    const { error } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('Error deactivating session:', error);
    return false;
  }
}

export function createAuthenticatedHandler(
  handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    return handler(request as AuthenticatedRequest, context);
  };
}
