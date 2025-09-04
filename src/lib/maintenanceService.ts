// Maintenance service that stores status in database for all users
import { supabase } from './supabaseDatabase';

export interface MaintenanceStatus {
  id: string;
  is_maintenance: boolean;
  drop_date: string;
  updated_at: string;
}

class MaintenanceService {
  private static instance: MaintenanceService;
  private cache: MaintenanceStatus | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): MaintenanceService {
    if (!MaintenanceService.instance) {
      MaintenanceService.instance = new MaintenanceService();
    }
    return MaintenanceService.instance;
  }

  async getMaintenanceStatus(): Promise<MaintenanceStatus | null> {
    // Check cache first
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const { data, error } = await supabase
        .from('maintenance_status')
        .select('*')
        .single();

      if (error) {
        console.error('Database fetch failed, falling back to localStorage:', error);
        
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const storeStatus = localStorage.getItem('obsidian-store-status');
          const dropDate = localStorage.getItem('obsidian-drop-date');
          
          if (storeStatus !== null) {
            const fallbackStatus: MaintenanceStatus = {
              id: 'maintenance',
              is_maintenance: storeStatus === 'true',
              drop_date: dropDate || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            this.cache = fallbackStatus;
            this.cacheTime = now;
            return fallbackStatus;
          }
        }
        
        return null;
      }

      this.cache = data;
      this.cacheTime = now;
      return data;
    } catch (error) {
      console.error('Error fetching maintenance status, falling back to localStorage:', error);
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const storeStatus = localStorage.getItem('obsidian-store-status');
        const dropDate = localStorage.getItem('obsidian-drop-date');
        
        if (storeStatus !== null) {
          const fallbackStatus: MaintenanceStatus = {
            id: 'maintenance',
            is_maintenance: storeStatus === 'true',
            drop_date: dropDate || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          this.cache = fallbackStatus;
          this.cacheTime = now;
          return fallbackStatus;
        }
      }
      
      return null;
    }
  }

  async setMaintenanceStatus(isMaintenance: boolean, dropDate?: string): Promise<boolean> {
    try {
      console.log('Setting maintenance status:', { isMaintenance, dropDate });
      
      // Try database first
      const { data, error } = await supabase
        .from('maintenance_status')
        .upsert({
          id: 'maintenance',
          is_maintenance: isMaintenance,
          drop_date: dropDate || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      console.log('Maintenance status update result:', { data, error });

      if (error) {
        console.error('Database update failed, falling back to localStorage:', error);
        
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('obsidian-store-status', isMaintenance.toString());
          if (dropDate) {
            localStorage.setItem('obsidian-drop-date', dropDate);
          }
        }
        
        // Clear cache to force refresh
        this.cache = null;
        this.cacheTime = 0;
        return true;
      }

      // Clear cache to force refresh
      this.cache = null;
      this.cacheTime = 0;
      return true;
    } catch (error) {
      console.error('Error updating maintenance status, falling back to localStorage:', error);
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('obsidian-store-status', isMaintenance.toString());
        if (dropDate) {
          localStorage.setItem('obsidian-drop-date', dropDate);
        }
      }
      
      return true;
    }
  }

  async isMaintenanceMode(): Promise<boolean> {
    const status = await this.getMaintenanceStatus();
    return status?.is_maintenance || false;
  }

  async getDropDate(): Promise<string | null> {
    const status = await this.getMaintenanceStatus();
    return status?.drop_date || null;
  }
}

export default MaintenanceService.getInstance();
