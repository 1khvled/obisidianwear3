'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log performance metrics
        console.log('Performance Metric:', {
          name: entry.name,
          value: (entry as any).value || 0,
          timestamp: Date.now()
        });

        // Send to analytics (you can integrate with your preferred analytics)
        if (entry.name === 'CLS') {
          // Cumulative Layout Shift
          console.log('CLS:', (entry as any).value || 0);
        } else if (entry.name === 'FID') {
          // First Input Delay
          console.log('FID:', (entry as any).value || 0);
        } else if (entry.name === 'LCP') {
          // Largest Contentful Paint
          console.log('LCP:', (entry as any).value || 0);
        }
      }
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      observer.observe({ entryTypes: ['measure'] });
    }

    // Monitor page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('Page Load Time:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        });
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
