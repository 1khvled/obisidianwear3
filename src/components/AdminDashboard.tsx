'use client';

import React from 'react';
import { 
  ShoppingCart, 
  Users, 
  Package,
  BarChart3,
  Archive,
  Settings
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

export default function AdminDashboard() {
  const { products } = useProducts();
  
  // Calculate real stats from actual data
  const totalProducts = products.length;
  const lowStockItems = products.filter(product => {
    const totalStock = Object.values(product.stock || {}).reduce((total, colorStock) => {
      return total + Object.values(colorStock).reduce((sum, qty) => sum + qty, 0);
    }, 0);
    return totalStock < 5; // Consider low stock if less than 5 total items
  }).length;

  const outOfStockItems = products.filter(product => !product.inStock).length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your store overview.</p>
      </div>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Products</p>
              <p className="text-white text-2xl font-bold mt-1">{totalProducts}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-600">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Low Stock Items</p>
              <p className="text-white text-2xl font-bold mt-1">{lowStockItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-600">
              <Archive size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Out of Stock</p>
              <p className="text-white text-2xl font-bold mt-1">{outOfStockItems}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-600">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Store Status</p>
              <p className="text-white text-2xl font-bold mt-1">Active</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600">
              <Settings size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'products' }))}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
          >
            <Package className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Manage Products</span>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'inventory' }))}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
          >
            <Archive className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Inventory</span>
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'orders' }))}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
          >
            <ShoppingCart className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Orders</span>
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'customers' }))}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
          >
            <Users className="w-8 h-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Customers</span>
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'wilayas' }))}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
          >
            <Settings className="w-8 h-8 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Settings</span>
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'analytics' }))}
            className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
          >
            <BarChart3 className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm font-medium">Analytics</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Archive className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-yellow-300 font-semibold">Low Stock Alert</h3>
              <p className="text-yellow-200/80 text-sm">
                {lowStockItems} product{lowStockItems > 1 ? 's' : ''} running low on stock. Check inventory to restock.
              </p>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'inventory' }))}
              className="ml-auto bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              View Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}