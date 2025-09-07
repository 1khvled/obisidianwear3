'use client';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing
  start(label: string): void {
    this.metrics.set(label, performance.now());
  }

  // End timing and log
  end(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      console.warn(`Performance timer "${label}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);
    
    // Log performance metrics
    if (duration > 100) { // Log slow operations
      console.warn(`🐌 Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Measure function execution
  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  // Measure async function execution
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }

  // Get Web Vitals
  getWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('📊 LCP:', lastEntry.startTime.toFixed(2) + 'ms');
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('📊 FID:', entry.processingStart - entry.startTime + 'ms');
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('📊 CLS:', clsValue.toFixed(4));
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Export singleton instance
export const perfMonitor = PerformanceMonitor.getInstance();

// Initialize Web Vitals monitoring
if (typeof window !== 'undefined') {
  perfMonitor.getWebVitals();
}
