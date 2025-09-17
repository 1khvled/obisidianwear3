'use client';

import { useEffect, useState } from 'react';
import { Bug, Database, Network, RefreshCw, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

export default function GlobalDebugger() {
  const [isVisible, setIsVisible] = useState(false);
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

  // Monitor fetch requests
  useEffect(() => {
    if (!isMonitoring) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      
      if (url.includes('/api/inventory')) {
        addLog('info', `🔄 API Call: ${url}`);
        
        try {
          const response = await originalFetch(...args);
          const data = await response.clone().json();
          
          if (url.includes('/api/inventory/') && args[1]?.method === 'PUT') {
            addLog('success', `✅ Inventory Updated: ${url}`, data);
          } else {
            addLog('info', `📦 Inventory Data: ${url}`, { count: data.data?.length || 0 });
          }
          
          setApiResponse(data);
          return response;
        } catch (error) {
          addLog('error', `❌ API Error: ${url}`, error);
          throw error;
        }
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isMonitoring]);

  // F12 keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  // Monitor inventory state changes
  useEffect(() => {
    if (!isMonitoring) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.querySelector('[data-inventory-item]')) {
                addLog('info', '🔄 Inventory DOM Updated');
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [isMonitoring]);

  // Test inventory update
  const testInventoryUpdate = async () => {
    addLog('info', '🧪 Testing inventory update...');
    
    try {
      const response = await fetch('/api/inventory-optimized', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'X-Test': 'true'
        }
      });
      
      const data = await response.json();
      addLog('success', '✅ Test API call successful', { count: data.data?.length || 0 });
    } catch (error) {
      addLog('error', '❌ Test API call failed', error);
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
      lastInventoryState
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('success', '📁 Logs exported');
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
      case 'success': return 'border-l-green-400 bg-green-400/10';
      case 'warning': return 'border-l-yellow-400 bg-yellow-400/10';
      case 'error': return 'border-l-red-400 bg-red-400/10';
      default: return 'border-l-blue-400 bg-blue-400/10';
    }
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Toggle Inventory Debugger"
      >
        {isVisible ? <EyeOff className="w-6 h-6" /> : <Bug className="w-6 h-6" />}
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-96 h-96 bg-black border border-red-500 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5" />
              <span className="font-semibold">Inventory Debugger</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`p-1 rounded ${isMonitoring ? 'bg-green-600' : 'bg-gray-600'}`}
                title={isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={testInventoryUpdate}
                className="p-1 bg-blue-600 rounded"
                title="Test API"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="p-2 bg-gray-800 border-b border-gray-700 flex space-x-2">
            <button
              onClick={clearLogs}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
            >
              Clear
            </button>
            <button
              onClick={exportLogs}
              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded"
            >
              Export
            </button>
            <div className="flex items-center space-x-1 text-xs text-gray-300">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span>{isMonitoring ? 'Monitoring' : 'Stopped'}</span>
            </div>
          </div>

          {/* Logs */}
          <div className="h-64 overflow-y-auto bg-gray-900">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No logs yet. Start monitoring to see activity.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border-l-4 ${getLogColor(log.type)}`}
                  >
                    <div className="flex items-start space-x-2">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-300">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-white mt-1">{log.message}</p>
                        {log.data && (
                          <details className="mt-1">
                            <summary className="text-xs text-gray-400 cursor-pointer">Data</summary>
                            <pre className="text-xs text-gray-300 mt-1 bg-gray-800 p-1 rounded overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
