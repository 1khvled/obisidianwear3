// Optimized Maintenance Manager Component
'use client';

import React from 'react';
import { useOptimizedMaintenance } from '../hooks/useOptimizedMaintenance';

export default function OptimizedMaintenanceManager() {
  const {
    status,
    loading,
    error,
    toggleStatus,
    setStatus,
    refreshStatus,
    analytics
  } = useOptimizedMaintenance();

  const handleToggle = async () => {
    const success = await toggleStatus();
    if (success) {
      // Show success message
      const newStatus = status.is_maintenance ? 'offline' : 'online';
      alert(`Maintenance status changed to ${newStatus}`);
    } else {
      alert('Failed to update maintenance status');
    }
  };

  const handleSetStatus = async (newStatus: 'online' | 'offline') => {
    const success = await setStatus(newStatus);
    if (success) {
      alert(`Maintenance status set to ${newStatus}`);
    } else {
      alert('Failed to update maintenance status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading maintenance status...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Maintenance Management</h1>
        
        {/* Current Status Display */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Status</h2>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  !status.is_maintenance ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-2xl font-bold ${
                  !status.is_maintenance ? 'text-green-600' : 'text-red-600'
                }`}>
                  {!status.is_maintenance ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                Last updated: {new Date(status.updated_at || '').toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleToggle}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  !status.is_maintenance
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Switch to {!status.is_maintenance ? 'OFFLINE' : 'ONLINE'}
              </button>
              
              <button
                onClick={refreshStatus}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Status Buttons */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleSetStatus('online')}
              disabled={!status.is_maintenance}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                !status.is_maintenance
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Set Online
            </button>
            
            <button
              onClick={() => handleSetStatus('offline')}
              disabled={status.is_maintenance}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                status.is_maintenance
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Set Offline
            </button>
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.total_switches}</div>
                <div className="text-sm text-gray-600">Total Switches</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.current_status?.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Current Status</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.uptime_percentage}%
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {analytics.last_switch ? new Date(analytics.last_switch).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Last Switch</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
