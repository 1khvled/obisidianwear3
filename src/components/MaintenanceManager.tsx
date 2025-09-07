'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Power, PowerOff, Eye, Loader2 } from 'lucide-react';

export default function MaintenanceManager() {
  const [dropDate, setDropDate] = useState('');
  const [storeStatus, setStoreStatus] = useState(true); // true = open, false = maintenance
  const [dropTime, setDropTime] = useState('00:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaintenanceSettings();
  }, []);

  const loadMaintenanceSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      const settings = await response.json();
      
      if (settings.drop_date) {
        const date = new Date(settings.drop_date);
        setDropDate(date.toISOString().split('T')[0]);
        setDropTime(date.toTimeString().slice(0, 5));
      } else {
        const today = new Date();
        const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
        setDropDate(futureDate.toISOString().split('T')[0]);
        setDropTime('00:00');
      }
      
      setStoreStatus(settings.is_maintenance_mode === false);
    } catch (error) {
      console.error('Error loading maintenance settings:', error);
      // Fallback to default values
      const today = new Date();
      const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      setDropDate(futureDate.toISOString().split('T')[0]);
      setDropTime('00:00');
      setStoreStatus(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeChange = async () => {
    try {
      setSaving(true);
      const combinedDateTime = `${dropDate}T${dropTime}:00`;
      
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop_date: combinedDateTime
        }),
      });
      
      if (response.ok) {
        alert('Drop date updated successfully!');
      } else {
        throw new Error('Failed to update drop date');
      }
    } catch (error) {
      console.error('Error updating drop date:', error);
      alert('Failed to update drop date. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStoreStatus = async () => {
    try {
      setSaving(true);
      const newStatus = !storeStatus;
      
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_maintenance_mode: !newStatus
        }),
      });
      
      if (response.ok) {
        setStoreStatus(newStatus);
        if (!newStatus) {
          alert('Store is now in MAINTENANCE MODE. Customers will see the maintenance page.');
        } else {
          alert('Store is now OPEN. Customers can shop normally.');
        }
      } else {
        throw new Error('Failed to update store status');
      }
    } catch (error) {
      console.error('Error updating store status:', error);
      alert('Failed to update store status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const previewMaintenance = () => {
    window.open('/maintenance', '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-gray-400">Loading maintenance settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Maintenance & Store Control</h1>
        <p className="text-gray-400">Manage store availability and drop dates</p>
      </div>

      {/* Store Status */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
              {storeStatus ? (
                <Power className="w-6 h-6 text-green-400 mr-2" />
              ) : (
                <PowerOff className="w-6 h-6 text-red-400 mr-2" />
              )}
              Store Status
            </h2>
            <p className="text-gray-400">
              {storeStatus ? 
                'Store is currently OPEN - customers can browse and purchase' : 
                'Store is in MAINTENANCE MODE - customers see maintenance page'
              }
            </p>
          </div>
          <button
            onClick={toggleStoreStatus}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
              storeStatus 
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800' 
                : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800'
            }`}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{storeStatus ? 'Turn OFF Store' : 'Turn ON Store'}</span>
          </button>
        </div>
      </div>

      {/* Drop Date Configuration */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="w-6 h-6 text-blue-400 mr-2" />
          Drop Date Configuration
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Drop Date
              </label>
              <input
                type="date"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Drop Time
              </label>
              <input
                type="time"
                value={dropTime}
                onChange={(e) => setDropTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDateTimeChange}
              disabled={saving}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-800"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 mr-2" />
              )}
              Update Drop Date
            </button>
            
            <button
              onClick={previewMaintenance}
              className="flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview Maintenance Page
            </button>
          </div>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-xl font-bold text-white mb-4">Current Settings</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Store Status</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              storeStatus 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {storeStatus ? '🟢 OPEN' : '🔴 MAINTENANCE'}
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Next Drop</h3>
            <p className="text-gray-300">
              {new Date(`${dropDate}T${dropTime}`).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-yellow-300 font-semibold">Important Notes</h3>
            <ul className="text-yellow-200/80 text-sm mt-2 space-y-1">
              <li>• When store is OFF, all visitors see the maintenance page</li>
              <li>• Admin panel remains accessible at /admin</li>
              <li>• Drop date shows on maintenance page with live countdown</li>
              <li>• Changes take effect immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
