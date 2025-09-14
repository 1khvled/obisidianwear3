'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Cache for maintenance status to avoid repeated API calls
let maintenanceCache: { 
  data: any; 
  timestamp: number; 
  isMaintenanceMode: boolean;
} | null = null;

const CACHE_DURATION = 30000; // 30 seconds cache

export default function StoreStatusChecker() {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Since middleware now handles the main maintenance check,
    // this component is just a lightweight fallback for client-side navigation
    checkStoreStatus();
  }, [pathname]);

  const checkStoreStatus = async () => {
    // Skip check for admin routes, maintenance page, and static files
    if (
      pathname.startsWith('/admin') ||
      pathname === '/maintenance' ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      setChecked(true);
      return;
    }

    try {
      // Check cache first
      const now = Date.now();
      if (maintenanceCache && (now - maintenanceCache.timestamp) < CACHE_DURATION) {
        console.log('📦 Using cached maintenance status (fallback)');
        if (maintenanceCache.isMaintenanceMode && pathname !== '/maintenance') {
          console.log('🔴 Store is OFF (cached fallback) - Redirecting to maintenance page');
          router.push('/maintenance');
        }
        setChecked(true);
        return;
      }

      // Quick fallback check with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout

      const response = await fetch('/api/maintenance', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=30',
        }
      });
      
      clearTimeout(timeoutId);
      const settings = await response.json();
      
      // Update cache
      maintenanceCache = {
        data: settings,
        timestamp: now,
        isMaintenanceMode: settings.is_maintenance_mode === true
      };
      
      // If store is in maintenance mode (true) and not on maintenance page, redirect to maintenance
      if (settings.is_maintenance_mode === true && pathname !== '/maintenance') {
        console.log('🔴 Store is OFF (fallback) - Redirecting to maintenance page');
        router.push('/maintenance');
      }
    } catch (error) {
      console.error('Error in fallback maintenance check:', error);
      // On error, allow access (fail open)
    } finally {
      setChecked(true);
    }
  };

  // No loading screen needed since middleware handles the main check
  // This component is just a lightweight fallback
  return null;
}
