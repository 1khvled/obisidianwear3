'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function StoreStatusChecker() {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
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
      const response = await fetch('/api/maintenance');
      const settings = await response.json();
      
      // If store is in maintenance mode (true) and not on maintenance page, redirect to maintenance
      if (settings.is_maintenance_mode === true && pathname !== '/maintenance') {
        console.log('🔴 Store is OFF - Redirecting to maintenance page');
        router.push('/maintenance');
      }
    } catch (error) {
      console.error('Error checking store status:', error);
      // On error, allow access (fail open)
    } finally {
      setChecked(true);
    }
  };

  // Don't render anything until we've checked the store status
  if (!checked) {
    return null;
  }

  return null; // This component doesn't render anything
}
