'use client';

import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, Edit3, Save, X } from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  image?: string;
}

interface SimpleInventoryManagerProps {
  onClose: () => void;
}

export default function SimpleInventoryManager({ onClose }: SimpleInventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Load inventory data
  const loadInventory = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading inventory...');
      
      const response = await fetch(`/api/inventory?t=${Date.now()}&_cb=${Math.random()}&_force=${Math.random()}&_r=${Math.random()}&_v=${Math.random()}&_vercel=${Math.random()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Cache-Bust': Date.now().toString(),
          'X-No-Cache': 'true',
          'X-Random': Math.random().toString(),
          'X-Vercel-Cache': 'MISS',
          'X-Vercel-Id': Math.random().toString(36),
          'CDN-Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
      });
      
      const data = await response.json();
      console.log('📦 Inventory response:', data);
      
      if (data.success && data.data) {
        // Transform the data to our simple format
        const simpleInventory: InventoryItem[] = data.data.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          size: item.size,
          color: item.color,
          quantity: item.quantity || 0,
          image: item.products?.image
        }));
        
        console.log('✅ Loaded inventory:', simpleInventory.length, 'items');
        setInventory(simpleInventory);
      } else {
        console.error('❌ Failed to load inventory:', data.error);
        setInventory([]);
      }
    } catch (error) {
      console.error('❌ Error loading inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Update inventory quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setSaving(true);
      console.log('🔄 Updating quantity for', itemId, 'to', newQuantity);
      
      const response = await fetch(`/api/inventory/${itemId}?t=${Date.now()}&_cb=${Math.random()}&_force=${Math.random()}&_r=${Math.random()}&_v=${Math.random()}&_vercel=${Math.random()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Cache-Bust': Date.now().toString(),
          'X-No-Cache': 'true',
          'X-Random': Math.random().toString(),
          'X-Vercel-Cache': 'MISS',
          'X-Vercel-Id': Math.random().toString(36),
          'CDN-Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        },
        body: JSON.stringify({
          quantity: newQuantity,
          reason: 'Manual update',
          createdBy: 'admin'
        }),
      });

      const data = await response.json();
      console.log('📡 Update response:', data);
      
      if (data.success) {
        console.log('✅ Update successful!');
        
        // Update local state immediately
        setInventory(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        
        setEditingItem(null);
        setEditQuantity(0);
        
        // Force a complete refresh from server to ensure consistency
        console.log('🔄 Forcing immediate server refresh to ensure consistency...');
        // Small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 200));
        // Force multiple refreshes to bypass Vercel caching
        await loadInventory();
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadInventory();
        console.log('✅ Server refresh completed');
        
        // Show success message without alert popup
        console.log('✅ Inventory updated successfully!');
      } else {
        console.error('❌ Update failed:', data.error);
        alert(`Update failed: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating inventory:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Start editing
  const startEdit = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditQuantity(item.quantity);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditQuantity(0);
  };

  // Save edit
  const saveEdit = () => {
    if (editingItem && editQuantity >= 0) {
      updateQuantity(editingItem, editQuantity);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingItem) {
      saveEdit();
    } else if (e.key === 'Escape' && editingItem) {
      cancelEdit();
    }
  };

  // Load inventory on mount
  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Simple Inventory Manager</h2>
                <p className="text-gray-400">Edit quantities • Press Enter to save, Escape to cancel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadInventory}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading inventory...</p>
              </div>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No inventory items found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="text-white font-medium">{item.product_name}</h3>
                        <p className="text-gray-400 text-sm">
                          {item.size} • {item.color}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {editingItem === item.id ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                            onKeyDown={handleKeyPress}
                            className="w-24 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
                            min="0"
                            autoFocus
                            placeholder="0"
                          />
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium"
                          >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-medium text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
