// Session service for managing admin authentication
import { supabase } from './supabaseDatabase';

export interface AdminSession {
  id: string;
  username: string;
  sessionId: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

class SessionService {
  private static instance: SessionService;
  private sessionId: string;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('obsidian-admin-session-id');
      if (!sessionId) {
        sessionId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('obsidian-admin-session-id', sessionId);
      }
      return sessionId;
    }
    return 'server_' + Date.now();
  }

  async createSession(username: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      const expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();
      
      const { error } = await supabase
        .from('admin_sessions')
        .upsert({
          session_id: this.sessionId,
          username,
          is_active: true,
          expires_at: expiresAt
        });

      if (error) {
        console.error('Error creating session:', error);
        return false;
      }

      // Also set cookie for server-side access
      if (typeof document !== 'undefined') {
        document.cookie = `obsidian-admin-session-id=${this.sessionId}; path=/; max-age=${this.SESSION_DURATION / 1000}; secure; samesite=strict`;
      }

      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      return false;
    }
  }

  async getSession(): Promise<AdminSession | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      // Ensure we have a valid session ID
      if (!this.sessionId) {
        console.error('No session ID available');
        return null;
      }

      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_id', this.sessionId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching session:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Check if session is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        // Session expired, deactivate it
        await this.deactivateSession();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  async deactivateSession(): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      const { error } = await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_id', this.sessionId);

      if (error) {
        console.error('Error deactivating session:', error);
        return false;
      }

      // Clear cookie as well
      if (typeof document !== 'undefined') {
        document.cookie = 'obsidian-admin-session-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      return true;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  async getUsername(): Promise<string | null> {
    const session = await this.getSession();
    return session?.username || null;
  }

  // Clean up expired sessions (can be called periodically)
  async cleanupExpiredSessions(): Promise<void> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const now = new Date().toISOString();
      
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .lt('expires_at', now);
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

export default SessionService.getInstance();
