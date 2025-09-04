// Maintenance service that stores status in database for all users
import { getMaintenanceStatus as getMaintenanceFromDB, setMaintenanceStatus as setMaintenanceToDB } from './optimizedDatabase';

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
      const data = await getMaintenanceFromDB();
      
      if (data) {
        this.cache = data;
        this.cacheTime = now;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      return null;
    }
  }

  async setMaintenanceStatus(isMaintenance: boolean, dropDate?: string): Promise<boolean> {
    try {
      console.log('Setting maintenance status:', { isMaintenance, dropDate });
      
      const success = await setMaintenanceToDB(isMaintenance, dropDate);
      
      if (success) {
        // Clear cache to force refresh
        this.cache = null;
        this.cacheTime = 0;
        console.log('Maintenance status updated successfully');
      } else {
        console.error('Failed to update maintenance status');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      return false;
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
