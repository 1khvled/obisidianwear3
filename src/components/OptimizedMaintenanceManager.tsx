// Optimized Maintenance Manager Component
'use client';

import React, { useState, useEffect } from 'react';
import { useOptimizedMaintenance } from '../hooks/useOptimizedMaintenance';
import { Calendar, Clock, Save } from 'lucide-react';

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

  // Drop date state
  const [dropDate, setDropDate] = useState('');
  const [dropTime, setDropTime] = useState('00:00');
  const [dropDateLoading, setDropDateLoading] = useState(false);

  // Load drop date settings
  useEffect(() => {
    const loadDropDate = async () => {
      try {
        const response = await fetch('/api/maintenance');
        const data = await response.json();
        
        if (data && data.drop_date) {
          const date = new Date(data.drop_date);
          setDropDate(date.toISOString().split('T')[0]);
          setDropTime(date.toTimeString().slice(0, 5));
        } else {
          // Default to 30 days from now
          const today = new Date();
          const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
          setDropDate(futureDate.toISOString().split('T')[0]);
          setDropTime('00:00');
        }
      } catch (error) {
        console.error('Error loading drop date:', error);
        // Set defaults on error
        const today = new Date();
        const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        setDropDate(futureDate.toISOString().split('T')[0]);
        setDropTime('00:00');
      }
    };

    loadDropDate();
  }, []);

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

  const handleDropDateChange = async () => {
    if (!dropDate || !dropTime) {
      alert('Please select both date and time');
      return;
    }

    setDropDateLoading(true);
    try {
      const dateTime = new Date(`${dropDate}T${dropTime}`);
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop_date: dateTime.toISOString(),
        }),
      });

      if (response.ok) {
        alert('Drop date updated successfully!');
      } else {
        throw new Error('Failed to update drop date');
      }
    } catch (error) {
      console.error('Error updating drop date:', error);
      alert('Failed to update drop date');
    } finally {
      setDropDateLoading(false);
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

        {/* Drop Date Configuration */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            Drop Date Configuration
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Drop Date
                </label>
                <input
                  type="date"
                  value={dropDate}
                  onChange={(e) => setDropDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Drop Time
                </label>
                <input
                  type="time"
                  value={dropTime}
                  onChange={(e) => setDropTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDropDateChange}
                disabled={dropDateLoading}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
              >
                {dropDateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Drop Date
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
                  setDropDate(futureDate.toISOString().split('T')[0]);
                  setDropTime('00:00');
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Clock className="w-4 h-4 mr-2 inline" />
                Set to 30 Days
              </button>
            </div>
            
            {dropDate && dropTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Selected Drop Date:</strong> {new Date(`${dropDate}T${dropTime}`).toLocaleString()}
                </p>
              </div>
            )}
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
