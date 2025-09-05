// Optimized Maintenance Service for instant status switching
import { supabase } from './supabaseDatabase';

export interface MaintenanceStatus {
  id?: number;
  status: 'online' | 'offline';
  updated_at?: string;
}

class OptimizedMaintenanceService {
  private cache: MaintenanceStatus | null = null;
  private cacheTimeout = 5000; // 5 seconds
  private lastFetch = 0;

  // Get maintenance status with caching
  async getMaintenanceStatus(): Promise<MaintenanceStatus> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && now - this.lastFetch < this.cacheTimeout) {
      return this.cache;
    }

    try {
      const { data, error } = await supabase
        .from('maintenance_status')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      const statusData = data || { status: 'online', updated_at: new Date().toISOString() };
      this.cache = statusData;
      this.lastFetch = now;
      
      return statusData;
    } catch (error) {
      console.error('Failed to fetch maintenance status:', error);
      // Return cached data or default
      return this.cache || { status: 'online', updated_at: new Date().toISOString() };
    }
  }

  // Set maintenance status with optimistic updates
  async setMaintenanceStatus(status: 'online' | 'offline'): Promise<boolean> {
    try {
      // Optimistic update - update cache immediately
      const optimisticStatus: MaintenanceStatus = {
        status,
        updated_at: new Date().toISOString()
      };
      
      this.cache = optimisticStatus;
      this.lastFetch = Date.now();

      // Background database update
      setTimeout(async () => {
        try {
          const { error } = await supabase
            .from('maintenance_status')
            .insert([{ status }]);

          if (error) {
            console.error('Maintenance status update error:', error);
            // Could emit error event for UI to handle
          } else {
            console.log('Maintenance status updated successfully');
          }
        } catch (err) {
          console.error('Background maintenance update failed:', err);
        }
      }, 0);

      return true;
    } catch (error) {
      console.error('Failed to set maintenance status:', error);
      return false;
    }
  }

  // Toggle maintenance status
  async toggleMaintenanceStatus(): Promise<boolean> {
    const currentStatus = await this.getMaintenanceStatus();
    const newStatus = currentStatus.status === 'online' ? 'offline' : 'online';
    return await this.setMaintenanceStatus(newStatus);
  }

  // Get maintenance analytics
  async getMaintenanceAnalytics() {
    try {
      const { data, error } = await supabase.rpc('get_maintenance_analytics');
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Failed to get maintenance analytics:', error);
      return null;
    }
  }

  // Clear cache
  clearCache() {
    this.cache = null;
    this.lastFetch = 0;
  }

  // Get cached status
  getCachedStatus(): MaintenanceStatus | null {
    const now = Date.now();
    if (this.cache && now - this.lastFetch < this.cacheTimeout) {
      return this.cache;
    }
    return null;
  }
}

export const optimizedMaintenanceService = new OptimizedMaintenanceService();
