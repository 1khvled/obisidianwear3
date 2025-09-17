'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';

interface PreloadTestIndicatorProps {
  isPreloading: boolean;
  isPreloaded: boolean;
  preloadProgress: number;
  isMobile: boolean;
  connectionType: 'slow' | 'fast' | 'unknown';
}

export function PreloadTestIndicator({
  isPreloading,
  isPreloaded,
  preloadProgress,
  isMobile,
  connectionType
}: PreloadTestIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isPreloading && !isPreloaded) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          {isMobile ? (
            <Smartphone className="w-4 h-4 text-blue-400" />
          ) : (
            <Monitor className="w-4 h-4 text-green-400" />
          )}
          <span className="text-white text-sm font-medium">
            {isMobile ? 'Mobile' : 'Desktop'} Cache
          </span>
          {connectionType === 'slow' ? (
            <WifiOff className="w-3 h-3 text-red-400" />
          ) : (
            <Wifi className="w-3 h-3 text-green-400" />
          )}
        </div>

        {isPreloading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-white/80 text-xs">Preloading...</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                style={{ width: `${preloadProgress}%` }}
              />
            </div>
            <div className="text-xs text-white/60">
              {preloadProgress}% • {connectionType} connection
            </div>
          </div>
        )}

        {isPreloaded && (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-xs font-medium">
              Ready! ⚡
            </span>
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 text-xs text-white/60 hover:text-white/80 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>

        {showDetails && (
          <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/60 space-y-1">
            <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
            <div>Connection: {connectionType}</div>
            <div>Status: {isPreloaded ? 'Cached' : isPreloading ? 'Loading' : 'Pending'}</div>
            <div>Progress: {preloadProgress}%</div>
          </div>
        )}
      </div>
    </div>
  );
}
