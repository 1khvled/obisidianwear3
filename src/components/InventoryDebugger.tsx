'use client';

import { useEffect, useState } from 'react';
import { Bug, Database, Network, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

interface InventoryDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function InventoryDebugger({ isVisible, onToggle }: InventoryDebuggerProps) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [lastInventoryState, setLastInventoryState] = useState<any>(null);

  // Add log function
  const addLog = (type: DebugLog['type'], message: string, data?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  // Monitor inventory API calls
  useEffect(() => {
    if (!isMonitoring) return;

    // Override fetch to intercept inventory API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      
      if (url.includes('/api/inventory')) {
        addLog('info', `🔍 API Call: ${url}`, { url, args });
        
        try {
          const response = await originalFetch(...args);
          const responseClone = response.clone();
          
          // Log response details
          addLog('info', `📡 Response Status: ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });

          // Try to parse response body
          try {
            const data = await responseClone.json();
            setApiResponse(data);
            addLog('success', `✅ API Response Data`, data);
          } catch (e) {
            addLog('warning', `⚠️ Could not parse response JSON`, e);
          }

          return response;
        } catch (error) {
          addLog('error', `❌ API Call Failed`, error);
          throw error;
        }
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isMonitoring]);

  // Monitor inventory state changes
  useEffect(() => {
    if (!isMonitoring) return;

    const checkInventoryState = () => {
      // Try to find inventory data in the DOM or global state
      const inventoryElements = document.querySelectorAll('[data-inventory-item]');
      const currentState = Array.from(inventoryElements).map(el => ({
        id: el.getAttribute('data-inventory-item'),
        quantity: el.querySelector('[data-quantity]')?.textContent,
        timestamp: new Date().toISOString()
      }));

      if (currentState.length > 0) {
        setLastInventoryState(currentState);
        addLog('info', `📊 Inventory State Detected`, currentState);
      }
    };

    const interval = setInterval(checkInventoryState, 2000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Test inventory update function
  const testInventoryUpdate = async () => {
    addLog('info', '🧪 Testing inventory update...');
    
    try {
      // Find a test inventory item
      const testItem = document.querySelector('[data-inventory-item]');
      if (!testItem) {
        addLog('warning', '⚠️ No inventory items found for testing');
        return;
      }

      const itemId = testItem.getAttribute('data-inventory-item');
      const currentQuantity = testItem.querySelector('[data-quantity]')?.textContent;
      
      addLog('info', `🔧 Testing update for item: ${itemId}`, { currentQuantity });

      // Simulate an update
      const response = await fetch(`/api/inventory-optimized/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: parseInt(currentQuantity || '0') + 1,
          reason: 'Debug test update',
          createdBy: 'debugger'
        })
      });

      const data = await response.json();
      addLog(response.ok ? 'success' : 'error', 
        response.ok ? '✅ Test update successful' : '❌ Test update failed', 
        data);

    } catch (error) {
      addLog('error', '❌ Test update error', error);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('info', '🧹 Logs cleared');
  };

  // Export logs
  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      logs,
      apiResponse,
      lastInventoryState,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('success', '📁 Debug logs exported');
  };

  const getLogIcon = (type: DebugLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Database className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-900/10';
      case 'warning': return 'border-l-yellow-500 bg-yellow-900/10';
      case 'error': return 'border-l-red-500 bg-red-900/10';
      default: return 'border-l-blue-500 bg-blue-900/10';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Open Inventory Debugger"
      >
        <Bug className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bug className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Inventory Debugger</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-400">
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-700 flex flex-wrap gap-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          
          <button
            onClick={testInventoryUpdate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Test Update
          </button>
          
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Clear Logs
          </button>
          
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Export Logs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Logs Panel */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Debug Logs</h3>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No logs yet. Start monitoring to see debug information.</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${getLogColor(log.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{log.timestamp}</span>
                          <span className="text-sm text-white">{log.message}</span>
                        </div>
                        {log.data && (
                          <pre className="mt-2 text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-80 border-l border-gray-700 p-4 overflow-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Debug Info</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Last API Response</h4>
                <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto max-h-32">
                  {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'No API response yet'}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Last Inventory State</h4>
                <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto max-h-32">
                  {lastInventoryState ? JSON.stringify(lastInventoryState, null, 2) : 'No inventory state detected'}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Environment</h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>URL: {window.location.href}</div>
                  <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                  <div>Timestamp: {new Date().toISOString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
