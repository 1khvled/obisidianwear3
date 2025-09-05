// Preferences service for managing user preferences (language, theme, etc.)
import { supabase } from './supabaseDatabase';

export interface UserPreferences {
  id: string;
  sessionId: string;
  language: string;
  theme: string;
  updatedAt: string;
}

class PreferencesService {
  private static instance: PreferencesService;
  private sessionId: string;
  private cache: UserPreferences | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('obsidian-preferences-session-id');
      if (!sessionId) {
        sessionId = 'prefs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('obsidian-preferences-session-id', sessionId);
      }
      return sessionId;
    }
    return 'server_' + Date.now();
  }

  async getPreferences(): Promise<UserPreferences | null> {
    // Check cache first
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('session_id', this.sessionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching preferences:', error);
        return null;
      }

      if (data) {
        this.cache = data;
        this.cacheTime = now;
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }

  async setLanguage(language: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          session_id: this.sessionId,
          language,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error setting language:', error);
        return false;
      }

      // Clear cache
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error setting language:', error);
      return false;
    }
  }

  async setTheme(theme: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          session_id: this.sessionId,
          theme,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error setting theme:', error);
        return false;
      }

      // Clear cache
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error setting theme:', error);
      return false;
    }
  }

  async getLanguage(): Promise<string> {
    const prefs = await this.getPreferences();
    return prefs?.language || 'en';
  }

  async getTheme(): Promise<string> {
    const prefs = await this.getPreferences();
    return prefs?.theme || 'dark';
  }

  // Fallback to localStorage for immediate response
  getLanguageSync(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('obsidian-language') || 'en';
    }
    return 'en';
  }

  getThemeSync(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-theme') || 'dark';
    }
    return 'dark';
  }

  // Sync localStorage to database
  async syncFromLocalStorage(): Promise<void> {
    if (typeof window !== 'undefined') {
      const language = localStorage.getItem('obsidian-language');
      const theme = localStorage.getItem('admin-theme');

      if (language) {
        await this.setLanguage(language);
      }
      if (theme) {
        await this.setTheme(theme);
      }
    }
  }
}

export default PreferencesService.getInstance();
