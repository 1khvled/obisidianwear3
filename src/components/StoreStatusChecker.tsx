'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function StoreStatusChecker() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip check for admin routes, maintenance page, and static files
    if (
      pathname.startsWith('/admin') ||
      pathname === '/maintenance' ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return;
    }

    // Check store status from localStorage
    const storeStatus = localStorage.getItem('obsidian-store-status');
    
    // If store is OFF (false) and not on maintenance page, redirect to maintenance
    if (storeStatus === 'false' && pathname !== '/maintenance') {
      console.log('🔴 Store is OFF - Redirecting to maintenance page');
      router.push('/maintenance');
    }
  }, [pathname, router]);

  return null; // This component doesn't render anything
}
