'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function DataSyncIndicator() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDataSync = () => {
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('success');
        setLastSync(new Date().toLocaleTimeString());
        setTimeout(() => setSyncStatus('idle'), 2000);
      }, 1000);
    };

    const handleDataUpdate = () => {
      setSyncStatus('success');
      setLastSync(new Date().toLocaleTimeString());
      setTimeout(() => setSyncStatus('idle'), 2000);
    };

    window.addEventListener('data-sync', handleDataSync as EventListener);
    window.addEventListener('data-updated', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('data-sync', handleDataSync as EventListener);
      window.removeEventListener('data-updated', handleDataUpdate as EventListener);
    };
  }, []);

  if (syncStatus === 'idle' && !lastSync) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        syncStatus === 'syncing' 
          ? 'bg-blue-600 text-white' 
          : syncStatus === 'success'
          ? 'bg-green-600 text-white'
          : syncStatus === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-gray-600 text-white'
      }`}>
        {syncStatus === 'syncing' && (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>Syncing data...</span>
          </>
        )}
        {syncStatus === 'success' && (
          <>
            <CheckCircle size={16} />
            <span>Data synced</span>
          </>
        )}
        {syncStatus === 'error' && (
          <>
            <AlertCircle size={16} />
            <span>Sync failed</span>
          </>
        )}
        {syncStatus === 'idle' && lastSync && (
          <>
            <CheckCircle size={16} />
            <span>Last sync: {lastSync}</span>
          </>
        )}
      </div>
    </div>
  );
}
