'use client';

import { useUserProducts } from '@/context/UserProductContext';

export default function CacheTestPage() {
  const { products, loading, lastUpdated, timeUntilRefresh, refreshProducts } = useUserProducts();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🛒 User Cache Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cache Status */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📊 Cache Status</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</p>
              <p><strong>Products Count:</strong> {products.length}</p>
              <p><strong>Last Updated:</strong> {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</p>
              <p><strong>Time Until Refresh:</strong> {timeUntilRefresh}s</p>
            </div>
            <button 
              onClick={refreshProducts}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              🔄 Force Refresh
            </button>
          </div>

          {/* Products List */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📦 Products ({products.length})</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800 p-3 rounded">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-400">${product.price}</p>
                </div>
              ))}
              {products.length === 0 && !loading && (
                <p className="text-gray-400">No products found</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 How the System Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>ALWAYS downloads from database first</strong> - Every page load fetches fresh data</li>
            <li><strong>Then uses cached data</strong> - If cache is valid (less than 1 minute old), shows cached data</li>
            <li><strong>Updates cache in background</strong> - Fresh data is cached for next time</li>
            <li><strong>Auto-refresh every minute</strong> - Cache expires and fetches fresh data again</li>
            <li><strong>Admin always fresh</strong> - Admin page never uses cache, always gets latest data</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-800 rounded">
            <p className="text-sm font-medium">🔍 Check browser console to see the download process!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
