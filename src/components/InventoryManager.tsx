'use client';

import React, { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Eye,
  Archive
} from 'lucide-react';

export default function InventoryManager() {
  const { products, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low-stock' | 'out-of-stock' | 'in-stock'>('all');
  type NestedStock = Record<string, Record<string, number>>; // size -> color -> qty
  const [editingStock, setEditingStock] = useState<Record<string, NestedStock>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const totalStock = getTotalStock(product);
    
    switch (filterStatus) {
      case 'low-stock':
        return totalStock > 0 && totalStock < 5;
      case 'out-of-stock':
        return totalStock === 0 || !product.inStock;
      case 'in-stock':
        return totalStock >= 5 && product.inStock;
      default:
        return true;
    }
  });

  function getTotalStock(product: Product): number {
    if (!product.stock) return 0;
    return Object.values(product.stock).reduce((total, colorStock) => {
      return total + Object.values(colorStock).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  }

  function getStockForSizeColor(productId: string, size: string, color: string): number {
    const product = products.find(p => p.id === productId);
    if (editingStock[productId]?.[size]?.[color] !== undefined) {
      return editingStock[productId][size][color];
    }
    return product?.stock?.[size]?.[color] || 0;
  }

  function updateStockValue(productId: string, size: string, color: string, newValue: number) {
    setEditingStock(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: {
          ...prev[productId]?.[size],
          [color]: Math.max(0, newValue)
        }
      }
    }));
    setHasChanges(true);
  }

  function saveChanges() {
    if (Object.keys(editingStock).length === 0) {
      alert('No stock changes to save.');
      return;
    }

    try {
      Object.entries(editingStock).forEach(([productId, stockChanges]) => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          console.error('Product not found:', productId);
          return;
        }

        const newStock: NestedStock = product.stock ? { ...product.stock } : {};
        Object.entries(stockChanges).forEach(([size, colorStock]) => {
          Object.entries(colorStock).forEach(([color, quantity]) => {
            if (!newStock[size]) newStock[size] = {};
            newStock[size][color] = quantity;
          });
        });

        const totalStock = Object.values(newStock).reduce((total, colorStock) => {
          return total + Object.values(colorStock).reduce((sum, qty) => sum + qty, 0);
        }, 0);

        const updatedProduct = {
          ...product,
          stock: newStock,
          inStock: totalStock > 0,
          updatedAt: new Date()
        };

        console.log('Updating product stock:', productId, updatedProduct.name, 'Total stock:', totalStock);
        updateProduct(productId, updatedProduct);
      });

      setEditingStock({});
      setHasChanges(false);
      alert('Stock updated successfully!');
    } catch (err) {
      console.error('Inventory save error', err);
      alert('Error saving stock. Please refresh and try again.');
    }
  }

  function discardChanges() {
    setEditingStock({});
    setHasChanges(false);
  }

  function getStockStatus(totalStock: number, inStock: boolean) {
    if (!inStock || totalStock === 0) {
      return { status: 'out-of-stock', color: 'text-red-400', bg: 'bg-red-900/20', icon: XCircle };
    } else if (totalStock < 5) {
      return { status: 'low-stock', color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: AlertTriangle };
    } else {
      return { status: 'in-stock', color: 'text-green-400', bg: 'bg-green-900/20', icon: CheckCircle };
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Manage stock levels for all products by size and color</p>
        </div>
        
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={discardChanges}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <XCircle size={16} />
              <span>Discard</span>
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {filteredProducts.map(product => {
          const totalStock = getTotalStock(product);
          const stockInfo = getStockStatus(totalStock, product.inStock);
          const StatusIcon = stockInfo.icon;

          return (
            <div key={product.id} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden">
              {/* Product Header */}
              <div className="p-6 border-b border-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-400 text-sm">SKU: {product.sku || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">Price: {product.price} DZD</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${stockInfo.bg}`}>
                      <StatusIcon size={16} className={stockInfo.color} />
                      <span className={`text-sm font-medium ${stockInfo.color}`}>
                        {totalStock} items
                      </span>
                    </div>
                    
                    <button
                      onClick={() => window.open(`/product/${product.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all"
                      title="View Product"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Management Grid */}
              <div className="p-6">
                <h4 className="text-white font-medium mb-4">Stock by Size & Color</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-400 text-sm font-medium py-2">Size</th>
                        {product.colors.map(color => (
                          <th key={color} className="text-center text-gray-400 text-sm font-medium py-2 min-w-[120px]">
                            {color}
                          </th>
                        ))}
                        <th className="text-center text-gray-400 text-sm font-medium py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizes.map(size => {
                        const sizeTotal = product.colors.reduce((total, color) => {
                          return total + getStockForSizeColor(product.id, size, color);
                        }, 0);

                        return (
                          <tr key={size} className="border-b border-gray-800/50">
                            <td className="text-white font-medium py-3">{size}</td>
                            {product.colors.map(color => {
                              const currentStock = getStockForSizeColor(product.id, size, color);
                              return (
                                <td key={color} className="py-3">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={() => updateStockValue(product.id, size, color, currentStock - 1)}
                                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                      disabled={currentStock <= 0}
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <input
                                      type="number"
                                      value={currentStock}
                                      onChange={(e) => updateStockValue(product.id, size, color, parseInt(e.target.value) || 0)}
                                      className="w-16 text-center bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white"
                                      min="0"
                                    />
                                    <button
                                      onClick={() => updateStockValue(product.id, size, color, currentStock + 1)}
                                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="text-center text-white font-medium py-3">{sizeTotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No products match the selected filter'}
          </p>
        </div>
      )}
    </div>
  );
}
