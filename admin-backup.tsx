'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import InventoryManager from '@/components/InventoryManager';

export default function AdminPage() {
  const [showInventoryManager, setShowInventoryManager] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Load inventory data
  const loadInventory = async () => {
    try {
      setInventoryLoading(true);
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.data);
      } else {
        console.error('Failed to load inventory:', data.error);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-6">
        <h1 className="text-3xl font-bold text-white">OBSIDIAN Admin Panel</h1>
        <p className="text-gray-400">Inventory Management System</p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Prominent Inventory Manager Button */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-6 mb-6 border border-blue-500/50">
          <div className="text-center">
            <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">📦 Inventory Management System</h2>
            <p className="text-gray-300 mb-6">Complete inventory control with real-time database integration</p>
            <button 
              onClick={() => {
                console.log('🖱️ Inventory Manager button clicked!');
                setShowInventoryManager(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg text-xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 border-yellow-400"
              style={{ zIndex: 1000, position: 'relative' }}
            >
              <Package className="w-6 h-6 mr-3 inline" />
              🚀 OPEN INVENTORY MANAGER 🚀
            </button>
            <p className="text-gray-400 mt-4 text-sm">
              Access detailed inventory management, stock editing, and real-time updates
            </p>
          </div>
        </div>

        {/* Inventory Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Inventory Items</p>
                <p className="text-3xl font-bold text-white">
                  {inventoryLoading ? '...' : inventory.length}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {inventoryLoading ? '...' : inventory.filter(item => 
                    item.available_quantity <= item.min_stock_level && item.available_quantity > 0
                  ).length}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Out of Stock</p>
                <p className="text-3xl font-bold text-red-400">
                  {inventoryLoading ? '...' : inventory.filter(item => 
                    item.available_quantity === 0
                  ).length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Simple message directing users to the inventory manager */}
        <div className="text-center py-12">
          <Package className="w-20 h-20 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Use the Inventory Manager Above</h3>
          <p className="text-gray-400 text-lg">Click the "Open Inventory Manager" button above to access detailed inventory management with real-time database integration.</p>
        </div>
      </div>

      {/* Inventory Manager Modal */}
      {showInventoryManager && (
        <div>
          <InventoryManager onClose={() => {
            setShowInventoryManager(false);
          }} />
        </div>
      )}
    </div>
  );
}
