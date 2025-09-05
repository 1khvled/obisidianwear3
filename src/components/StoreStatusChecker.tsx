'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOptimizedMaintenance } from '../hooks/useOptimizedMaintenance';

export default function StoreStatusChecker() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, loading, error } = useOptimizedMaintenance();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check for admin routes, maintenance page, and static files
    if (
      pathname.startsWith('/admin') ||
      pathname === '/maintenance' ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      setIsChecking(false);
      return;
    }

    // Check if maintenance status is loaded
    if (!loading && status) {
      // If store is in maintenance mode (offline) and not on maintenance page, redirect
      if (status.is_maintenance && pathname !== '/maintenance') {
        console.log('🔴 Store is in MAINTENANCE MODE - Redirecting to maintenance page');
        router.push('/maintenance');
      }
      setIsChecking(false);
    }
  }, [pathname, router, status, loading]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span className="text-white">Checking store status...</span>
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything
}
