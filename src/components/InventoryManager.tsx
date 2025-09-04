'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { Edit, Save, X, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  inStock: boolean;
  stock: any;
  sizes: string[];
  colors: string[];
  totalStock: number;
  stockBySize: any;
}

interface InventoryManagerProps {
  onInventoryUpdate?: () => void;
}

export default function InventoryManager({ onInventoryUpdate }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getInventory();
      setInventory(data);
    } catch (err) {
      setError('Failed to load inventory');
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditingStock({ ...item.stock });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingStock({});
  };

  const updateStockValue = (size: string, color: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditingStock((prev: any) => ({
      ...prev,
      [size]: {
        ...prev[size],
        [color]: numValue
      }
    }));
  };

  const saveInventory = async (item: InventoryItem) => {
    try {
      setSaving(true);
      setError(null);
      
      const success = await inventoryService.updateInventory(item.id, {
        stock: editingStock,
        inStock: inventoryService.calculateTotalStock(editingStock) > 0
      });
      
      if (success) {
        setSuccess('Inventory updated successfully');
        setEditingItem(null);
        setEditingStock({});
        await loadInventory();
        onInventoryUpdate?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update inventory');
      }
    } catch (err) {
      setError('Failed to update inventory');
      console.error('Error updating inventory:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleInStock = async (item: InventoryItem) => {
    try {
      setSaving(true);
      setError(null);
      
      const success = await inventoryService.updateInStockStatus(item.id, !item.inStock);
      
      if (success) {
        setSuccess(`Product ${!item.inStock ? 'enabled' : 'disabled'} successfully`);
        await loadInventory();
        onInventoryUpdate?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update product status');
      }
    } catch (err) {
      setError('Failed to update product status');
      console.error('Error updating product status:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Package className="mr-2" />
          Inventory Management
        </h2>
        <button
          onClick={loadInventory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center">
          <AlertTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="mr-2" />
          {success}
        </div>
      )}

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-white font-semibold">Product</th>
                <th className="px-4 py-3 text-left text-white font-semibold">SKU</th>
                <th className="px-4 py-3 text-left text-white font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-white font-semibold">Total Stock</th>
                <th className="px-4 py-3 text-left text-white font-semibold">Stock by Size/Color</th>
                <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{item.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {item.sku || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {item.category}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleInStock(item)}
                      disabled={saving}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        item.inStock
                          ? 'bg-green-900/20 text-green-400 border border-green-500'
                          : 'bg-red-900/20 text-red-400 border border-red-500'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {item.totalStock}
                  </td>
                  <td className="px-4 py-3">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        {item.sizes.map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300 w-8">{size}:</span>
                            {item.colors.map((color) => (
                              <div key={color} className="flex items-center space-x-1">
                                <span className="text-xs text-gray-400">{color}:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={editingStock[size]?.[color] || 0}
                                  onChange={(e) => updateStockValue(size, color, e.target.value)}
                                  className="w-16 px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {item.sizes.map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300 w-8">{size}:</span>
                            {item.colors.map((color) => (
                              <span key={color} className="text-xs text-gray-400">
                                {color}: {item.stockBySize[size]?.[color] || 0}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingItem === item.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveInventory(item)}
                          disabled={saving}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(item)}
                        disabled={saving}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No products found. Add some products first.
        </div>
      )}
    </div>
  );
}