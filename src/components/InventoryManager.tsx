'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { InventoryRecord } from '@/lib/inventoryService';

interface InventoryManagerProps {
  onClose: () => void;
}

export default function InventoryManager({ onClose }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingItem, setEditingItem] = useState<InventoryRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState('');

  // Load inventory data
  const loadInventory = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filter inventory based on search and status
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.products?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'low') {
      matchesStatus = item.available_quantity <= item.min_stock_level;
    } else if (filterStatus === 'out') {
      matchesStatus = item.available_quantity === 0;
    } else if (filterStatus === 'in-stock') {
      matchesStatus = item.available_quantity > item.min_stock_level;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Update inventory quantity
  const updateQuantity = async (item: InventoryRecord, newQuantity: number) => {
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity,
          reason: reason || 'Manual adjustment',
          createdBy: 'admin'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with the response data (includes auto-calculated available_quantity)
        setInventory(prev => 
          prev.map(inv => 
            inv.id === item.id 
              ? { 
                  ...inv, 
                  quantity: data.data.quantity,
                  available_quantity: data.data.available_quantity,
                  reserved_quantity: data.data.reserved_quantity,
                  updated_at: data.data.updated_at
                }
              : inv
          )
        );
        setEditingItem(null);
        setReason('');
        setNewQuantity(0);
        console.log('✅ Inventory updated successfully!');
      } else {
        console.error('Failed to update inventory:', data.error);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  // Get stock status
  const getStockStatus = (item: InventoryRecord) => {
    if (item.available_quantity === 0) return 'out';
    if (item.available_quantity <= item.min_stock_level) return 'low';
    return 'in-stock';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-400 bg-red-900/20';
      case 'low': return 'text-yellow-400 bg-yellow-900/20';
      case 'in-stock': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out': return <XCircle className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      case 'in-stock': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-lg">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-white">Loading inventory...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="inventory-manager-modal bg-black/70 p-4" 
    >
      <div className="bg-gray-900 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl border border-gray-700 relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
      <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                <p className="text-gray-400">Manage product stock levels and track inventory</p>
              </div>
            </div>
        <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
        >
              <XCircle className="w-6 h-6" />
        </button>
      </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products, sizes, or colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
              
              <button
                onClick={loadInventory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.products?.image && (
                            <img
                              src={item.products.image}
                              alt={item.products.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">
                              {item.products?.name || 'Unknown Product'}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {item.product_id}
                              </div>
                          </div>
                      </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.color}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {item.available_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                              </span>
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setNewQuantity(item.quantity);
                          }}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                  </td>
                </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]" style={{ zIndex: 10000 }}>
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Update Inventory - {editingItem.products?.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Size: {editingItem.size} | Color: {editingItem.color}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Quantity: {editingItem.quantity}
                  </label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Stock received, Manual adjustment"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setReason('');
                      setNewQuantity(0);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateQuantity(editingItem, newQuantity)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}
      </div>
    </div>
  );
}