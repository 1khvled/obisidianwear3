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
  BarChart3,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Activity
} from 'lucide-react';
import { backendService } from '@/services/backendService';

interface InventoryManagerProps {
  onClose: () => void;
}

// Local interface since inventory table has been removed
interface InventoryRecord {
  id: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

interface EditingItem extends InventoryRecord {
  isUpdating?: boolean;
}

export default function InventoryManager({ onClose }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Load inventory data with default colors and sizes
  const loadInventory = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();
      const requestId = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔄 DEBUG: Starting loadInventory at', new Date().toISOString(), 'timestamp:', timestamp);
      
      // Add multiple cache-busting parameters to ensure fresh data
      const response = await fetch(`/api/inventory?t=${timestamp}&_cb=${Math.random()}&req=${requestId}&v=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': requestId
        }
      });
      console.log('🔄 DEBUG: Fetch response status:', response.status, 'ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('🔍 DEBUG: Inventory API Response:', {
        success: data.success,
        dataLength: data.data?.length,
        firstItem: data.data?.[0],
        message: data.message,
        timestamp: data.timestamp,
        debug: data.debug
      });
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('✅ DEBUG: Setting inventory data with', data.data.length, 'items');
        console.log('✅ DEBUG: First few items:', data.data.slice(0, 3));
        
        // Force state update with functional update to ensure React detects the change
        setInventory(prevInventory => {
          // Only update if data is actually different
          if (JSON.stringify(prevInventory) !== JSON.stringify(data.data)) {
            console.log('✅ DEBUG: Inventory data changed, updating state');
            return data.data;
          } else {
            console.log('✅ DEBUG: Inventory data unchanged, keeping current state');
            return prevInventory;
          }
        });
        
        setLastUpdateTime(new Date());
        console.log('✅ DEBUG: Inventory state updated successfully');
      } else {
        console.log('📦 DEBUG: Inventory table is empty, loading products with default colors and sizes...');
        await loadProductsWithDefaults();
      }
    } catch (error) {
      console.error('❌ DEBUG: Error loading inventory:', error);
      // Try fallback method
      try {
        await loadProductsWithDefaults();
      } catch (fallbackError) {
        console.error('❌ DEBUG: Fallback method also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      console.log('🔄 DEBUG: loadInventory completed, loading set to false');
    }
  };

  // Load products for reference
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 DEBUG: Manual refresh triggered at', new Date().toISOString());
    try {
      await Promise.all([loadInventory(), loadProducts()]);
      console.log('✅ DEBUG: Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ DEBUG: Manual refresh failed:', error);
    } finally {
      setRefreshing(false);
      console.log('🔄 DEBUG: Manual refresh finished, refreshing set to false');
    }
  };

  // Debug function to check current state
  const debugCurrentState = () => {
    console.log('🔍 DEBUG: Current inventory state:', {
      inventoryLength: inventory.length,
      firstItem: inventory[0],
      loading,
      refreshing,
      productsLength: products.length,
      timestamp: new Date().toISOString()
    });
  };

  // Load products and create inventory records with default colors and sizes
  const loadProductsWithDefaults = async () => {
    try {
      console.log('🔄 Loading products with default colors and sizes (v2)...');
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/products?t=${Date.now()}`);
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
    loadProducts();
  }, []);

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(item => {
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
      
      const matchesLowStock = !showLowStockOnly || item.quantity <= item.min_stock_level;
      const matchesOutOfStock = !showOutOfStockOnly || item.quantity === 0;
      
      return matchesSearch && matchesStatus && matchesLowStock && matchesOutOfStock;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.products?.name || '';
          bValue = b.products?.name || '';
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'status':
          aValue = getStockStatus(a);
          bValue = getStockStatus(b);
          break;
        default:
          aValue = a.products?.name || '';
          bValue = b.products?.name || '';
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
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
      
      console.log('🔄 DEBUG: Starting updateQuantity for item:', {
        id: item.id,
        productId: item.product_id,
        size: item.size,
        color: item.color,
        currentQuantity: item.quantity,
        newQuantity,
        reason: reason || 'Manual adjustment'
      });
      
      // Create a unique request ID to prevent caching issues
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`/api/inventory/${item.id}?t=${Date.now()}&_cb=${Math.random()}&req=${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': requestId
        },
        body: JSON.stringify({
          quantity: newQuantity,
          reason: reason || 'Manual adjustment',
          createdBy: 'admin'
        }),
      });

      console.log('🔄 DEBUG: API response status:', response.status, 'ok:', response.ok);
      const data = await response.json();
      
      console.log('📡 DEBUG: API Response:', data);
      
      if (data.success) {
        console.log('✅ DEBUG: API update successful, updating local state...');
        
        // Update local state immediately with optimistic update
        setInventory(prevInventory => 
          prevInventory.map(inv => 
            inv.id === item.id 
              ? { 
                  ...inv, 
                  quantity: newQuantity,
                  available_quantity: newQuantity,
                  last_updated: new Date().toISOString()
                }
              : inv
          )
        );
        
        console.log('✅ DEBUG: Local state updated successfully');
        
        // Force refresh inventory data to ensure consistency
        console.log('🔄 DEBUG: Force refreshing inventory data after update...');
        try {
          const refreshResponse = await fetch('/api/inventory/refresh', {
            method: 'POST',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setInventory(refreshData.data);
              console.log('✅ DEBUG: Inventory force refreshed successfully');
            }
          }
        } catch (refreshError) {
          console.error('❌ DEBUG: Force refresh failed:', refreshError);
        }
        
        // Update last update time
        setLastUpdateTime(new Date());
        
        setEditingItem(null);
        setReason('');
        setNewQuantity(0);
        
        console.log('✅ DEBUG: Inventory updated successfully!');
        alert('Inventory updated successfully!');
      } else {
        console.error('❌ DEBUG: Failed to update inventory:', data.error);
        alert(`Failed to update inventory: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ DEBUG: Error updating inventory:', error);
      alert(`Error updating inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingItem(prev => prev ? { ...prev, isUpdating: false } : null);
      console.log('🔄 DEBUG: updateQuantity completed');
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

  // Handle item selection
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredInventory.length 
        ? [] 
        : filteredInventory.map(item => item.id)
    );
  };

  // Bulk operations
  const handleBulkUpdate = async (newQuantity: number, reason: string) => {
    try {
      const promises = selectedItems.map(itemId => {
        const item = inventory.find(i => i.id === itemId);
        if (item) {
          return updateQuantity(item, newQuantity);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      
      // No need for final refresh - optimistic updates handle the UI
      console.log('✅ DEBUG: Bulk update completed, relying on optimistic updates');
      
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error in bulk update:', error);
    }
  };

  // Export inventory to CSV
  const handleExportInventory = () => {
    try {
      const csvContent = [
        ['Product Name', 'Size', 'Color', 'Quantity', 'Status', 'Min Stock', 'Max Stock', 'Last Updated'].join(','),
        ...filteredInventory.map(item => [
          `"${item.products?.name || 'Unknown'}"`,
          item.size,
          item.color,
          item.quantity,
          getStockStatus(item),
          item.min_stock_level,
          item.max_stock_level,
          new Date(item.last_updated).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      alert('Failed to export inventory');
    }
  };

  // Calculate statistics
  const stats = {
    total: inventory.length,
    inStock: inventory.filter(item => item.quantity > item.min_stock_level).length,
    lowStock: inventory.filter(item => item.quantity <= item.min_stock_level && item.quantity > 0).length,
    outOfStock: inventory.filter(item => item.quantity === 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * (item.products?.price || 0)), 0)
  };

  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

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
                {lastUpdateTime && (
                  <p className="text-xs text-green-400">
                    Last updated: {lastUpdateTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportInventory}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Items</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.inStock}</div>
              <div className="text-sm text-gray-400">In Stock</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats.lowStock}</div>
              <div className="text-sm text-gray-400">Low Stock</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-red-400">{stats.outOfStock}</div>
              <div className="text-sm text-gray-400">Out of Stock</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">{stats.totalValue.toLocaleString()} DA</div>
              <div className="text-sm text-gray-400">Total Value</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col gap-4">
            {/* Search and Main Filters */}
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
              
              {/* Main Filter */}
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

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="quantity-desc">Quantity High-Low</option>
                <option value="quantity-asc">Quantity Low-High</option>
                <option value="status-asc">Status</option>
              </select>
              
              <button
                onClick={debugCurrentState}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
              >
                🔍 Debug State
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                🔄 Force Reload
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showLowStockOnly 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Low Stock Only
              </button>
              <button
                onClick={() => setShowOutOfStockOnly(!showOutOfStockOnly)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showOutOfStockOnly 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <XCircle className="w-4 h-4 inline mr-1" />
                Out of Stock Only
              </button>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <span className="text-blue-300 text-sm">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <input
                    type="number"
                    placeholder="New quantity"
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-32"
                    id="bulkQuantity"
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-40"
                    id="bulkReason"
                  />
                  <button
                    onClick={() => {
                      const quantity = parseInt((document.getElementById('bulkQuantity') as HTMLInputElement)?.value || '0');
                      const reason = (document.getElementById('bulkReason') as HTMLInputElement)?.value || 'Bulk update';
                      if (quantity >= 0) {
                        handleBulkUpdate(quantity, reason);
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Update All
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
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
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </th>
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
                      Last Updated
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
                      <tr key={item.id} className="hover:bg-gray-700/50" data-inventory-item={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                          />
                        </td>
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium" data-quantity={item.quantity}>{item.quantity}</span>
                            <span className="text-xs text-gray-400">
                              (min: {item.min_stock_level})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(item.last_updated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNewQuantity(item.quantity);
                            }}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                            title="Edit quantity"
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
