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

interface EditingItem extends InventoryRecord {
  isUpdating?: boolean;
}

export default function InventoryManager({ onClose }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState('');

  // Load inventory data with default colors and sizes
  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      console.log('🔍 Inventory API Response:', {
        success: data.success,
        dataLength: data.data?.length,
        firstItem: data.data?.[0],
        fullResponse: data
      });
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('✅ Setting inventory data:', data.data);
        setInventory(data.data);
      } else {
        console.log('📦 Inventory table is empty, loading products with default colors and sizes...');
        await loadProductsWithDefaults();
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      await loadProductsWithDefaults();
    } finally {
      setLoading(false);
    }
  };

  // Load products and create inventory records with default colors and sizes
  const loadProductsWithDefaults = async () => {
    try {
      console.log('🔄 Loading products with default colors and sizes (v2)...');
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success && data.data) {
        const inventoryData: InventoryRecord[] = [];
        
        data.data.forEach((product: any) => {
          console.log('🔍 Processing product:', {
            id: product.id,
            name: product.name,
            hasStock: !!product.stock,
            stock: product.stock,
            stockKeys: product.stock ? Object.keys(product.stock) : [],
            colors: product.colors,
            sizes: product.sizes
          });
          
          const defaultColors = ['Black', 'White', 'Red', 'Blue', 'Green'];
          const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
          
          const colors = product.colors && product.colors.length > 0 ? product.colors : defaultColors;
          const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;
          
          console.log(`🎨 Using colors:`, colors);
          console.log(`📏 Using sizes:`, sizes);
          
          sizes.forEach((size: string) => {
            colors.forEach((color: string) => {
              let quantity = 0;
              
              console.log(`🔍 Checking stock for ${size} ${color}:`);
              console.log(`  - product.stock exists:`, !!product.stock);
              console.log(`  - product.stock[${size}] exists:`, !!(product.stock && product.stock[size]));
              console.log(`  - product.stock[${size}][${color}] exists:`, !!(product.stock && product.stock[size] && product.stock[size][color]));
              
              if (product.stock && typeof product.stock === 'object' && product.stock[size] && product.stock[size][color]) {
                quantity = product.stock[size][color];
                console.log(`  - Found quantity:`, quantity);
              } else {
                console.log(`  - No stock data found, using 0`);
              }
              
              console.log(`📦 Final stock for ${product.name} ${size} ${color}:`, quantity);
              inventoryData.push({
                id: `INV-${product.id}-${size}-${color}`,
                product_id: product.id,
                size,
                color,
                quantity,
                reserved_quantity: 0,
                available_quantity: quantity,
                min_stock_level: 5,
                max_stock_level: 100,
                last_updated: new Date().toISOString(),
                created_at: product.createdAt || new Date().toISOString(),
                updated_at: product.updatedAt || new Date().toISOString()
              });
            });
          });
        });
        
        console.log(`✅ Loaded ${inventoryData.length} inventory records with default colors and sizes (v2)`);
        setInventory(inventoryData);
      } else {
        console.error('❌ Failed to load products:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading products with defaults:', error);
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
      matchesStatus = item.quantity <= item.min_stock_level;
    } else if (filterStatus === 'out') {
      matchesStatus = item.quantity === 0;
    } else if (filterStatus === 'in-stock') {
      matchesStatus = item.quantity > item.min_stock_level;
    }
    
    return matchesSearch && matchesStatus;
  });

  console.log('🔍 Inventory Debug:', {
    inventoryLength: inventory.length,
    filteredLength: filteredInventory.length,
    firstInventoryItem: inventory[0],
    firstFilteredItem: filteredInventory[0],
    searchQuery,
    filterStatus
  });

  // Update inventory quantity
  const updateQuantity = async (item: InventoryRecord, newQuantity: number) => {
    try {
      setEditingItem(prev => prev ? { ...prev, isUpdating: true } : null);
      
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_AUTH_TOKEN || 'obsidian-api-token-2025'}`
        },
        body: JSON.stringify({
          quantity: newQuantity,
          reason: reason || 'Manual adjustment',
          createdBy: 'admin'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setInventory(prev => 
          prev.map(inv => 
            inv.id === item.id 
              ? { 
                  ...inv, 
                  quantity: newQuantity,
                  available_quantity: newQuantity,
                  updated_at: new Date().toISOString()
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
        alert(`Failed to update inventory: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert(`Error updating inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingItem(prev => prev ? { ...prev, isUpdating: false } : null);
    }
  };

  // Get stock status
  const getStockStatus = (item: InventoryRecord) => {
    if (item.quantity === 0) return 'out';
    if (item.quantity <= item.min_stock_level) return 'low';
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
    <div className="inventory-manager-modal bg-black/70 p-4">
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
          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Inventory Found</h3>
              <p className="text-gray-400 mb-4">
                {inventory.length === 0 
                  ? "No inventory data available. The inventory table might be empty."
                  : "No items match your current search or filter criteria."
                }
              </p>
              {inventory.length === 0 && (
                <button
                  onClick={loadInventory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Loading Inventory
                </button>
              )}
            </div>
          ) : (
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
                    Stock
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
          )}
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]" style={{ zIndex: 10000 }}>
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Update Inventory - {editingItem.products?.name}
                </h3>
                {editingItem.isUpdating && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
              </div>
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
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                      newQuantity < 0 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-700 focus:ring-blue-500'
                    }`}
                    min="0"
                  />
                  {newQuantity < 0 && (
                    <p className="text-red-400 text-sm mt-1">Quantity cannot be negative</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Change
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional reason..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
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
                  disabled={editingItem.isUpdating || newQuantity < 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {editingItem?.isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
