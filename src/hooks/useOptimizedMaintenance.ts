// Optimized maintenance hook for instant status switching
import { useState, useEffect, useCallback } from 'react';
import { optimizedMaintenanceService, MaintenanceStatus } from '../lib/optimizedMaintenanceService';

export interface UseOptimizedMaintenanceReturn {
  status: MaintenanceStatus;
  loading: boolean;
  error: string | null;
  toggleStatus: () => Promise<boolean>;
  setStatus: (status: 'online' | 'offline') => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  analytics: any;
}

export function useOptimizedMaintenance(): UseOptimizedMaintenanceReturn {
  const [status, setStatus] = useState<MaintenanceStatus>({ 
    status: 'online', 
    updated_at: new Date().toISOString() 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Load maintenance status
  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statusData, analyticsData] = await Promise.all([
        optimizedMaintenanceService.getMaintenanceStatus(),
        optimizedMaintenanceService.getMaintenanceAnalytics()
      ]);
      
      setStatus(statusData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh status
  const refreshStatus = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  // Set maintenance status
  const setMaintenanceStatus = useCallback(async (newStatus: 'online' | 'offline'): Promise<boolean> => {
    try {
      // Optimistic update - update UI immediately
      setStatus(prev => ({
        ...prev,
        status: newStatus,
        updated_at: new Date().toISOString()
      }));

      const success = await optimizedMaintenanceService.setMaintenanceStatus(newStatus);
      
      if (!success) {
        // Revert on failure
        await loadStatus();
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to set maintenance status:', err);
      await loadStatus(); // Revert on error
      return false;
    }
  }, [loadStatus]);

  // Toggle maintenance status
  const toggleStatus = useCallback(async (): Promise<boolean> => {
    const newStatus = status.status === 'online' ? 'offline' : 'online';
    return await setMaintenanceStatus(newStatus);
  }, [status.status, setMaintenanceStatus]);

  // Load status on mount
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loadStatus, loading]);

  return {
    status,
    loading,
    error,
    toggleStatus,
    setStatus: setMaintenanceStatus,
    refreshStatus,
    analytics
  };
}
