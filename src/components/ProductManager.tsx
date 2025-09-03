'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Trash2,
  Eye,
  Copy,
  MoreHorizontal,
  Star,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';
import ImageUpload from './ImageUpload';

interface ProductManagerProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductManager({ onAddProduct, onEditProduct, onDeleteProduct }: ProductManagerProps) {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Pants', 'Accessories'];

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Product];
      let bValue = b[sortBy as keyof Product];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
      selectedProducts.forEach(id => onDeleteProduct(id));
      setSelectedProducts([]);
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.stock) return { status: 'unknown', total: 0 };
    
    const total = Object.values(product.stock).reduce((acc, sizeStock) => {
      return acc + Object.values(sizeStock).reduce((sizeAcc, colorStock) => sizeAcc + colorStock, 0);
    }, 0);
    
    if (total === 0) return { status: 'out', total };
    if (total < 10) return { status: 'low', total };
    return { status: 'good', total };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
          <button 
            onClick={() => {
              const dataStr = JSON.stringify(products, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'obsidian-products.json';
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <label className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
            <Upload size={16} className="mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const importedProducts = JSON.parse(event.target?.result as string);
                      console.log('Imported products:', importedProducts);
                      // You could add these products to your context here
                      alert(`Successfully imported ${importedProducts.length} products!`);
                    } catch (error) {
                      alert('Error importing products. Please check the file format.');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
          <button
            onClick={onAddProduct}
            className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            <Plus size={16} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
              </select>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSortBy('name');
                  setSortOrder('asc');
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, description, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />
        </div>
        
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">{selectedProducts.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left text-white font-medium p-4">Product</th>
                <th className="text-left text-white font-medium p-4">SKU</th>
                <th className="text-left text-white font-medium p-4">Category</th>
                <th className="text-left text-white font-medium p-4">Price</th>
                <th className="text-left text-white font-medium p-4">Stock</th>
                <th className="text-left text-white font-medium p-4">Status</th>
                <th className="text-left text-white font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product);
                return (
                  <tr key={product.id} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 font-mono text-sm">{product.sku || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-white font-semibold">{product.price} DZD</span>
                        {product.originalPrice && (
                          <div className="text-gray-500 text-sm line-through">
                            {product.originalPrice} DZD
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{stockInfo.total}</span>
                        {stockInfo.status === 'out' && (
                          <AlertTriangle size={16} className="text-red-400" />
                        )}
                        {stockInfo.status === 'low' && (
                          <AlertTriangle size={16} className="text-yellow-400" />
                        )}
                        {stockInfo.status === 'good' && (
                          <CheckCircle size={16} className="text-green-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.inStock
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {product.inStock ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => window.open(`/product/${product.id}`, '_blank')}
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-all"
                          title="View Product"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const duplicatedProduct = {
                              ...product,
                              id: Date.now().toString(),
                              name: `${product.name} (Copy)`,
                              sku: `${product.sku}-COPY`,
                              createdAt: new Date(),
                              updatedAt: new Date()
                            };
                            onEditProduct(duplicatedProduct);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-all"
                          title="Duplicate Product"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
              Previous
            </button>
            <span className="px-3 py-1 bg-white text-black rounded font-medium">1</span>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
